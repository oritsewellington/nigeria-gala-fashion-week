const crypto = require('crypto');

/**
 * Generates a unique, Paystack-safe reference like:
 * NGFW-1AF3C9D2E7B04F6A-LQ3K9X
 */
const generateReference = () => {
  const random = crypto.randomBytes(8).toString('hex').toUpperCase();
  const short = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NGFW-${random}-${short}`;
};

module.exports = generateReference;
