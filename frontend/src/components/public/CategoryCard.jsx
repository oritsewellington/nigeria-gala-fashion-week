import { Link } from "react-router-dom";
import { Shirt, Crown, Gem, Sparkles, Star, Sun } from "lucide-react";

// A handful of tasteful gold-toned gradient + icon pairings. Picked
// deterministically per category (by name) so the same category always
// gets the same look instead of flickering between renders.
const PALETTES = [
  { gradient: "from-gold-700 via-gold-500 to-gold-300", icon: Crown },
  { gradient: "from-ink-800 via-gold-800 to-gold-500", icon: Gem },
  { gradient: "from-gold-900 via-ink-700 to-gold-400", icon: Sparkles },
  { gradient: "from-gold-600 via-ink-800 to-ink-950", icon: Shirt },
  { gradient: "from-ink-900 via-gold-700 to-gold-200", icon: Star },
  { gradient: "from-gold-500 via-gold-800 to-ink-900", icon: Sun },
];

const pickPalette = (name = "") => {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
};

export default function CategoryCard({ category }) {
  const hasImage = Boolean(category.coverImage?.url);
  const palette = pickPalette(category.name);
  const Icon = palette.icon;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative rounded-2xl overflow-hidden border border-ink-800 hover:border-gold-500/40 transition-colors aspect-[4/3] bg-ink-900"
    >
      {hasImage ? (
        <>
          <img
            src={category.coverImage.url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        </>
      ) : (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${palette.gradient} opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" />
          <Icon
            className="absolute top-4 right-4 w-8 h-8 text-gold-300/30 group-hover:text-gold-300/50 transition-colors"
            strokeWidth={1.25}
          />
        </>
      )}

      <div className="relative h-full flex flex-col justify-end p-4">
        <p className="font-semibold text-ink-50 text-sm">{category.name}</p>
        <p className="text-ink-400 text-xs">
          {category.contestantCount || 0} contestants
        </p>
      </div>
    </Link>
  );
}
