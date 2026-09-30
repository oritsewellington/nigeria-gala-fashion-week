import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { contestantsApi } from '../features/contestants/contestantsApi';
import { useAppDispatch } from '../app/hooks';

/**
 * Joins the socket room for a category and, whenever a vote:updated
 * event arrives, patches the leaderboard RTK Query cache directly
 * (re-sorting + recomputing percentages) instead of refetching.
 * This is what gives us a live-updating leaderboard with zero polling.
 */
export const useLiveLeaderboard = (categorySlug) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!categorySlug) return undefined;

    socket.emit('join:category', categorySlug);

    const handleVoteUpdate = ({ contestantId, voteCount }) => {
      dispatch(
        contestantsApi.util.updateQueryData('getLeaderboard', categorySlug, (draft) => {
          if (!draft?.data) return;

          const contestant = draft.data.contestants.find((c) => c.id === contestantId);
          if (!contestant) return;

          contestant.voteCount = voteCount;

          const newTotal = draft.data.contestants.reduce((sum, c) => sum + c.voteCount, 0);
          draft.data.totalVotes = newTotal;

          draft.data.contestants.forEach((c) => {
            c.percentage = newTotal > 0 ? Number(((c.voteCount / newTotal) * 100).toFixed(1)) : 0;
          });

          draft.data.contestants.sort((a, b) => b.voteCount - a.voteCount);
          draft.data.contestants.forEach((c, index) => {
            c.rank = index + 1;
          });
        })
      );
    };

    socket.on('vote:updated', handleVoteUpdate);

    return () => {
      socket.emit('leave:category', categorySlug);
      socket.off('vote:updated', handleVoteUpdate);
    };
  }, [categorySlug, dispatch]);
};
