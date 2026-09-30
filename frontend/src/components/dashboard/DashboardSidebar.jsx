import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Receipt,
  PieChart,
  Handshake,
  Settings as SettingsIcon,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';

const baseLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/categories', label: 'Categories', icon: FolderKanban },
  { to: '/dashboard/contestants', label: 'Contestants', icon: Users },
  { to: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { to: '/dashboard/payouts', label: 'Payouts', icon: PieChart },
  { to: '/dashboard/sponsors', label: 'Sponsors', icon: Handshake },
];

const superAdminLinks = [
  { to: '/dashboard/settings', label: 'Event Settings', icon: SettingsIcon },
  { to: '/dashboard/admins', label: 'Admins & Hosts', icon: ShieldCheck },
];

export default function DashboardSidebar({ onNavigate }) {
  const user = useAppSelector(selectCurrentUser);
  const links = user?.role === 'superadmin' ? [...baseLinks, ...superAdminLinks] : baseLinks;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-ink-800 shrink-0">
        <Crown className="w-5 h-5 text-gold-400" />
        <span className="font-display font-bold text-ink-50 text-sm">NGFW Dashboard</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold-500/10 text-gold-300 border border-gold-500/20'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
              }`
            }
          >
            <link.icon className="w-4.5 h-4.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-ink-800 text-xs text-ink-500">
        Logged in as{' '}
        <span className="text-gold-400 font-medium capitalize">{user?.role}</span>
      </div>
    </div>
  );
}
