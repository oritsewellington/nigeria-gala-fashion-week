import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectCurrentUser, selectIsAuthInitialized } from '../features/auth/authSlice';
import { PageLoader } from './ui/Loaders';

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useAppSelector(selectCurrentUser);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const location = useLocation();

  if (!isInitialized) {
    return <PageLoader label="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
