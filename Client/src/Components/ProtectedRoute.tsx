import React, { useContext, useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin' | 'delivery_executive')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const messageApi = {
    error: (opts: any) => (window as any).showToast?.('error', 'Access Denied', typeof opts === 'string' ? opts : opts.content || ''),
  };
  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  const { isAuthenticated, isLoading, user } = auth;
  // Track if this instance was ever authenticated. If so, it means the user logged out intentionally
  // during this route mount, so we should skip showing the login error toast.
  const wasAuthenticatedRef = useRef(isAuthenticated);

  if (isAuthenticated && !wasAuthenticatedRef.current) {
    wasAuthenticatedRef.current = true;
  }

  useEffect(() => {
    if (!isLoading) {
      const logoutIntentional = localStorage.getItem('logout_intentional') === 'true';
      if (logoutIntentional) {
        setTimeout(() => {
          localStorage.removeItem('logout_intentional');
        }, 100);
        return;
      }

      if (!isAuthenticated && !wasAuthenticatedRef.current) {
        messageApi.error({
          content: "You need to login to access this feature",
        });
      } else if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
        messageApi.error({
          content: "You do not have permission to access this page",
        });
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading user data...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;