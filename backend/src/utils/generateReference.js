const crypto = require("crypto");

/**
 * Paystack-safe reference. The VOTE- prefix is how the shared Paystack webhook knows
 * this payment belongs to the voting site (ticket payments start with TKT-).
 * e.g. VOTE-1AF3C9D2E7B04F6A-LQ3K9X
 */
const generateReference = () => {
  const random = crypto.randomBytes(8).toString("hex").toUpperCase();
  const short = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VOTE-${random}-${short}`;
};

module.exports = generateReference;
