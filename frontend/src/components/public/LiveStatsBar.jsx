import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Vote, FolderKanban, Users } from 'lucide-react';
import { useLiveStats } from '../../hooks/useLiveStats';
import { formatNumber } from '../../lib/formatters';

/** Animates a number counting up from its previous value to the new one. */
function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) return undefined;

    const duration = 600;
    const startTime = performance.now();

    let frame;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else prevValue.current = end;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatNumber(display)}</>;
}

const stats = [
  { key: 'totalVotes', label: 'Votes Cast', icon: Vote },
  { key: 'totalCategories', label: 'Categories', icon: FolderKanban },
  { key: 'totalContestants', label: 'Contestants', icon: Users },
];

export default function LiveStatsBar() {
  const { totalVotes, totalCategories, totalContestants, isLoading } = useLiveStats();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const values = { totalVotes, totalCategories, totalContestants };

  return (
    <div ref={ref} className="border-y border-ink-800 bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-3 gap-4 sm:gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center gap-1.5"
          >
            <stat.icon className="w-5 h-5 text-gold-400 mb-1" />
            <p className="text-2xl sm:text-4xl font-bold font-display text-ink-50 tabular-nums">
              {isLoading ? (
                <span className="inline-block h-8 w-16 bg-ink-800 rounded animate-pulse" />
              ) : (
                <AnimatedCount value={values[stat.key]} />
              )}
            </p>
            <p className="text-ink-400 text-xs sm:text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
