export default function StatCard({ label, value, icon: Icon, accent = 'gold', sub }) {
  const accents = {
    gold: 'text-gold-400 bg-gold-500/10 border-gold-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-ink-400 text-xs font-medium uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${accents[accent]}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-ink-50 font-display">{value}</p>
      {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
    </div>
  );
}
