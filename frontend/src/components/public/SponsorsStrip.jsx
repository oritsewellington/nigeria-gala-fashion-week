import { motion } from 'framer-motion';
import { useGetSponsorsQuery } from '../../features/sponsors/sponsorsApi';

export default function SponsorsStrip() {
  const { data, isLoading } = useGetSponsorsQuery();
  const sponsors = data?.data?.sponsors || [];

  // Quietly render nothing until there's real sponsor data - no empty-state
  // needed on a public marketing section.
  if (!isLoading && sponsors.length === 0) return null;

  return (
    <div className="border-t border-ink-800 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-center text-ink-500 text-xs uppercase tracking-[0.3em] font-semibold mb-8">
          Sponsors &amp; Partners
        </p>

        {isLoading ? (
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-28 bg-ink-800 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {sponsors.map((sponsor, i) => {
              const content = (
                <motion.img
                  src={sponsor.logo?.url}
                  alt={sponsor.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="h-8 sm:h-10 max-w-[140px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              );

              return sponsor.websiteUrl ? (
                <a
                  key={sponsor._id}
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={sponsor.name}
                >
                  {content}
                </a>
              ) : (
                <div key={sponsor._id} aria-label={sponsor.name}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
