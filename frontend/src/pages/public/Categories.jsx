import { motion } from "framer-motion";
import { useGetCategoriesQuery } from "../../features/categories/categoriesApi";
import { CardSkeleton } from "../../components/ui/Loaders";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { getErrorMessage } from "../../lib/getErrorMessage";
import CategoryCard from "../../components/public/CategoryCard";

export default function Categories() {
  const { data, isLoading, isError, error, refetch } = useGetCategoriesQuery();
  const categories = data?.data?.categories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">All Categories</h1>
        <p className="text-ink-400 max-w-xl mx-auto">
          Choose a category to see its contestants and cast your vote.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          message="Categories will appear here once they're added by the organizers."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <CategoryCard category={cat} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
