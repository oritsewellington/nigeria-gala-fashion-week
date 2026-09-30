import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Vote, Trophy, Wallet } from "lucide-react";
import { useVotingStatus } from "../../hooks/useVotingStatus";
import { useGetCategoriesQuery } from "../../features/categories/categoriesApi";
import { useGetContestantsQuery } from "../../features/contestants/contestantsApi";
import VotingStatusBadge from "../../components/public/VotingStatusBadge";
import HeroSlider from "../../components/public/HeroSlider";
import LiveStatsBar from "../../components/public/LiveStatsBar";
import HeritagePillars from "../../components/public/HeritagePillars";
import ContestantsCarousel from "../../components/public/ContestantsCarousel";
import SponsorsStrip from "../../components/public/SponsorsStrip";
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

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-800 min-h-[600px] flex items-center">
        <HeroSlider images={votingStatus.heroImages} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {votingStatus.status && (
              <div className="flex justify-center mb-6">
                <VotingStatusBadge
                  status={votingStatus.status}
                  timeLeft={votingStatus.timeLeft}
                />
              </div>
            )}

            <p className="uppercase tracking-[0.3em] text-gold-400 text-xs font-semibold mb-4">
              {votingStatus.eventTagline ||
                "Fashion · Beauty · Culture · Heritage · Innovation"}
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              <span className="text-ink-50">Nigeria Gala</span>
              <br />
              <span className="text-gradient-gold">Fashion Week</span>
            </h1>
            <p className="text-ink-300 text-base sm:text-lg max-w-2xl mx-auto mb-10">
              Africa's most anticipated fashion experience. Cast your vote for
              the models, designers and creatives redefining fashion through our
              own heritage and identity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold hover:from-gold-300 hover:to-gold-500 transition-colors shadow-xl shadow-gold-500/20"
              >
                <Vote className="w-5 h-5" />
                Vote Now
              </Link>
              <Link
                to="/leaderboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-ink-700 text-ink-100 font-semibold hover:bg-ink-800 transition-colors"
              >
                View Leaderboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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

      {/* Sponsors / partners */}
      <SponsorsStrip />
    </div>
  );
}
