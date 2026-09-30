/**
 * RTK Query mutation .unwrap() rejects with the error object our
 * baseQueryWithErrorHandling already attached a clean `.message` to.
 * This just centralizes the fallback chain for toast messages.
 */
export const getErrorMessage = (err) =>
  err?.message || err?.data?.message || 'Something went wrong. Please try again.';
