import { apiSlice } from '../../app/apiSlice';

export const contestantsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContestants: builder.query({
      query: (params) => ({ url: '/contestants', params }),
      providesTags: (result) =>
        result?.data?.contestants
          ? [
              ...result.data.contestants.map(({ _id }) => ({ type: 'Contestant', id: _id })),
              { type: 'Contestant', id: 'LIST' },
            ]
          : [{ type: 'Contestant', id: 'LIST' }],
    }),
    getContestant: builder.query({
      query: (id) => `/contestants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contestant', id }],
    }),
    getLeaderboard: builder.query({
      query: (categorySlug) => `/contestants/leaderboard/${categorySlug}`,
      providesTags: (result, error, categorySlug) => [{ type: 'Leaderboard', id: categorySlug }],
    }),
    createContestant: builder.mutation({
      query: (formData) => ({ url: '/contestants', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Contestant', id: 'LIST' }, { type: 'Category', id: 'LIST' }],
    }),
    updateContestant: builder.mutation({
      query: ({ id, formData }) => ({ url: `/contestants/${id}`, method: 'PATCH', body: formData }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Contestant', id }, { type: 'Contestant', id: 'LIST' }],
    }),
    deleteContestant: builder.mutation({
      query: (id) => ({ url: `/contestants/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Contestant', id: 'LIST' }, { type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetContestantsQuery,
  useGetContestantQuery,
  useGetLeaderboardQuery,
  useCreateContestantMutation,
  useUpdateContestantMutation,
  useDeleteContestantMutation,
} = contestantsApi;
