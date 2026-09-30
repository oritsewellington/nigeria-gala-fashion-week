import { apiSlice } from '../../app/apiSlice';

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSettings: builder.query({
      query: () => '/settings/public',
      providesTags: ['Settings'],
    }),
    getPublicStats: builder.query({
      query: () => '/settings/public-stats',
      providesTags: ['PublicStats'],
    }),
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (formData) => ({ url: '/settings', method: 'PATCH', body: formData }),
      invalidatesTags: ['Settings'],
    }),
    deleteHeroImage: builder.mutation({
      query: (publicId) => ({ url: `/settings/hero-image/${encodeURIComponent(publicId)}`, method: 'DELETE' }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetPublicSettingsQuery,
  useGetPublicStatsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useDeleteHeroImageMutation,
} = settingsApi;
