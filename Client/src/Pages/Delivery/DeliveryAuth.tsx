import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Toast } from 'primereact/toast';

const customStyles = `
  .auth-page-container {
    background-color: #f1f5f9;
    color: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Outfit', sans-serif;
    padding: 20px 1rem;
    min-height: calc(100vh - 120px);
  }
  .image-login-card {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 24px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04) !important;
    width: 100%;
    max-width: 480px;
    padding: 2rem 2rem !important;
  }
  .image-login-title {
    font-size: 2rem !important;
    font-weight: 800 !important;
    color: #0f172a !important;
    margin-bottom: 0.25rem !important;
    text-align: center;
    letter-spacing: -0.75px;
  }
  .image-login-subtitle {
    font-size: 0.92rem !important;
    color: #64748b !important;
    margin-bottom: 1.25rem !important;
    text-align: center;
  }
  .image-input-label {
    display: block !important;
    font-size: 0.85rem !important;
    font-weight: 700 !important;
    color: #1e293b !important;
    margin-bottom: 0.25rem !important;
    text-align: left;
  }
  .image-text-input {
    background: #ffffff !important;
    border: 1.5px solid #e2e8f0 !important;
    color: #0f172a !important;
    border-radius: 12px !important;
    padding: 8px 12px !important;
    transition: all 0.2s ease;
    font-size: 0.92rem !important;
    height: 44px !important;
    outline: none;
  }
  .image-text-input:focus, .image-text-input:hover {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12) !important;
  }
  .image-form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    font-size: 0.85rem;
  }
  .image-checkbox {
    accent-color: #22c55e !important;
    cursor: pointer;
  }
  .image-forgot-link {
    color: #22c55e !important;
    font-weight: 700;
    text-decoration: none;
  }
  .image-forgot-link:hover {
    text-decoration: underline;
  }
  .image-submit-btn {
    background: #22c55e !important;
    border: none !important;
    color: #ffffff !important;
    height: 48px !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 0.95rem !important;
    transition: all 0.2s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    width: 100%;
    margin-bottom: 1.25rem;
    cursor: pointer;
  }
  .image-submit-btn:hover:not(:disabled) {
    background: #16a34a !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2) !important;
  }
  .image-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .image-toggle-footer {
    text-align: center;
    font-size: 0.88rem;
    color: #64748b;
  }
  .image-toggle-link {
    color: #22c55e !important;
    font-weight: 700;
    cursor: pointer;
    margin-left: 4px;
  }
  .image-toggle-link:hover {
    text-decoration: underline;
  }
`;

const DeliveryAuth: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const message = {
    info: (content: string) => {
      toastRef.current?.show({ severity: 'info', summary: 'Info', detail: content });
    },
    success: (content: string) => {
      toastRef.current?.show({ severity: 'success', summary: 'Success', detail: content });
    },
    error: (content: string) => {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: content });
    },
    warning: (content: string) => {
      toastRef.current?.show({ severity: 'warn', summary: 'Warning', detail: content });
    },
  };
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    if (authContext?.isAuthenticated && authContext.user?.role === 'delivery_executive') {
      navigate('/delivery/home');
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [authContext?.isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      try {
        setLoading(true);
        const res = await axios.post(`${backendUrl}/api/delivery/login`, { email, password }, { withCredentials: true });
        
        if (res.data.success) {
          const { user, token } = res.data;
          
          if (user.deliveryStatus === 'Pending') {
            message.warning('Login approved! However, your executive profile is waiting for administrator authorization to accept deliveries.');
          } else {
            message.success(`Welcome back, Partner ${user.name}! 🛵`);
          }

          if (authContext?.login) {
            authContext.login(user, token || localStorage.getItem('token') || '');
          }
          
          navigate('/delivery/home');
        }
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const res = await axios.post(`${backendUrl}/api/delivery/register`, { name, email, password });
        if (res.data.success) {
          message.success('Registration completed successfully! Your application has been sent for administrative approval.');
          setName('');
          setEmail('');
          setPassword('');
          setMode('login');
        }
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Registration failed. Try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleMode = () => {
    setName('');
    setEmail('');
    setPassword('');
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="auth-page-container">
      <Toast ref={toastRef} />
      <div className="image-login-card">
        {mode === 'login' ? (
          <div>
            <div className="image-login-title">Delivery Portal</div>
            <div className="image-login-subtitle">Welcome back! Please login to your account</div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '14px' }}>
                <label className="image-input-label">Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-envelope" style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '1.1rem' }} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="image-text-input" 
                    placeholder="Enter your email"
                    style={{ paddingLeft: '44px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '14px' }}>
                <label className="image-input-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-lock" style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '1.1rem' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="image-text-input" 
                    placeholder="Enter your password"
                    style={{ paddingLeft: '44px', paddingRight: '44px', width: '100%' }}
                    required
                  />
                  <i 
                    className={showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'} 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
                  />
                </div>
              </div>

              <div className="image-form-footer">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="image-checkbox" 
                  />
                  <span style={{ fontWeight: 600, color: '#475569' }}>Remember me</span>
                </label>
                <a href="#forgot" className="image-forgot-link" onClick={(e) => { e.preventDefault(); message.info('Please contact support desk at partner@tastyhub.com to reset your credentials.'); }}>Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="image-submit-btn">
                {loading ? (
                  <span><i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }} /> Signing In...</span>
                ) : (
                  <>
                    <i className="pi pi-sign-in" style={{ marginRight: '8px' }} /> Sign In
                  </>
                )}
              </button>
            </form>

            <div className="image-toggle-footer">
              Don't have an account? 
              <span className="image-toggle-link" onClick={handleToggleMode}>Create Account</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="image-login-title">Apply Now</div>
            <div className="image-login-subtitle">Join Nellore's premium dining distribution fleet</div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '14px' }}>
                <label className="image-input-label">Full Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-user" style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '1.1rem' }} />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="image-text-input" 
                    placeholder="Enter your full name"
                    style={{ paddingLeft: '44px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '14px' }}>
                <label className="image-input-label">Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-envelope" style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '1.1rem' }} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="image-text-input" 
                    placeholder="Enter your email"
                    style={{ paddingLeft: '44px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '14px' }}>
                <label className="image-input-label">Secure Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-lock" style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '1.1rem' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="image-text-input" 
                    placeholder="Create secure password"
                    style={{ paddingLeft: '44px', paddingRight: '44px', width: '100%' }}
                    required
                    minLength={6}
                  />
                  <i 
                    className={showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'} 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="image-submit-btn">
                {loading ? (
                  <span><i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }} /> Submitting...</span>
                ) : (
                  <>
                    <i className="pi pi-send" style={{ marginRight: '8px' }} /> Submit Application 🚀
                  </>
                )}
              </button>
            </form>

            <div className="image-toggle-footer">
              Already have an account? 
              <span className="image-toggle-link" onClick={handleToggleMode}>Sign In</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAuth;
