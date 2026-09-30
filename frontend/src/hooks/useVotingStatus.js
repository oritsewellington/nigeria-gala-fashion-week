import { useEffect, useState, useCallback } from 'react';
import { socket } from '../lib/socket';
import { useGetPublicSettingsQuery } from '../features/settings/settingsApi';

/**
 * Combines the server-computed voting status (from /settings/public)
 * with a live socket subscription (event:statusChanged) and a local
 * countdown ticker. The countdown itself just does local math off the
 * server-provided start/end timestamps — no polling needed.
 */
export const useVotingStatus = () => {
  const { data, isLoading, isError, refetch } = useGetPublicSettingsQuery();
  const [status, setStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // ms remaining until next transition

  const settings = data?.data;

  useEffect(() => {
    if (settings?.votingStatus) setStatus(settings.votingStatus);
  }, [settings?.votingStatus]);

  useEffect(() => {
    const handleStatusChange = ({ status: newStatus }) => {
      setStatus(newStatus);
      refetch();
    };
    socket.on('event:statusChanged', handleStatusChange);
    return () => socket.off('event:statusChanged', handleStatusChange);
  }, [refetch]);

  const computeTimeLeft = useCallback(() => {
    if (!settings) return null;
    const now = Date.now();
    const start = new Date(settings.votingStartTime).getTime();
    const end = new Date(settings.votingEndTime).getTime();

    if (status === 'upcoming') return Math.max(start - now, 0);
    if (status === 'live') return Math.max(end - now, 0);
    return 0;
  }, [settings, status]);

  useEffect(() => {
    if (!settings) return undefined;

    setTimeLeft(computeTimeLeft());

    const interval = setInterval(() => {
      const remaining = computeTimeLeft();
      setTimeLeft(remaining);

      // Local safety net: if our own clock says we've crossed the
      // boundary but the server hasn't pushed an event yet, flip locally.
      if (remaining <= 0) {
        setStatus((prev) => {
          if (prev === 'upcoming') return 'live';
          if (prev === 'live') return 'ended';
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings, computeTimeLeft]);

  return {
    status, // 'upcoming' | 'live' | 'ended' | null (loading)
    timeLeft, // ms remaining
    eventName: settings?.eventName,
    eventTagline: settings?.eventTagline,
    votePrice: settings?.votePrice,
    votingStartTime: settings?.votingStartTime,
    votingEndTime: settings?.votingEndTime,
    heroImages: settings?.heroImages || [],
    isLoading,
    isError,
  };
};

/** Formats milliseconds into "Xd Xh Xm Xs" pieces for a countdown UI. */
export const formatCountdown = (ms) => {
  if (ms === null || ms === undefined || ms < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};
