import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser, clearCredentials } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';
import { getErrorMessage } from '../../lib/getErrorMessage';

export default function DashboardTopbar({ onMenuClick }) {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="h-16 border-b border-ink-800 bg-ink-950/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <button type="button" onClick={onMenuClick} className="lg:hidden text-ink-300">
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <UserCircle className="w-6 h-6 text-ink-400" />
          <span className="text-ink-200 font-medium hidden sm:inline">{user?.name}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
