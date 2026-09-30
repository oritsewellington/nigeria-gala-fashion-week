import { Link } from 'react-router-dom';
import { Crown, Phone, AtSign } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-gold-400" />
            <span className="font-display font-bold text-lg text-ink-50">Nigeria Gala Fashion Week</span>
          </div>
          <p className="text-ink-400 text-sm max-w-sm leading-relaxed">
            Redefining fashion through our own heritage and identity. Celebrating Africa's most
            anticipated fashion experience — Fashion, Beauty, Culture, Heritage, Innovation.
          </p>
        </div>

        <div>
          <h4 className="text-ink-100 font-semibold text-sm mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-ink-400">
            <li><Link to="/categories" className="hover:text-gold-300 transition-colors">Categories</Link></li>
            <li><Link to="/leaderboard" className="hover:text-gold-300 transition-colors">Leaderboard</Link></li>
            <li><Link to="/about" className="hover:text-gold-300 transition-colors">About the Event</Link></li>
            <li><Link to="/login" className="hover:text-gold-300 transition-colors">Host / Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-ink-100 font-semibold text-sm mb-4">Sponsorship &amp; Partnership</h4>
          <ul className="space-y-2.5 text-sm text-ink-400">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              <a href="tel:+2349029547812" className="hover:text-gold-300 transition-colors">+234 906 954 6570</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              <a href="tel:+2348069207812" className="hover:text-gold-300 transition-colors">+234 806 920 7812</a>
            </li>
            <li className="flex items-center gap-2">
              <AtSign className="w-4 h-4 text-gold-400 shrink-0" />
              <a
                href="https://instagram.com/nigeriafashionweekend"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold-300 transition-colors"
              >
                @nigeriafashionweekend
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800 py-6 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} Nigeria Gala Fashion Week. All rights reserved.
      </div>
    </footer>
  );
}
