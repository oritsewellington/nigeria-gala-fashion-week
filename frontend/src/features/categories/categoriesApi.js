import { apiSlice } from '../../app/apiSlice';

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (params) => ({ url: '/categories', params }),
      providesTags: (result) =>
        result?.data?.categories
          ? [
              ...result.data.categories.map(({ _id }) => ({ type: 'Category', id: _id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    getCategoryBySlug: builder.query({
      query: (slug) => `/categories/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Category', id: slug }],
    }),
    createCategory: builder.mutation({
      query: (formData) => ({ url: '/categories', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, formData }) => ({ url: `/categories/${id}`, method: 'PATCH', body: formData }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
