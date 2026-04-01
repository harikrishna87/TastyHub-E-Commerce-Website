import { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const GoogleCallback = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const hasSentCode = useRef(false);

  useEffect(() => {
    if (hasSentCode.current) return;
    hasSentCode.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Google sign-in was cancelled or failed. Redirecting...');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    if (!code) {
      setError('No authorization code received. Redirecting...');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/auth/google`,
          { code },
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
          }
        );

        if (response.data.success) {
          auth?.login(response.data.user, response.data.token);
          navigate('/');
        } else {
          setError(response.data.message || 'Google sign-in failed. Redirecting...');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Google sign-in failed. Redirecting...';
        setError(errorMessage);
        setTimeout(() => navigate('/'), 2000);
      }
    };

    exchangeCode();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
      }}
    >
      {error ? (
        <Text type="danger" style={{ fontSize: '16px' }}>{error}</Text>
      ) : (
        <>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#52c41a' }} spin />} />
          <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>Signing you in with Google...</Text>
        </>
      )}
    </div>
  );
};

export default GoogleCallback;