import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../../lib/formatters';

export default function ContestantsCarousel({ contestants = [], autoplayMs = 3500 }) {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const cardWidth = card ? card.offsetWidth + 16 : 240;
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    if (contestants.length < 3 || isPaused) return undefined;

    const timer = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;

      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollByCard(1);
      }
    }, autoplayMs);

    return () => clearInterval(timer);
  }, [contestants.length, isPaused, autoplayMs]);

  if (contestants.length === 0) return null;

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
      >
        {contestants.map((c) => (
          <Link
            key={c._id}
            data-card
            to={`/contestant/${c._id}`}
            className="group shrink-0 w-[45%] sm:w-[30%] lg:w-[19%] snap-start rounded-2xl overflow-hidden border border-ink-800 hover:border-gold-500/40 transition-colors bg-ink-900"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={c.photo?.url}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="font-semibold text-ink-50 text-sm truncate">{c.name}</p>
              <p className="text-ink-500 text-xs truncate">{c.category?.name}</p>
              <p className="text-gold-400 text-xs font-semibold mt-1">{formatNumber(c.voteCount)} votes</p>
            </div>
          </Link>
        ))}
      </div>

      {contestants.length > 3 && (
        <>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-ink-900 border border-ink-700 items-center justify-center text-ink-200 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-gold-500/40 hover:text-gold-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next"
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-ink-900 border border-ink-700 items-center justify-center text-ink-200 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-gold-500/40 hover:text-gold-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
