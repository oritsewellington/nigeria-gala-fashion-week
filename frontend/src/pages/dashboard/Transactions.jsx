import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { useGetTransactionsQuery } from "../../features/dashboard/dashboardApi";

import { PageLoader } from "../../components/ui/Loaders";

import { EmptyState, ErrorState } from "../../components/ui/States";

import { getErrorMessage } from "../../lib/getErrorMessage";

import { formatNaira, formatDate, formatNumber } from "../../lib/formatters";

const statusStyles = {
  success: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-gold-500/10 text-gold-400",
  failed: "bg-red-500/10 text-red-400",
};

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useGetTransactionsQuery({
    search: search || undefined,
    status: status || undefined,
    page,
    limit: 20,
  });

  const transactions = data?.data?.transactions || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-ink-400 text-sm mt-1">
          Every vote purchase, fully logged
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by reference or email..."
            className="w-full bg-ink-900 border border-ink-800 rounded-xl pl-10 pr-4 py-2.5 text-base text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-ink-900 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {isLoading ? (
        <PageLoader label="Loading transactions..." />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions found" />
      ) : (
        <>
          {/* Mobile transaction cards */}
          <div className="space-y-3 md:hidden">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="rounded-2xl border border-ink-800 bg-ink-950/50 p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-500 mb-1">Reference</p>

                    <p className="text-sm font-semibold text-ink-100 truncate">
                      {tx.reference}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                      statusStyles[tx.status] || "bg-ink-800 text-ink-300"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                {/* Customer */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-ink-100 truncate">
                    {tx.contestant?.name || "—"}
                  </p>

                  <p className="text-xs text-ink-500 truncate mt-0.5">
                    {tx.payerEmail}
                  </p>
                </div>

                {/* Financial breakdown */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ink-800 pt-4">
                  <div>
                    <p className="text-[11px] text-ink-500">Votes</p>

                    <p className="text-sm font-semibold text-ink-100 tabular-nums">
                      {formatNumber(tx.voteQuantity)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-ink-500">Gross</p>

                    <p className="text-sm font-semibold text-ink-100 tabular-nums">
                      {formatNaira(tx.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-ink-500">Paystack Fee</p>

                    <p className="text-sm font-semibold text-ink-100 tabular-nums">
                      {tx.paystackFeeAmount != null
                        ? formatNaira(tx.paystackFeeAmount)
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-ink-500">Net</p>

                    <p className="text-sm font-semibold text-emerald-400 tabular-nums">
                      {tx.netAmount != null ? formatNaira(tx.netAmount) : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-ink-500">Host Share</p>

                    <p className="text-sm font-semibold text-ink-100 tabular-nums">
                      {tx.netAmount != null
                        ? formatNaira(tx.hostShareAmount)
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-ink-500">Platform Share</p>

                    <p className="text-sm font-semibold text-ink-100 tabular-nums">
                      {tx.netAmount != null
                        ? formatNaira(tx.platformShareAmount)
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="mt-4 border-t border-ink-800 pt-3">
                  <p className="text-xs text-ink-500">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop transaction table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-ink-800">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Contestant</th>
                  <th>Payer</th>
                  <th>Votes</th>
                  <th>Gross</th>
                  <th>Paystack Fee</th>
                  <th>Net</th>
                  <th>Host / Platform</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{tx.reference}</td>

                    <td>{tx.contestant?.name || "—"}</td>

                    <td>{tx.payerEmail}</td>

                    <td>{formatNumber(tx.voteQuantity)}</td>

                    <td>{formatNaira(tx.amount)}</td>

                    <td>
                      {tx.paystackFeeAmount != null
                        ? formatNaira(tx.paystackFeeAmount)
                        : "—"}
                    </td>

                    <td className="font-semibold">
                      {tx.netAmount != null ? formatNaira(tx.netAmount) : "—"}
                    </td>

                    <td>
                      {tx.netAmount != null
                        ? `${formatNaira(tx.hostShareAmount)} / ${formatNaira(tx.platformShareAmount)}`
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          statusStyles[tx.status] || "bg-ink-800 text-ink-300"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    <td>{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between text-sm text-ink-400">
              <span>
                Page {meta.page} of {meta.pages} · {meta.total} total
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg border border-ink-800 disabled:opacity-40 hover:bg-ink-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= meta.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-ink-800 disabled:opacity-40 hover:bg-ink-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
