const AppError = require('./AppError');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackFetch = async (path, options = {}) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    // Paystack sends a human-readable message; safe to forward
    throw new AppError(data.message || 'Payment provider error. Please try again.', 502, 'PAYSTACK_ERROR');
  }

  return data;
};

/**
 * Initializes a transaction with Paystack and returns the
 * authorization_url the client should redirect/popup to.
 */
const initializeTransaction = async ({ email, amountKobo, reference, metadata, callbackUrl }) => {
  const data = await paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email,
      amount: amountKobo, // Paystack expects amount in kobo
      reference,
      metadata,
      callback_url: callbackUrl,
    }),
  });

  return data.data; // { authorization_url, access_code, reference }
};

/**
 * Verifies a transaction reference server-side. This is the ONLY
 * source of truth for whether a payment succeeded — never trust
 * the client's redirect status alone.
 */
const verifyTransaction = async (reference) => {
  const data = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
  });

  return data.data; // { status: 'success'|'failed', amount, channel, gateway_response, ... }
};

module.exports = { initializeTransaction, verifyTransaction };
