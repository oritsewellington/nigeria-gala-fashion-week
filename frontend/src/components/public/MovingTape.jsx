import { Sparkles } from "lucide-react";

/** Infinite gold tape. Pure CSS, so it starts instantly and never stalls while the page loads. */
export default function MovingTape({
  text = "REDEFINING FASHION THROUGH OUR CULTURE AND HERITAGE",
}) {
  return (
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
                {text} <Sparkles className="h-3.5 w-3.5" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
