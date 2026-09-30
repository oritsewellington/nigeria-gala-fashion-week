import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { useGetCategoryBySlugQuery } from '../../features/categories/categoriesApi';
import { useGetContestantsQuery } from '../../features/contestants/contestantsApi';
import { CardSkeleton } from '../../components/ui/Loaders';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNumber } from '../../lib/formatters';

export default function CategoryDetail() {
  const { slug } = useParams();
  const [search, setSearch] = useState('');

  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
    error: categoryErrObj,
  } = useGetCategoryBySlugQuery(slug);

  const {
    data: contestantsData,
    isLoading: contestantsLoading,
    isError: contestantsError,
    error: contestantsErrObj,
    refetch,
  } = useGetContestantsQuery({ category: slug, search: search || undefined, limit: 60 });

  const category = categoryData?.data?.category;
  const contestants = contestantsData?.data?.contestants || [];

  if (categoryError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ErrorState message={getErrorMessage(categoryErrObj)} />
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-ink-800 bg-ink-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-400 mb-4">
            <ArrowLeft className="w-4 h-4" />
            All categories
          </Link>
          {categoryLoading ? (
            <div className="h-9 w-64 bg-ink-800 rounded animate-pulse" />
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{category?.name}</h1>
              {category?.description && <p className="text-ink-400 max-w-2xl">{category.description}</p>}
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative max-w-sm mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contestants..."
            className="w-full bg-ink-900 border border-ink-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>

        {contestantsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : contestantsError ? (
          <ErrorState message={getErrorMessage(contestantsErrObj)} onRetry={refetch} />
        ) : contestants.length === 0 ? (
          <EmptyState title="No contestants found" message="Try a different search, or check back once contestants are added." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {contestants.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/contestant/${c._id}`}
                  className="group block rounded-2xl overflow-hidden border border-ink-800 hover:border-gold-500/40 transition-colors"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-ink-900">
                    <img
                      src={c.photo?.url}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5">
                    <p className="font-semibold text-ink-50 text-sm truncate">{c.name}</p>
                    <p className="text-gold-400 text-xs font-semibold mt-1">
                      {formatNumber(c.voteCount)} votes
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
