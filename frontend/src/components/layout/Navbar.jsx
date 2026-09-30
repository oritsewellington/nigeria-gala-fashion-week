import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/categories', label: 'Categories' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Crown className="w-6 h-6 text-gold-400 group-hover:rotate-6 transition-transform" />
          <span className="font-display font-bold text-lg tracking-tight text-ink-50">
            Nigeria Gala <span className="text-gradient-gold">Fashion Week</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-gold-400' : 'text-ink-300 hover:text-ink-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/categories"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 text-sm font-semibold hover:from-gold-300 hover:to-gold-500 transition-colors shadow-lg shadow-gold-500/20"
          >
            Vote Now
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden text-ink-200"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-ink-800 bg-ink-950"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? 'text-gold-400' : 'text-ink-300'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/categories"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 text-sm font-semibold text-center"
              >
                Vote Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
