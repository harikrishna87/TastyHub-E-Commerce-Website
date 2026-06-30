import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

// PrimeReact Components
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

const customStyles = `
  .dedicated-admin-auth-container {
    background-color: #f1f5f9;
    color: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Outfit', sans-serif;
    padding: 20px 1rem;
    min-height: 100vh;
  }
  .dedicated-admin-auth-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 450px;
    padding: 2.25rem;
  }
  .image-login-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.25rem;
    text-align: center;
    letter-spacing: -0.75px;
  }
  .image-login-subtitle {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .image-input-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
    text-align: left;
  }
  .image-text-input {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    color: #0f172a;
    border-radius: 12px;
    padding: 8px 12px;
    transition: all 0.2s ease;
    font-size: 0.92rem;
    height: 44px;
    width: 100%;
    outline: none;
  }
  .image-text-input:focus, .image-text-input:hover {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
  }
  .image-form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    font-size: 0.85rem;
  }
  .image-forgot-link {
    color: #22c55e;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }
  .image-forgot-link:hover {
    text-decoration: underline;
  }
  .image-submit-btn {
    background: #22c55e;
    border: none;
    color: #ffffff;
    height: 48px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-bottom: 0.5rem;
    cursor: pointer;
  }
  .image-submit-btn:hover {
    background: #16a34a;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2);
  }
  .p-checkbox .p-checkbox-box.p-highlight {
    border-color: #22c55e !important;
    background: #22c55e !important;
  }
`;

const AdminAuth: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [cachedSession, setCachedSession] = useState<{
    user: any;
  } | null>(null);
  const [useDifferentAccount, setUseDifferentAccount] = useState<boolean>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchLastLogin = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/auth/last-login`, {
          withCredentials: true
        });
        if (response.data.success && response.data.user.role === 'admin') {
          setCachedSession({
            user: response.data.user
          });
        }
      } catch (err) {
        console.error('Failed to fetch last login from backend:', err);
      }
    };
    fetchLastLogin();
  }, [backendUrl]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    if (auth?.isAuthenticated && auth.user?.role === 'admin') {
      navigate('/admin/home');
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [auth?.isAuthenticated, navigate]);

  if (!auth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toastRef.current?.show({ severity: 'error', summary: 'Input Error', detail: 'Please fill in all fields.' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/login`,
        { email, password, rememberMe },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      if (response.data.success) {
        const user = response.data.user;

        if (user.role !== 'admin') {
          toastRef.current?.show({
            severity: 'error',
            summary: 'Access Denied',
            detail: 'Access Denied: Only administrators can log in here.'
          });
          setLoading(false);
          return;
        }

        auth.login(user, response.data.token);
        toastRef.current?.show({ severity: 'success', summary: 'Success', detail: 'Welcome back Administrator!' });
        navigate('/admin/home');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Authentication failed.';
      toastRef.current?.show({ severity: 'error', summary: 'Login Failed', detail: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dedicated-admin-auth-container">
      <Toast ref={toastRef} />

      {cachedSession && !useDifferentAccount ? (
        <div className="dedicated-admin-auth-card" style={{ textAlign: 'center' }}>
          <i className="pi pi-shield" style={{ fontSize: '48px', color: '#22c55e', marginBottom: '8px' }} />
          <h2 className="image-login-title">Welcome Back!</h2>
          <p className="image-login-subtitle">Continue with your previous session</p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <img
              src={cachedSession.user.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
              alt={cachedSession.user.name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #22c55e',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)'
              }}
              onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                {cachedSession.user.name}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                {cachedSession.user.email}
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await axios.post(`${backendUrl}/api/auth/continue-login`, {}, {
                  withCredentials: true
                });
                if (response.data.success) {
                  auth.login(response.data.user, response.data.token);
                  toastRef.current?.show({ severity: 'success', summary: 'Success', detail: 'Welcome back Administrator!' });
                  navigate('/admin/home');
                } else {
                  toastRef.current?.show({ severity: 'error', summary: 'Login Failed', detail: response.data.message || 'Could not restore session' });
                  setCachedSession(null);
                }
              } catch (err: any) {
                toastRef.current?.show({ severity: 'error', summary: 'Login Error', detail: err.response?.data?.message || 'Server error during auto-login' });
                setCachedSession(null);
              } finally {
                setLoading(false);
              }
            }}
            className="image-submit-btn"
            disabled={loading}
          >
            <i className="pi pi-sign-in" />
            <span>Continue as {cachedSession.user.name}</span>
          </button>

          <button
            onClick={() => setUseDifferentAccount(true)}
            style={{
              background: 'transparent',
              border: '1.5px solid #e2e8f0',
              color: '#475569',
              height: '44px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginTop: '0.5rem'
            }}
          >
            <i className="pi pi-user-plus" />
            <span>Use another account</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <Button
              type="button"
              label="Back to Home"
              icon="pi pi-arrow-left"
              link
              className="p-button-success back-to-home-btn"
              style={{ color: '#22c55e', fontWeight: 700, padding: 0 }}
              onClick={() => navigate('/user/home')}
            />
          </div>
        </div>
      ) : (
        <div className="dedicated-admin-auth-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <i className="pi pi-shield" style={{ fontSize: '48px', color: '#22c55e', marginBottom: '8px' }} />
            <div className="image-login-title">Admin Portal</div>
            <div className="image-login-subtitle">Sign in to access control center and analytics</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label className="image-input-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <i className="pi pi-envelope" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                <input
                  type="email"
                  className="image-text-input"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="image-input-label">Secure Password</label>
              <div style={{ position: 'relative' }}>
                <i className="pi pi-lock" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="image-text-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  required
                />
                <i
                  className={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '14px',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div className="image-form-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Checkbox
                  inputId="rememberMe"
                  onChange={(e) => setRememberMe(e.checked || false)}
                  checked={rememberMe}
                />
                <label htmlFor="rememberMe" style={{ fontWeight: 600, color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                  Remember me
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="image-submit-btn">
              {loading ? (
                <i className="pi pi-spin pi-spinner" />
              ) : (
                <>
                  <i className="pi pi-sign-in" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <Button
              type="button"
              label="Back to Home"
              icon="pi pi-arrow-left"
              link
              className="p-button-success back-to-home-btn"
              style={{ color: '#22c55e', fontWeight: 700, padding: 0 }}
              onClick={() => navigate('/user/home')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuth;
