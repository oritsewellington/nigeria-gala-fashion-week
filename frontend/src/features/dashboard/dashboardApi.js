import { apiSlice } from '../../app/apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: () => '/dashboard/overview',
      providesTags: ['Transaction'],
    }),
    getTransactions: builder.query({
      query: (params) => ({ url: '/dashboard/transactions', params }),
      providesTags: (result) =>
        result?.data?.transactions
          ? [
              ...result.data.transactions.map(({ _id }) => ({ type: 'Transaction', id: _id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),
    getPayoutSummary: builder.query({
      query: () => '/dashboard/payouts',
      providesTags: ['Transaction'],
    }),
  }),
});

export const { useGetOverviewQuery, useGetTransactionsQuery, useGetPayoutSummaryQuery } = dashboardApi;
