import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { useLazyVerifyVoteQuery } from '../../features/votes/votesApi';
import { PageLoader } from '../../components/ui/Loaders';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNaira } from '../../lib/formatters';
import Button from '../../components/ui/Button';

export default function VoteCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [verifyVote, { data, isLoading, isError, error }] = useLazyVerifyVoteQuery();
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    if (reference && !hasVerified) {
      setHasVerified(true);
      verifyVote(reference)
        .unwrap()
        .then(() => toast.success('Payment verified — your votes have been counted!'))
        .catch((err) => toast.error(getErrorMessage(err)));
    }
  }, [reference, verifyVote, hasVerified]);

  if (!reference) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Missing payment reference</h1>
        <p className="text-ink-400 mb-6">We couldn't find a payment reference in the URL.</p>
        <Link to="/categories"><Button variant="outline">Back to categories</Button></Link>
      </div>
    );
  }

  if (isLoading || !hasVerified) return <PageLoader label="Verifying your payment..." />;

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Payment not successful</h1>
        <p className="text-ink-400 mb-6">{getErrorMessage(error)}</p>
        <div className="flex justify-center gap-3">
          <Link to="/categories"><Button variant="outline">Try again</Button></Link>
          <Link to="/leaderboard"><Button variant="ghost">View leaderboard</Button></Link>
        </div>
      </div>
    );
  }

  const tx = data?.data?.transaction;

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          Vote successful! <PartyPopper className="w-5 h-5 text-gold-400" />
        </h1>
        <p className="text-ink-400 mb-8">Your votes have been counted. Thank you for your support!</p>

        {tx && (
          <div className="glass-panel rounded-2xl p-6 text-left mb-8 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-ink-800">
              <img src={tx.contestant?.photo?.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="font-semibold text-ink-50">{tx.contestant?.name}</p>
                <p className="text-xs text-ink-500">{tx.category?.name}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Votes purchased</span>
              <span className="text-ink-100 font-semibold">{tx.voteQuantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Amount paid</span>
              <span className="text-ink-100 font-semibold">{formatNaira(tx.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Reference</span>
              <span className="text-ink-300 font-mono text-xs">{tx.reference}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {tx?.contestant && (
            <Link to={`/vote/${tx.contestant._id}`}>
              <Button>Vote Again</Button>
            </Link>
          )}
          <Link to="/leaderboard">
            <Button variant="outline">View Leaderboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
