import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/features/auth/hooks/useSession.js';
import { sessionHome } from '@/features/auth/lib/session.js';

export default function AuthRoute() {
  const session = useSession();
  return session ? <Navigate to={sessionHome(session)} replace /> : <Outlet />;
}
