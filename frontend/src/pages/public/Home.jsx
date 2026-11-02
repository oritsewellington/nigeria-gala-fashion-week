import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Vote, Trophy, Wallet } from "lucide-react";
import { useVotingStatus } from "../../hooks/useVotingStatus";
import { useGetCategoriesQuery } from "../../features/categories/categoriesApi";
import { useGetContestantsQuery } from "../../features/contestants/contestantsApi";
import VotingStatusBadge from "../../components/public/VotingStatusBadge";
import LiveStatsBar from "../../components/public/LiveStatsBar";
import HeritagePillars from "../../components/public/HeritagePillars";
import ContestantsCarousel from "../../components/public/ContestantsCarousel";
import CategoryCard from "../../components/public/CategoryCard";
import { CardSkeleton } from "../../components/ui/Loaders";
import { EmptyState } from "../../components/ui/States";

const steps = [
  {
    icon: Sparkles,
    title: "Pick your favorite",
    desc: "Browse categories and find the contestant you want to support.",
  },
  {
    icon: Wallet,
    title: "Pay ₦100 per vote",
    desc: "Buy as many votes as you like, securely through Paystack.",
  },
  {
    icon: Trophy,
    title: "Track live results",
    desc: "Watch the leaderboard update in real time until voting closes.",
  },
];

export default function Home() {
  const votingStatus = useVotingStatus();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { data: featuredData, isLoading: featuredLoading } =
    useGetContestantsQuery({ limit: 10 });

  const categories = categoriesData?.data?.categories || [];
  const featured = featuredData?.data?.contestants || [];

  // One banner image: the first one set in the admin settings (a link, or an object holding one), else the default.
  const firstHero = votingStatus.heroImages?.[0];
  const heroSrc =
    (typeof firstHero === "string"
      ? firstHero
      : firstHero?.url || firstHero?.image || firstHero?.src) || "/hero.jpg";

  return (
    <div>
      {/* Hero. Phones: banner image on top, content below it. Desktop: the image is a faded backdrop behind the content. */}
      <section className="relative isolate overflow-hidden border-b border-ink-800">
        {/* Desktop / tablet */}
        <img
          src={heroSrc}
          alt=""
          className="absolute inset-0 -z-20 hidden h-full w-full object-cover object-top opacity-50 md:block"
        />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-b from-ink-950/70 via-ink-950/60 to-ink-950 md:block" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(226,184,101,0.16),transparent)]" />
        {/* Phones: the WHOLE image at its natural shape (nobody cropped out), fading into the page */}
        <div className="relative md:hidden">
          <img
            src={heroSrc}
            alt="Nigeria Gala Fashion Week"
            className="aspect-[810/530] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
        </div>
        <div className="mx-auto -mt-10 flex max-w-6xl flex-col items-center justify-center px-5 pb-16 text-center md:mt-0 md:min-h-[88dvh] md:py-20">
          {votingStatus.status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              {/ended|closed|over/i.test(String(votingStatus.status)) ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-400/60 bg-red-500/20 px-5 py-2 text-sm font-bold uppercase tracking-wider text-red-200 shadow-lg shadow-red-500/10">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Voting has ended
                </span>
              ) : (
                <VotingStatusBadge
                  status={votingStatus.status}
                  timeLeft={votingStatus.timeLeft}
                />
              )}
            </motion.div>
          )}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold-400 sm:text-sm"
          >
            {votingStatus.eventTagline ||
              "Fashion · Beauty · Culture · Heritage · Innovation"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-5xl font-extrabold leading-[1.05] sm:text-7xl lg:text-8xl"
          >
            <span className="text-ink-50">Nigeria Gala</span>
            <br />
            <span className="text-gradient-gold">Fashion Week</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-6 max-w-xl text-lg text-ink-300"
          >
            Africa's most anticipated fashion experience. Cast your vote for the
            models, designers and creatives redefining fashion through our own
            heritage and identity.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-8 py-3.5 font-semibold text-ink-950 shadow-xl shadow-gold-500/20 transition-colors hover:from-gold-300 hover:to-gold-500"
            >
              <Vote className="h-5 w-5" />
              Vote Now
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-700 px-8 py-3.5 font-semibold text-ink-100 transition-colors hover:bg-ink-800"
            >
              View Leaderboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Infinite moving tape (pure CSS, starts instantly) */}
      <div
        className="overflow-hidden border-y border-gold-400/30 bg-gradient-to-r from-gold-400 to-gold-600 py-3 text-ink-950"
        aria-hidden="true"
      >
        <style>{`@keyframes ngfw-tape{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ngfw-tape{animation:ngfw-tape 34s linear infinite;will-change:transform}
@media (prefers-reduced-motion:reduce){.ngfw-tape{animation:none}}`}</style>
        <div className="ngfw-tape flex w-max whitespace-nowrap text-xs font-bold tracking-[0.4em]">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 gap-10 pr-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center gap-10">
                  REDEFINING FASHION THROUGH OUR CULTURE AND HERITAGE{" "}
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Live stats bar */}
      <LiveStatsBar />

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          How Voting Works
        </h2>
        <p className="text-ink-400 text-center mb-12">
          Three simple steps to support your favorite
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-semibold text-ink-50 mb-1.5">{step.title}</h3>
              <p className="text-ink-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Heritage pillars - matches the flyer footer: Fashion, Beauty, Culture, Heritage, Innovation */}
      <HeritagePillars />

      {/* Featured contestants carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Trending Now</h2>
          <Link
            to="/categories"
            className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <EmptyState
            title="No contestants yet"
            message="Check back soon as contestants are added."
          />
        ) : (
          <ContestantsCarousel contestants={featured} />
        )}
      </section>

      {/* Categories preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">Categories</h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            message="Categories will appear here once they're added."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
