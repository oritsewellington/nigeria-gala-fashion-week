import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { useGetLeaderboardQuery } from '../../features/contestants/contestantsApi';
import { useLiveLeaderboard } from '../../hooks/useLiveLeaderboard';
import { useVotingStatus } from '../../hooks/useVotingStatus';
import { PageLoader } from '../../components/ui/Loaders';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNumber } from '../../lib/formatters';
import VotingStatusBadge from '../../components/public/VotingStatusBadge';

const rankStyles = {
  1: { icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/30' },
  2: { icon: Medal, color: 'text-ink-200', bg: 'bg-ink-700/40 border-ink-600' },
  3: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-700/10 border-amber-700/30' },
};

export default function Leaderboard() {
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];
  const [activeSlug, setActiveSlug] = useState(null);
  const { status, timeLeft } = useVotingStatus();

  useEffect(() => {
    if (!activeSlug && categories.length > 0) setActiveSlug(categories[0].slug);
  }, [categories, activeSlug]);

  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    isError,
    error,
    refetch,
  } = useGetLeaderboardQuery(activeSlug, { skip: !activeSlug });

  useLiveLeaderboard(activeSlug);

  const board = leaderboardData?.data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          {status === 'ended' ? 'Final Results' : 'Live Leaderboard'}
        </h1>
        <p className="text-ink-400 mb-4">
          {status === 'ended'
            ? 'Voting has closed. Here are the final standings.'
            : 'Standings update instantly as votes come in.'}
        </p>
        {status && (
          <div className="flex justify-center">
            <VotingStatusBadge status={status} timeLeft={timeLeft} />
          </div>
        )}
      </div>

      {categoriesLoading ? (
        <PageLoader />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setActiveSlug(cat.slug)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeSlug === cat.slug
                    ? 'bg-gold-500/15 border-gold-500/40 text-gold-300'
                    : 'border-ink-800 text-ink-400 hover:bg-ink-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {leaderboardLoading ? (
            <PageLoader label="Loading standings..." />
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : !board || board.contestants.length === 0 ? (
            <EmptyState title="No contestants in this category yet" />
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {board.contestants.map((c) => {
                  const style = rankStyles[c.rank] || { icon: null, color: 'text-ink-400', bg: 'bg-ink-900 border-ink-800' };
                  const RankIcon = style.icon;
                  return (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ layout: { duration: 0.4 } }}
                      className={`rounded-2xl border p-4 flex items-center gap-4 ${style.bg}`}
                    >
                      <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm bg-ink-950/40">
                        {RankIcon ? <RankIcon className={`w-5 h-5 ${style.color}`} /> : c.rank}
                      </div>
                      <img
                        src={c.photo?.url}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border border-ink-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink-50 text-sm truncate">{c.name}</p>
                        <div className="w-full h-1.5 bg-ink-800 rounded-full mt-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${c.percentage}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-ink-50 text-sm">{formatNumber(c.voteCount)}</p>
                        <p className="text-xs text-ink-500">{c.percentage}%</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
