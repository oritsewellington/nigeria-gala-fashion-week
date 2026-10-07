import { Link } from "react-router-dom";

import {
  Vote,
  Wallet,
  Users,
  FolderKanban,
  TrendingUp,
  Crown,
} from "lucide-react";

import { useGetOverviewQuery } from "../../features/dashboard/dashboardApi";

import { PageLoader } from "../../components/ui/Loaders";

import { ErrorState } from "../../components/ui/States";

import { getErrorMessage } from "../../lib/getErrorMessage";

import { formatNaira, formatNumber } from "../../lib/formatters";

import StatCard from "../../components/dashboard/StatCard";

import VotingStatusBadge from "../../components/public/VotingStatusBadge";

import { useVotingStatus } from "../../hooks/useVotingStatus";

export default function DashboardOverview() {
  const { data, isLoading, isError, error, refetch } = useGetOverviewQuery();

  const { status, timeLeft } = useVotingStatus();

  if (isLoading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  }

  const stats = data?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>

          <p className="text-ink-400 text-sm mt-1">
            Real-time voting, payment &amp; revenue summary
          </p>
        </div>

        {status && <VotingStatusBadge status={status} timeLeft={timeLeft} />}
      </div>
      {/* Main statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Votes"
          value={formatNumber(stats.totalVotes)}
          icon={Vote}
          accent="gold"
        />

        <StatCard
          label="Gross Revenue"
          value={formatNaira(stats.grossRevenue)}
          icon={Wallet}
          accent="emerald"
        />

        <StatCard
          label="Contestants"
          value={formatNumber(stats.contestantCount)}
          icon={Users}
          accent="sky"
        />

        <StatCard
          label="Categories"
          value={formatNumber(stats.categoryCount)}
          icon={FolderKanban}
          accent="rose"
        />
      </div>
      {/* Revenue accounting */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="font-semibold text-ink-50 mb-1">
          Revenue &amp; Payment Fees
        </h2>

        <p className="text-ink-500 text-xs mb-5">
          Paystack fees are deducted first. The remaining amount is then split
          between the host and platform.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Gross */}
          <div className="rounded-xl border border-white/5 p-4">
            <p className="text-ink-500 text-xs">Gross Revenue</p>

            <p className="text-xl font-bold text-ink-50 mt-1">
              {formatNaira(stats.grossRevenue)}
            </p>

            <p className="text-xs text-ink-500 mt-1">Paid by customers</p>
          </div>

          {/* Paystack fees */}
          <div className="rounded-xl border border-white/5 p-4">
            <p className="text-ink-500 text-xs">Paystack Fees</p>

            <p className="text-xl font-bold text-ink-50 mt-1">
              {formatNaira(stats.paystackFees)}
            </p>

            <p className="text-xs text-ink-500 mt-1">Payment processing</p>
          </div>

          {/* Net */}
          <div className="rounded-xl border border-white/5 p-4">
            <p className="text-ink-500 text-xs">Net Revenue</p>

            <p className="text-xl font-bold text-emerald-400 mt-1">
              {formatNaira(stats.netRevenue)}
            </p>

            <p className="text-xs text-ink-500 mt-1">After Paystack fees</p>
          </div>

          {/* Platform */}
          <div className="rounded-xl border border-white/5 p-4">
            <p className="text-ink-500 text-xs">
              Platform Share ({stats.platformSharePercent}%)
            </p>

            <p className="text-xl font-bold text-ink-50 mt-1">
              {formatNaira(stats.platformShare)}
            </p>

            <p className="text-xs text-ink-500 mt-1">From net revenue</p>
          </div>

          {/* Host */}
          <div className="rounded-xl border border-white/5 p-4">
            <p className="text-ink-500 text-xs">
              Host Share ({100 - stats.platformSharePercent}%)
            </p>

            <p className="text-xl font-bold text-ink-50 mt-1">
              {formatNaira(stats.hostShare)}
            </p>

            <p className="text-xs text-ink-500 mt-1">From net revenue</p>
          </div>
        </div>

        <div className="mt-5">
          <Link
            to="/dashboard/payouts"
            className="text-sm text-gold-400 hover:text-gold-300 transition"
          >
            View full payout breakdown by category →
          </Link>
        </div>
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
                  <span className="text-ink-500 text-sm font-bold w-4">
                    {i + 1}
                  </span>
                  <img
                    src={c.photo?.url}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-100 truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-ink-500 truncate">
                      {c.category?.name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gold-400">
                    {formatNumber(c.voteCount)}
                  </span>
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
            <p className="text-ink-500 text-sm">
              No votes recorded in the last 7 days.
            </p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {stats.dailyTrend.map((d) => (
                <div
                  key={d._id}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-gradient-to-t from-gold-600 to-gold-300 rounded-t-md"
                    style={{
                      height: `${Math.max((d.votes / maxTrendVotes) * 100, 4)}%`,
                    }}
                  />
                  <span className="text-[10px] text-ink-500">
                    {d._id.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      ;
    </div>
  );
}
