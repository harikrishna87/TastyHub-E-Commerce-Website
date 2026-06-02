import React, { useContext } from 'react';
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
    messageApi.error({
      content: "You need to login to access this feature",
      duration: 3,
      style: {
        marginTop: '20vh',
      },
    });
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    messageApi.error({
      content: "You do not have permission to access this page",
      duration: 3,
      style: {
        marginTop: '20vh',
      },
    });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;