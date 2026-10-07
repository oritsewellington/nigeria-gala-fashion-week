import { useGetPayoutSummaryQuery } from "../../features/dashboard/dashboardApi";

import { PageLoader } from "../../components/ui/Loaders";

import { ErrorState } from "../../components/ui/States";

import { getErrorMessage } from "../../lib/getErrorMessage";

import { formatNaira, formatNumber } from "../../lib/formatters";

export default function Payouts() {
  const { data, isLoading, isError, error, refetch } =
    useGetPayoutSummaryQuery();

  if (isLoading) {
    return <PageLoader label="Loading payout summary..." />;
  }

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  }

  const { summary, byCategory, platformSharePercent } = data.data;

  const hostSharePercent = 100 - platformSharePercent;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payout Transparency</h1>

        <p className="text-ink-400 text-sm mt-1">
          Paystack fees are deducted first. The remaining net revenue is split{" "}
          {hostSharePercent}% host /{platformSharePercent}% platform.
        </p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Votes */}
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-ink-500 text-xs">Total Votes</p>

          <p className="text-2xl font-bold mt-1">
            {formatNumber(summary.totalVotes)}
          </p>
        </div>

        {/* Gross */}
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-ink-500 text-xs">Gross Revenue</p>

          <p className="text-2xl font-bold mt-1">
            {formatNaira(summary.grossRevenue)}
          </p>

          <p className="text-xs text-ink-500 mt-1">Customer payments</p>
        </div>

        {/* Fees */}
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-ink-500 text-xs">Paystack Fees</p>

          <p className="text-2xl font-bold mt-1">
            {formatNaira(summary.paystackFees)}
          </p>

          <p className="text-xs text-ink-500 mt-1">Processing fees</p>
        </div>

        {/* Net */}
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-ink-500 text-xs">Net Revenue</p>

          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {formatNaira(summary.netRevenue)}
          </p>

          <p className="text-xs text-ink-500 mt-1">After Paystack fees</p>
        </div>

        {/* Host */}
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-ink-500 text-xs">Host Share</p>

          <p className="text-2xl font-bold mt-1">
            {formatNaira(summary.hostShare)}
          </p>

          <p className="text-xs text-ink-500 mt-1">
            {hostSharePercent}% of net
          </p>
        </div>
      </div>

      {/* Platform */}
      <div className="glass-panel rounded-2xl p-5">
        <p className="text-ink-500 text-xs">Platform Share</p>

        <p className="text-2xl font-bold mt-1">
          {formatNaira(summary.platformShare)}
        </p>

        <p className="text-xs text-ink-500 mt-1">
          {platformSharePercent}% of net revenue
        </p>
      </div>

      {/* Category breakdown */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-semibold text-ink-50">Revenue by Category</h2>

          <p className="text-ink-500 text-xs mt-1">
            Each category follows the same gross → Paystack fee → net →
            host/platform calculation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="px-6 py-4 text-xs text-ink-500 font-medium">
                  Category
                </th>

                <th className="px-6 py-4 text-xs text-ink-500 font-medium">
                  Votes
                </th>

                <th className="px-6 py-4 text-xs text-ink-500 font-medium">
                  Gross Revenue
                </th>

                <th className="px-6 py-4 text-xs text-ink-500 font-medium">
                  Paystack Fee
                </th>

                <th className="px-6 py-4 text-xs text-ink-500 font-medium">
                  Net Revenue
                </th>

                <th className="px-6 py-4 text-xs text-ink-500 font-medium">
                  Platform
                </th>

                <th className="px-6 py-4 text-xs text-ink-500 font-medium">
                  Host
                </th>
              </tr>
            </thead>

            <tbody>
              {byCategory.map((row) => (
                <tr
                  key={row.categoryId}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {row.categoryName}
                  </td>

                  <td className="px-6 py-4 text-sm text-ink-300">
                    {formatNumber(row.totalVotes)}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {formatNaira(row.grossRevenue)}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {formatNaira(row.paystackFees)}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                    {formatNaira(row.netRevenue)}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {formatNaira(row.platformShare)}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {formatNaira(row.hostShare)}
                  </td>
                </tr>
              ))}

              {byCategory.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-ink-500"
                  >
                    No successful transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
