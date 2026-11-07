import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
} from "lucide-react";
import { useGetCategoriesQuery } from "../../features/categories/categoriesApi";
import { useGetLeaderboardQuery } from "../../features/contestants/contestantsApi";
import { useLiveLeaderboard } from "../../hooks/useLiveLeaderboard";
import { useVotingStatus } from "../../hooks/useVotingStatus";
import { PageLoader } from "../../components/ui/Loaders";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { formatNumber } from "../../lib/formatters";
import VotingStatusBadge from "../../components/public/VotingStatusBadge";

const rankStyles = {
  1: {
    icon: Trophy,
    color: "text-gold-400",
    bg: "bg-gold-500/10 border-gold-500/30",
  },
  2: { icon: Medal, color: "text-ink-200", bg: "bg-ink-700/40 border-ink-600" },
  3: {
    icon: Medal,
    color: "text-amber-600",
    bg: "bg-amber-700/10 border-amber-700/30",
  },
};

const STORAGE_KEY = "leaderboard:category";
const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const writeStored = (slug) => {
  try {
    localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    /* storage can be blocked: ignore */
  }
};

/** Dropdown with a search box. Tap it, type a few letters, pick a category. */
function CategoryPicker({ categories, activeSlug, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);

  const index = categories.findIndex((c) => c.slug === activeSlug);
  const active = categories[index];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? categories.filter((c) => c.name.toLowerCase().includes(q))
      : categories;
  }, [categories, query]);

  // Close when tapping outside or pressing Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (slug) => {
    onSelect(slug);
    setOpen(false);
    setQuery("");
  };
  const step = (d) => {
    if (!categories.length) return;
    choose(
      categories[
        (Math.max(index, 0) + d + categories.length) % categories.length
      ].slug,
    );
  };
  // On phones, do not pop the keyboard open straight away: it would hide the list.
  const autoFocusSearch =
    typeof window !== "undefined" &&
    !window.matchMedia("(pointer: coarse)").matches;

  return (
    <div className="mb-8" ref={boxRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-3 rounded-2xl border border-ink-700 bg-ink-900 px-4 py-3.5 text-left hover:border-gold-500/50 transition-colors"
        >
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-widest text-ink-500">
              Category
            </span>
            <span className="block truncate font-semibold text-ink-50">
              {active?.name || "Choose a category"}
            </span>
          </span>
          <ChevronDown
            className={`w-5 h-5 shrink-0 text-gold-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3">
              <Search className="w-4 h-4 shrink-0 text-ink-500" />
              <input
                autoFocus={autoFocusSearch}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search categories..."
                className="w-full bg-transparent text-sm text-ink-50 placeholder:text-ink-500 outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-ink-400">
                  No category matches "{query}".
                </li>
              ) : (
                filtered.map((cat) => (
                  <li key={cat._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={cat.slug === activeSlug}
                      onClick={() => choose(cat.slug)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors ${
                        cat.slug === activeSlug
                          ? "bg-gold-500/10 text-gold-300"
                          : "text-ink-100 hover:bg-ink-800"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.slug === activeSlug && (
                        <Check className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => step(-1)}
          className="inline-flex items-center gap-1 rounded-full border border-ink-800 px-3 py-1.5 text-ink-300 hover:bg-ink-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-xs text-ink-500">
          {index >= 0 ? `${index + 1} of ${categories.length}` : ""}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          className="inline-flex items-center gap-1 rounded-full border border-ink-800 px-3 py-1.5 text-ink-300 hover:bg-ink-800 transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];
  const [searchParams, setSearchParams] = useSearchParams();
  const { status, timeLeft } = useVotingStatus();

  // Which category is shown: the one in the link (shareable), else the last one they looked at, else the first.
  const has = (slug) => slug && categories.some((c) => c.slug === slug);
  const activeSlug = categories.length
    ? [searchParams.get("category"), readStored()].find(has) ||
      categories[0].slug
    : null;
  const activeCategory = categories.find((c) => c.slug === activeSlug);

  const selectCategory = (slug) => {
    writeStored(slug);
    setSearchParams({ category: slug }, { replace: true });
  };

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
          {status === "ended" ? "Final Results" : "Live Leaderboard"}
        </h1>
        <p className="text-ink-400 mb-4">
          {status === "ended"
            ? "Voting has closed. Here are the final standings."
            : "Standings update instantly as votes come in."}
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
          <CategoryPicker
            categories={categories}
            activeSlug={activeSlug}
            onSelect={selectCategory}
          />

          <h2 className="text-xl sm:text-2xl font-bold mb-5 text-center">
            {board?.category?.name || activeCategory?.name}
          </h2>

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
                  const style = rankStyles[c.rank] || {
                    icon: null,
                    color: "text-ink-400",
                    bg: "bg-ink-900 border-ink-800",
                  };
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
                        {RankIcon ? (
                          <RankIcon className={`w-5 h-5 ${style.color}`} />
                        ) : (
                          c.rank
                        )}
                      </div>
                      <img
                        src={c.photo?.url}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border border-ink-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink-50 text-sm truncate">
                          {c.name}
                        </p>
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
                        <p className="font-bold text-ink-50 text-sm">
                          {formatNumber(c.voteCount)}
                        </p>
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
