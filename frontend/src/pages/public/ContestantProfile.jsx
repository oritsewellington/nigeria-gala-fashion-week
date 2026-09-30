import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AtSign, Vote, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetContestantQuery } from '../../features/contestants/contestantsApi';
import { useVotingStatus } from '../../hooks/useVotingStatus';
import { PageLoader } from '../../components/ui/Loaders';
import { ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNumber } from '../../lib/formatters';
import VotingStatusBadge from '../../components/public/VotingStatusBadge';
import Button from '../../components/ui/Button';

export default function ContestantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useGetContestantQuery(id);
  const { status, timeLeft } = useVotingStatus();

  const contestant = data?.data?.contestant;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: contestant?.name, url });
      } catch {
        // user cancelled share sheet — no toast needed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) return <PageLoader label="Loading contestant..." />;
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    );
  }
  if (!contestant) return null;

  const voteDisabled = status !== 'live';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-400 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl overflow-hidden border border-ink-800 aspect-[3/4] bg-ink-900"
        >
          <img src={contestant.photo?.url} alt={contestant.name} className="w-full h-full object-cover" />
        </motion.div>

        <div>
          <Link
            to={`/categories/${contestant.category?.slug}`}
            className="text-xs uppercase tracking-wider text-gold-400 font-semibold hover:text-gold-300"
          >
            {contestant.category?.name}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-1">{contestant.name}</h1>
          {contestant.contestantNumber && (
            <p className="text-ink-500 text-sm mb-4">Contestant No. {contestant.contestantNumber}</p>
          )}

          <div className="flex items-center gap-3 mb-6">
            {status && <VotingStatusBadge status={status} timeLeft={timeLeft} />}
          </div>

          <div className="glass-panel rounded-2xl p-5 mb-6">
            <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Current Votes</p>
            <p className="text-4xl font-bold text-gradient-gold font-display">
              {formatNumber(contestant.voteCount)}
            </p>
          </div>

          {contestant.bio && (
            <p className="text-ink-300 leading-relaxed mb-6">{contestant.bio}</p>
          )}

          {contestant.instagramHandle && (
            <a
              href={`https://instagram.com/${contestant.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-gold-400 mb-8"
            >
              <AtSign className="w-4 h-4" />
              @{contestant.instagramHandle.replace('@', '')}
            </a>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              icon={Vote}
              size="lg"
              disabled={voteDisabled}
              onClick={() => navigate(`/vote/${contestant._id}`)}
              className="flex-1"
            >
              {status === 'upcoming' ? 'Voting Not Open Yet' : status === 'ended' ? 'Voting Has Ended' : 'Vote Now'}
            </Button>
            <Button variant="outline" size="lg" icon={Share2} onClick={handleShare}>
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
