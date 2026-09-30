import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 hover:from-gold-300 hover:to-gold-500 shadow-lg shadow-gold-500/20',
  secondary: 'bg-ink-800 text-ink-50 hover:bg-ink-700 border border-ink-600',
  outline: 'border border-gold-500/40 text-gold-300 hover:bg-gold-500/10',
  ghost: 'text-ink-200 hover:bg-ink-800',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </motion.button>
  );
}
