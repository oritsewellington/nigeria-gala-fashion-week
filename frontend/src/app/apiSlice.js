import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithErrorHandling } from '../lib/baseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ['Category', 'Contestant', 'Transaction', 'Settings', 'User', 'Leaderboard', 'PublicStats', 'Sponsor'],
  endpoints: () => ({}),
});
