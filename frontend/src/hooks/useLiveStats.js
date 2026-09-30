import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { settingsApi, useGetPublicStatsQuery } from '../features/settings/settingsApi';
import { useAppDispatch } from '../app/hooks';

/**
 * Fetches the homepage live-stats bar data once, then keeps totalVotes
 * ticking up in real time via the global 'stats:updated' socket event
 * instead of re-polling the API.
 */
export const useLiveStats = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetPublicStatsQuery();

  useEffect(() => {
    const handleStatsUpdate = ({ voteIncrement }) => {
      dispatch(
        settingsApi.util.updateQueryData('getPublicStats', undefined, (draft) => {
          if (!draft?.data) return;
          draft.data.totalVotes += voteIncrement;
        })
      );
    };

    socket.on('stats:updated', handleStatsUpdate);
    return () => socket.off('stats:updated', handleStatsUpdate);
  }, [dispatch]);

  return {
    totalVotes: data?.data?.totalVotes ?? 0,
    totalCategories: data?.data?.totalCategories ?? 0,
    totalContestants: data?.data?.totalContestants ?? 0,
    isLoading,
    isError,
  };
};
