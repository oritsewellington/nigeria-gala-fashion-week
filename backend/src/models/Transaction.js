const mongoose = require('mongoose');

/**
 * One document per Paystack payment attempt.
 * status: pending -> created, waiting for user to complete payment
 *         success -> verified with Paystack, votes have been credited
 *         failed  -> payment failed or was abandoned
 * The 90/10 split is snapshotted at creation time (platformSharePercent)
 * so historical records stay accurate even if the split % changes later.
 */
const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    contestant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contestant',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    voteQuantity: {
      type: Number,
      required: true,
      min: [1, 'Must purchase at least 1 vote'],
    },
    unitPrice: {
      type: Number,
      required: true, // NGN, snapshotted from settings at time of purchase
    },
    amount: {
      type: Number,
      required: true, // voteQuantity * unitPrice, in NGN
    },
    platformSharePercent: {
      type: Number,
      required: true, // e.g. 10
    },
    platformShareAmount: {
      type: Number,
      required: true,
    },
    hostShareAmount: {
      type: Number,
      required: true,
    },
    payerName: {
      type: String,
      trim: true,
      default: '',
    },
    payerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    payerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },
    paystackChannel: {
      type: String,
      default: null, // card, bank, ussd, etc.
    },
    gatewayResponse: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
