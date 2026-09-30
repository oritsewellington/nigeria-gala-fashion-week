import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Minus, Plus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useGetContestantQuery } from '../../features/contestants/contestantsApi';
import { useInitializeVoteMutation } from '../../features/votes/votesApi';
import { useVotingStatus } from '../../hooks/useVotingStatus';
import { PageLoader } from '../../components/ui/Loaders';
import { ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNaira } from '../../lib/formatters';
import Button from '../../components/ui/Button';

const QUICK_AMOUNTS = [1, 5, 10, 20, 50];

export default function VotePage() {
  const { contestantId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetContestantQuery(contestantId);
  const { status, votePrice } = useVotingStatus();
  const [initializeVote, { isLoading: isSubmitting }] = useInitializeVoteMutation();

  const [quantity, setQuantity] = useState(5);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const contestant = data?.data?.contestant;
  const price = votePrice || 100;
  const total = useMemo(() => quantity * price, [quantity, price]);

  const updateQuantity = (val) => setQuantity(Math.max(1, Math.min(1000, val)));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status !== 'live') {
      toast.error(status === 'upcoming' ? 'Voting has not started yet.' : 'Voting has ended.');
      return;
    }

    if (!form.email) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      const res = await initializeVote({
        contestantId,
        quantity,
        email: form.email,
        name: form.name,
        phone: form.phone,
      }).unwrap();

      toast.success('Redirecting you to Paystack to complete payment...');
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader label="Loading..." />;
  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
  if (!contestant) return null;

  const votingClosed = status !== 'live';

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-400 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-4 mb-8">
        <img
          src={contestant.photo?.url}
          alt={contestant.name}
          className="w-16 h-16 rounded-xl object-cover border border-ink-800"
        />
        <div>
          <h1 className="text-xl font-bold">{contestant.name}</h1>
          <p className="text-ink-500 text-sm">{contestant.category?.name}</p>
        </div>
      </div>

      {votingClosed ? (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-ink-200 font-semibold mb-1">
            {status === 'upcoming' ? 'Voting has not started yet' : 'Voting has ended'}
          </p>
          <p className="text-ink-500 text-sm mb-5">
            {status === 'upcoming'
              ? "Come back once voting opens to cast your vote."
              : 'Thank you for your interest — check the leaderboard for final results.'}
          </p>
          <Link to="/leaderboard">
            <Button variant="outline">View Leaderboard</Button>
          </Link>
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 space-y-6"
        >
          <div>
            <label className="text-sm font-medium text-ink-200 mb-3 block">Number of Votes</label>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                className="w-11 h-11 rounded-xl border border-ink-700 flex items-center justify-center text-ink-200 hover:bg-ink-800"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => updateQuantity(Number(e.target.value) || 1)}
                min={1}
                max={1000}
                className="flex-1 text-center bg-ink-900 border border-ink-800 rounded-xl py-2.5 text-lg font-bold text-ink-50 focus:outline-none focus:border-gold-500/50"
              />
              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                className="w-11 h-11 rounded-xl border border-ink-700 flex items-center justify-center text-ink-200 hover:bg-ink-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => updateQuantity(amt)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    quantity === amt
                      ? 'bg-gold-500/15 border-gold-500/40 text-gold-300'
                      : 'border-ink-700 text-ink-400 hover:bg-ink-800'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-ink-900 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-ink-900 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
            />
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-ink-900 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-ink-800">
            <span className="text-ink-400 text-sm">
              {quantity} vote{quantity > 1 ? 's' : ''} × {formatNaira(price)}
            </span>
            <span className="text-xl font-bold text-gradient-gold">{formatNaira(total)}</span>
          </div>

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            Pay {formatNaira(total)} with Paystack
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure payment powered by Paystack
          </p>
        </motion.form>
      )}
    </div>
  );
}
