import { Sparkles, Palette, Landmark, Lightbulb, Shirt } from 'lucide-react';

const pillars = [
  { icon: Shirt, label: 'Fashion' },
  { icon: Sparkles, label: 'Beauty' },
  { icon: Palette, label: 'Culture' },
  { icon: Landmark, label: 'Heritage' },
  { icon: Lightbulb, label: 'Innovation' },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="uppercase tracking-[0.3em] text-gold-400 text-xs font-semibold mb-4 text-center">
        About the Event
      </p>
      <h1 className="text-3xl sm:text-5xl font-bold text-center mb-6">
        Redefining Fashion Through <span className="text-gradient-gold">Our Own Heritage</span>
      </h1>
      <p className="text-ink-300 text-center max-w-2xl mx-auto mb-14 leading-relaxed">
        Nigeria Gala Fashion Week is Africa's most anticipated fashion experience — a celebration
        of the models, designers, makeup artists, photographers and creatives shaping the
        continent's fashion identity. Every year we bring together the community to celebrate
        excellence and inspire greatness through the Nigeria Gala Fashion Weekend Award Night.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-16">
        {pillars.map((p) => (
          <div
            key={p.label}
            className="glass-panel rounded-2xl p-5 text-center flex flex-col items-center gap-2"
          >
            <p.icon className="w-6 h-6 text-gold-400" />
            <span className="text-sm font-medium text-ink-200">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-3">Celebrating Excellence, Inspiring Greatness</h2>
        <p className="text-ink-400 leading-relaxed">
          From Male &amp; Female Model of the Year to Bridal Designer of the Year, the Nigeria
          Gala Fashion Weekend Award Night recognizes the very best across more than twenty
          categories — models, designers, photographers, stylists, influencers, MUAs and more.
          Voting is open to the public, and every vote helps decide who takes home the trophy on
          award night.
        </p>
      </div>
    </div>
  );
}
