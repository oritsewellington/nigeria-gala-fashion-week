import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base query pointed at our API. Sends cookies (JWT lives in an
 * httpOnly cookie) and normalizes every error response into the
 * shape { status, message } so UI code never has to guess what
 * a failure looks like.
 */
export const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
});

/**
 * Wraps rawBaseQuery so that:
 * - Network failures (server unreachable, timeout) get a friendly message
 * - Server error payloads ({ success:false, message }) are surfaced consistently
 * - We never show raw fetch/DB errors to the UI
 */
export const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const { status, data } = result.error;

    let message = 'Something went wrong. Please try again.';

    if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
      message = 'Unable to reach the server. Please check your connection and try again.';
    } else if (status === 404) {
      message = data?.message || 'The requested resource was not found.';
    } else if (status === 500 || status === 502 || status === 503) {
      message = 'Something went wrong on our end. Please try again shortly.';
    } else if (data?.message) {
      message = data.message;
    }

    result.error.message = message;
  }

  return result;
};
