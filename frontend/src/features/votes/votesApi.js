import { apiSlice } from '../../app/apiSlice';

export const votesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializeVote: builder.mutation({
      query: (body) => ({ url: '/votes/initialize', method: 'POST', body }),
    }),
    verifyVote: builder.query({
      query: (reference) => `/votes/verify/${reference}`,
      providesTags: ['Leaderboard'],
    }),
  }),
});

export const { useInitializeVoteMutation, useLazyVerifyVoteQuery } = votesApi;
