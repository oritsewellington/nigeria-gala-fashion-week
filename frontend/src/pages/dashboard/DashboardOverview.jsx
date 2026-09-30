import { Link } from 'react-router-dom';
import { Vote, Wallet, Users, FolderKanban, TrendingUp, Crown } from 'lucide-react';
import { useGetOverviewQuery } from '../../features/dashboard/dashboardApi';
import { PageLoader } from '../../components/ui/Loaders';
import { ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNaira, formatNumber } from '../../lib/formatters';
import StatCard from '../../components/dashboard/StatCard';
import VotingStatusBadge from '../../components/public/VotingStatusBadge';
import { useVotingStatus } from '../../hooks/useVotingStatus';

export default function DashboardOverview() {
  const { data, isLoading, isError, error, refetch } = useGetOverviewQuery();
  const { status, timeLeft } = useVotingStatus();

  if (isLoading) return <PageLoader label="Loading dashboard..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const stats = data?.data;
  const maxTrendVotes = Math.max(...(stats?.dailyTrend?.map((d) => d.votes) || [1]), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-ink-400 text-sm mt-1">Real-time voting &amp; revenue summary</p>
        </div>
        {status && <VotingStatusBadge status={status} timeLeft={timeLeft} />}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Votes" value={formatNumber(stats.totalVotes)} icon={Vote} accent="gold" />
        <StatCard label="Total Revenue" value={formatNaira(stats.totalRevenue)} icon={Wallet} accent="emerald" />
        <StatCard label="Contestants" value={formatNumber(stats.contestantCount)} icon={Users} accent="sky" />
        <StatCard label="Categories" value={formatNumber(stats.categoryCount)} icon={FolderKanban} accent="rose" />
      </div>

      {/* Transparency split */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="font-semibold text-ink-50 mb-1">Revenue Split (Transparency)</h2>
        <p className="text-ink-500 text-xs mb-5">
          Every vote's payment is split automatically and recorded per transaction.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-ink-950/50 border border-ink-800 p-4">
            <p className="text-ink-500 text-xs mb-1">Gross Revenue</p>
            <p className="text-xl font-bold text-ink-50">{formatNaira(stats.totalRevenue)}</p>
          </div>
          <div className="rounded-xl bg-gold-500/5 border border-gold-500/20 p-4">
            <p className="text-gold-400 text-xs mb-1">Platform Share ({stats.platformSharePercent}%)</p>
            <p className="text-xl font-bold text-gold-300">{formatNaira(stats.platformShare)}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
            <p className="text-emerald-400 text-xs mb-1">Host Share ({100 - stats.platformSharePercent}%)</p>
            <p className="text-xl font-bold text-emerald-300">{formatNaira(stats.hostShare)}</p>
          </div>
        </div>
        <Link to="/dashboard/payouts" className="inline-block mt-4 text-sm text-gold-400 hover:text-gold-300">
          View full payout breakdown by category →
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top contestants */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-semibold text-ink-50 mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-gold-400" /> Top Contestants
          </h2>
          {stats.topContestants?.length === 0 ? (
            <p className="text-ink-500 text-sm">No contestants yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topContestants.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="text-ink-500 text-sm font-bold w-4">{i + 1}</span>
                  <img src={c.photo?.url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-100 truncate">{c.name}</p>
                    <p className="text-xs text-ink-500 truncate">{c.category?.name}</p>
                  </div>
                  <span className="text-sm font-bold text-gold-400">{formatNumber(c.voteCount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7-day trend */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-semibold text-ink-50 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-400" /> Votes — Last 7 Days
          </h2>
          {stats.dailyTrend?.length === 0 ? (
            <p className="text-ink-500 text-sm">No votes recorded in the last 7 days.</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {stats.dailyTrend.map((d) => (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-gold-600 to-gold-300 rounded-t-md"
                    style={{ height: `${Math.max((d.votes / maxTrendVotes) * 100, 4)}%` }}
                  />
                  <span className="text-[10px] text-ink-500">{d._id.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
