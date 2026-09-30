import { apiSlice } from '../../app/apiSlice';

export const sponsorsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSponsors: builder.query({
      query: (params) => ({ url: '/sponsors', params }),
      providesTags: (result) =>
        result?.data?.sponsors
          ? [...result.data.sponsors.map(({ _id }) => ({ type: 'Sponsor', id: _id })), { type: 'Sponsor', id: 'LIST' }]
          : [{ type: 'Sponsor', id: 'LIST' }],
    }),
    createSponsor: builder.mutation({
      query: (formData) => ({ url: '/sponsors', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Sponsor', id: 'LIST' }],
    }),
    updateSponsor: builder.mutation({
      query: ({ id, formData }) => ({ url: `/sponsors/${id}`, method: 'PATCH', body: formData }),
      invalidatesTags: [{ type: 'Sponsor', id: 'LIST' }],
    }),
    deleteSponsor: builder.mutation({
      query: (id) => ({ url: `/sponsors/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Sponsor', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSponsorsQuery,
  useCreateSponsorMutation,
  useUpdateSponsorMutation,
  useDeleteSponsorMutation,
} = sponsorsApi;
