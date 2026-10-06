import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLoginMutation } from "../../features/auth/authApi";
import { useAppDispatch } from "../../app/hooks";
import { setCredentials } from "../../features/auth/authSlice";
import { getErrorMessage } from "../../lib/getErrorMessage";
import Button from "../../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const res = await login(form).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Crown className="w-7 h-7 text-gold-400" />
            <span className="font-display font-bold text-lg text-ink-50">
              Nigeria Gala Fashion Week
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Host &amp; Admin Login</h1>
          <p className="text-ink-400 text-sm mt-1">
            Sign in to manage categories, contestants and view transparency
            reports.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 space-y-4"
        >
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-ink-900 border border-ink-800 rounded-xl pl-10 pr-4 py-2.5 text-base text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-ink-900 border border-ink-800 rounded-xl pl-10 pr-10 py-2.5 text-base text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-ink-500 mt-6">
          <Link to="/" className="hover:text-gold-400">
            ← Back to the public site
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
