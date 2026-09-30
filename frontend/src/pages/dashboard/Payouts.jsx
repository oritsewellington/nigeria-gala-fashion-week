import { useGetPayoutSummaryQuery } from '../../features/dashboard/dashboardApi';
import { PageLoader } from '../../components/ui/Loaders';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNaira, formatNumber } from '../../lib/formatters';

export default function Payouts() {
  const { data, isLoading, isError, error, refetch } = useGetPayoutSummaryQuery();

  if (isLoading) return <PageLoader label="Loading payout summary..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const { summary, byCategory, platformSharePercent } = data.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Payout Transparency</h1>
        <p className="text-ink-400 text-sm mt-1">
          A full breakdown of every naira collected, split {100 - platformSharePercent}% host / {platformSharePercent}% platform
        </p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-ink-500 text-xs mb-1">Total Votes</p>
          <p className="text-2xl font-bold text-ink-50">{formatNumber(summary.totalVotes)}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-ink-500 text-xs mb-1">Gross Revenue</p>
          <p className="text-2xl font-bold text-ink-50">{formatNaira(summary.grossRevenue)}</p>
        </div>
        <div className="rounded-2xl p-5 bg-gold-500/5 border border-gold-500/20">
          <p className="text-gold-400 text-xs mb-1">Platform Share ({platformSharePercent}%)</p>
          <p className="text-2xl font-bold text-gold-300">{formatNaira(summary.platformShare)}</p>
        </div>
        <div className="rounded-2xl p-5 bg-emerald-500/5 border border-emerald-500/20">
          <p className="text-emerald-400 text-xs mb-1">Host Share ({100 - platformSharePercent}%)</p>
          <p className="text-2xl font-bold text-emerald-300">{formatNaira(summary.hostShare)}</p>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-ink-50 mb-4">Breakdown by Category</h2>
        {byCategory.length === 0 ? (
          <EmptyState title="No revenue recorded yet" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-ink-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-900 text-ink-400 text-left">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Votes</th>
                  <th className="px-4 py-3 font-medium">Gross Revenue</th>
                  <th className="px-4 py-3 font-medium">Platform Share</th>
                  <th className="px-4 py-3 font-medium">Host Share</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map((row) => (
                  <tr key={row.categoryId} className="border-t border-ink-800">
                    <td className="px-4 py-3 text-ink-100 font-medium">{row.categoryName}</td>
                    <td className="px-4 py-3 text-ink-400">{formatNumber(row.totalVotes)}</td>
                    <td className="px-4 py-3 text-ink-50 font-semibold">{formatNaira(row.grossRevenue)}</td>
                    <td className="px-4 py-3 text-gold-400">{formatNaira(row.platformShare)}</td>
                    <td className="px-4 py-3 text-emerald-400">{formatNaira(row.hostShare)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
