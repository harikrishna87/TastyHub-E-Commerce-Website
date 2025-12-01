import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import OrderAnalytics from '../Pages/OrderAnalytics';
import Homepage from '../Pages/Home';
import { Spin } from 'antd';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const auth = useContext(AuthContext);

  if (auth?.isLoading) {
    return (
      <div 
        style={{ 
          padding: '3rem 0',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        <Spin size="large" />
        <p style={{ marginTop: '1rem', color: '#52c41a', marginBottom: 0 }}>Loading...</p>
      </div>
    );
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && auth.user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const RoleBasedApp: React.FC = () => {
  const auth = useContext(AuthContext);

  if (auth?.isLoading) {
    return (
      <div 
        style={{ 
          padding: '3rem 0',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        <Spin size="large" />
        <p style={{ marginTop: '1rem', color: '#52c41a', marginBottom: 0 }}>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            auth?.isAuthenticated && auth.user?.role === 'admin' 
              ? <Navigate to="/admin" replace />
              : <Homepage />
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <OrderAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/menu-items" 
          element={
            auth?.user?.role === 'admin' 
              ? <Navigate to="/admin" replace />
              : <Homepage />
          } 
        />
        <Route 
          path="*" 
          element={
            <Navigate 
              to={auth?.user?.role === 'admin' ? "/admin" : "/"} 
              replace 
            />
          } 
        />
      </Routes>
    </Router>
  );
};

export default RoleBasedApp;