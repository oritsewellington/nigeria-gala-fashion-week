import { Clock, Radio, Flag } from 'lucide-react';
import { formatCountdown } from '../../hooks/useVotingStatus';

const pad = (n) => String(n).padStart(2, '0');

export default function VotingStatusBadge({ status, timeLeft, size = 'md' }) {
  if (!status) return null;

  const { days, hours, minutes, seconds } = formatCountdown(timeLeft);

  const configs = {
    upcoming: {
      icon: Clock,
      label: 'Voting Opens In',
      color: 'text-gold-300 bg-gold-500/10 border-gold-500/30',
      showCountdown: true,
    },
    live: {
      icon: Radio,
      label: 'Voting Ends In',
      color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
      showCountdown: true,
      pulse: true,
    },
    ended: {
      icon: Flag,
      label: 'Voting Has Ended',
      color: 'text-ink-400 bg-ink-800 border-ink-700',
      showCountdown: false,
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  const textSize = size === 'lg' ? 'text-base' : 'text-xs';
  const padding = size === 'lg' ? 'px-5 py-3' : 'px-3 py-1.5';

  return (
    <div className={`inline-flex items-center gap-2.5 rounded-full border ${config.color} ${padding} ${textSize} font-semibold`}>
      <span className="relative flex items-center">
        {config.pulse && (
          <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 animate-ping" />
        )}
        <Icon className={size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
      </span>
      <span>{config.label}</span>
      {config.showCountdown && (
        <span className="font-mono tabular-nums">
          {days > 0 && `${days}d `}
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      )}
    </div>
  );
}
