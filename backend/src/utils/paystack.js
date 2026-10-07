const AppError = require("./AppError");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackFetch = async (path, options = {}) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,

    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

      "Content-Type": "application/json",

      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    throw new AppError(
      data.message || "Payment provider error. Please try again.",
      502,
      "PAYSTACK_ERROR",
    );
  }

  return data;
};

const initializeTransaction = async ({
  email,
  amountKobo,
  reference,
  metadata,
  callbackUrl,
}) => {
  const data = await paystackFetch("/transaction/initialize", {
    method: "POST",

    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
      metadata,
      callback_url: callbackUrl,
    }),
  });

  return data.data;
};

/**
 * Server-side Paystack verification.
 *
 * The returned transaction contains the actual
 * transaction information, including the fee.
 */
const verifyTransaction = async (reference) => {
  const data = await paystackFetch(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
    },
  );

  return data.data;
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
};
