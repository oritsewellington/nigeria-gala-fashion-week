import { apiSlice } from '../../app/apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    createHost: builder.mutation({
      query: (body) => ({ url: '/auth/create-host', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    getUsers: builder.query({
      query: () => '/auth/users',
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({ url: `/auth/users/${id}/status`, method: 'PATCH', body: { isActive } }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation({
      query: (body) => ({ url: '/auth/update-password', method: 'PATCH', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useCreateHostMutation,
  useUpdatePasswordMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} = authApi;
