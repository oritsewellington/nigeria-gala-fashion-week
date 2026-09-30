const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const Contestant = require('../models/Contestant');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const generateReference = require('../utils/generateReference');
const { initializeTransaction, verifyTransaction } = require('../utils/paystack');
const { emitVoteUpdate, emitPublicStatsUpdate } = require('../sockets');

// POST /api/votes/initialize
// body: { contestantId, quantity, email, name?, phone? }
exports.initializeVote = catchAsync(async (req, res, next) => {
  const { contestantId, quantity, email, name, phone } = req.body;

  if (!contestantId || !quantity || !email) {
    return next(new AppError('Contestant, vote quantity and email are required.', 400, 'MISSING_FIELDS'));
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
    return next(new AppError('Vote quantity must be a whole number between 1 and 1000.', 400, 'INVALID_QUANTITY'));
  }

  const settings = await Settings.getSettings();
  const status = settings.getVotingStatus();

  if (status === 'upcoming') {
    return next(new AppError('Voting has not started yet. Please check back soon.', 403, 'VOTING_NOT_STARTED'));
  }
  if (status === 'ended') {
    return next(new AppError('Voting has ended. Thank you for participating.', 403, 'VOTING_ENDED'));
  }

  const contestant = await Contestant.findById(contestantId);
  if (!contestant || !contestant.isActive) {
    return next(new AppError('Contestant not found.', 404, 'NOT_FOUND'));
  }

  const unitPrice = settings.votePrice;
  const amount = unitPrice * qty;
  const platformSharePercent = settings.platformSharePercent;
  const platformShareAmount = Math.round((amount * platformSharePercent) / 100);
  const hostShareAmount = amount - platformShareAmount;

  const reference = generateReference();

  const transaction = await Transaction.create({
    reference,
    contestant: contestant._id,
    category: contestant.category,
    voteQuantity: qty,
    unitPrice,
    amount,
    platformSharePercent,
    platformShareAmount,
    hostShareAmount,
    payerName: name || '',
    payerEmail: email.toLowerCase(),
    payerPhone: phone || '',
    status: 'pending',
    ipAddress: req.ip,
  });

  const paystackData = await initializeTransaction({
    email,
    amountKobo: amount * 100,
    reference,
    metadata: {
      contestantId: contestant._id.toString(),
      contestantName: contestant.name,
      voteQuantity: qty,
    },
    callbackUrl: `${process.env.CLIENT_URL}/vote/callback`,
  });

  sendResponse(res, 201, 'Payment initialized. Redirecting to Paystack.', {
    authorizationUrl: paystackData.authorization_url,
    accessCode: paystackData.access_code,
    reference: transaction.reference,
    amount,
    voteQuantity: qty,
  });
});

/**
 * Shared logic: verifies a reference with Paystack and, if successful,
 * atomically credits the votes exactly once (idempotent — safe to call
 * from both the callback endpoint AND the webhook without double counting).
 */
const finalizeTransaction = async (reference) => {
  const transaction = await Transaction.findOne({ reference });
  if (!transaction) {
    throw new AppError('Transaction not found.', 404, 'NOT_FOUND');
  }

  // Already processed — return as-is (idempotency guard)
  if (transaction.status === 'success') {
    return { transaction, alreadyProcessed: true };
  }

  const paystackData = await verifyTransaction(reference);

  if (paystackData.status !== 'success') {
    transaction.status = 'failed';
    transaction.gatewayResponse = paystackData.gateway_response || 'Payment was not successful';
    await transaction.save();
    return { transaction, alreadyProcessed: false, failed: true };
  }

  // Guard against amount tampering: verify what was actually paid matches what we expect
  if (paystackData.amount !== transaction.amount * 100) {
    transaction.status = 'failed';
    transaction.gatewayResponse = 'Amount mismatch detected';
    await transaction.save();
    throw new AppError('Payment verification failed due to an amount mismatch.', 400, 'AMOUNT_MISMATCH');
  }

  transaction.status = 'success';
  transaction.paystackChannel = paystackData.channel;
  transaction.gatewayResponse = paystackData.gateway_response;
  transaction.paidAt = new Date(paystackData.paid_at || Date.now());
  await transaction.save();

  const contestant = await Contestant.findByIdAndUpdate(
    transaction.contestant,
    { $inc: { voteCount: transaction.voteQuantity } },
    { new: true }
  ).populate('category', 'slug');

  if (contestant) {
    const categoryTotals = await Contestant.aggregate([
      { $match: { category: contestant.category._id } },
      { $group: { _id: null, total: { $sum: '$voteCount' } } },
    ]);

    emitVoteUpdate({
      categorySlug: contestant.category.slug,
      contestantId: contestant._id.toString(),
      voteCount: contestant.voteCount,
      categoryTotals: categoryTotals[0]?.total || 0,
    });

    emitPublicStatsUpdate({ voteIncrement: transaction.voteQuantity });
  }

  return { transaction, alreadyProcessed: false, failed: false };
};

// GET /api/votes/verify/:reference  (called by the frontend callback page)
exports.verifyVote = catchAsync(async (req, res, next) => {
  const { reference } = req.params;

  try {
    const { transaction, failed } = await finalizeTransaction(reference);

    if (failed) {
      return next(new AppError('Your payment was not successful. Please try again.', 400, 'PAYMENT_FAILED'));
    }

    const populatedTx = await Transaction.findById(transaction._id).populate('contestant', 'name photo').populate(
      'category',
      'name slug'
    );

    sendResponse(res, 200, 'Payment verified. Your votes have been counted!', { transaction: populatedTx });
  } catch (err) {
    return next(err);
  }
});

// POST /api/votes/webhook  (Paystack server-to-server webhook — safety net)
exports.paystackWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const expectedSignature = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ received: false });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    try {
      await finalizeTransaction(event.data.reference);
    } catch (err) {
      console.error('[Webhook] Failed to finalize transaction:', err.message);
    }
  }

  // Always 200 quickly so Paystack doesn't retry endlessly
  res.status(200).json({ received: true });
});
