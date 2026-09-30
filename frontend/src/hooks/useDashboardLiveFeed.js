import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { apiSlice } from '../app/apiSlice';
import { useAppDispatch } from '../app/hooks';

/**
 * Joins the 'dashboard' socket room so admins/hosts see stat cards
 * and the transactions feed tick up live as votes come in, without
 * polling the API on an interval.
 */
export const useDashboardLiveFeed = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    socket.emit('join:dashboard');

    const handleNewTransaction = () => {
      dispatch(apiSlice.util.invalidateTags(['Transaction']));
    };

    socket.on('transaction:new', handleNewTransaction);

    return () => {
      socket.off('transaction:new', handleNewTransaction);
    };
  }, [dispatch]);
};
