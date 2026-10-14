import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/features/auth/hooks/useSession.js';
import { ADMIN_ROLES, sessionHome } from '@/features/auth/lib/session.js';

export default function PrivateRoute({ admin = false }) {
  const session = useSession();
  if (!session) return <Navigate to="/" replace />;
  if (ADMIN_ROLES.includes(session.role) !== admin)
    return <Navigate to={sessionHome(session)} replace />;
  return <Outlet />;
}
