import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

// PrimeReact Components
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';

const customStyles = `
  .dedicated-admin-auth-container {
    background-color: #f1f5f9;
    color: #1e293b;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-family: 'Inter', 'Outfit', sans-serif;
    padding: 20px 1rem;
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
        { email, password },
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
                type="password"
                className="image-text-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
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
      </div>
    </div>
  );
};

export default AdminAuth;
