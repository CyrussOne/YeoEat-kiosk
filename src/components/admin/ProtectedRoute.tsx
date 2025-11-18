import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdmin, loading, user } = useAdminAuth();
  const navigate = useNavigate();

  // TEMPORARY: Allow any logged-in user to access admin
  // TODO: Re-enable admin role check after setting up user_roles properly
  const BYPASS_ADMIN_CHECK = true;

  useEffect(() => {
    if (!loading && !BYPASS_ADMIN_CHECK && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // TEMPORARY: Check if user is logged in (bypass admin check)
  if (BYPASS_ADMIN_CHECK) {
    if (!user) {
      navigate('/admin');
      return null;
    }
    return <>{children}</>;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
