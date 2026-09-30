/**
 * Consistent success response shape across the whole API so the
 * frontend can rely on { success, message, data } everywhere.
 */
const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

module.exports = sendResponse;
