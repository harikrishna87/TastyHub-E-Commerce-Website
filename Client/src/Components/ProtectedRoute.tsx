import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Spin, message } from 'antd';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const [messageApi, contextHolder] = message.useMessage();
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
          gap: '12px'
        }}
      >
        <Spin size="large" />
        <span style={{ color: '#52c41a', fontSize: '16px' }}>Loading user data...</span>
        {contextHolder}
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
    return <Navigate to="/auth" replace />;
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