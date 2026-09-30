import { motion } from 'framer-motion';
import { Shirt, Sparkle, Landmark, Gem, Sun } from 'lucide-react';

const pillars = [
  { icon: Shirt, label: 'Fashion' },
  { icon: Sparkle, label: 'Beauty' },
  { icon: Landmark, label: 'Culture' },
  { icon: Gem, label: 'Heritage' },
  { icon: Sun, label: 'Innovation' },
];

export default function HeritagePillars() {
  return (
    <div className="border-y border-ink-800 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-16">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <pillar.icon className="w-5 h-5 text-gold-400" strokeWidth={1.5} />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-ink-400 font-semibold">
                {pillar.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
