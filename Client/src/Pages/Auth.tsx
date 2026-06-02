import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// PrimeReact Components
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="18px"
    height="18px"
    style={{ marginRight: '8px', verticalAlign: 'middle' }}
  >
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const customStyles = `
  .dedicated-auth-container {
    background-color: #f1f5f9;
    color: #1e293b;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-family: 'Inter', 'Outfit', sans-serif;
    padding: 20px 1rem;
  }
  .dedicated-auth-card {
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
    margin-bottom: 1.25rem;
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
    margin-bottom: 1.25rem;
    cursor: pointer;
  }
  .image-submit-btn:hover {
    background: #16a34a;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2);
  }
  .image-toggle-footer {
    text-align: center;
    font-size: 0.88rem;
    color: #64748b;
  }
  .image-toggle-link {
    color: #22c55e;
    font-weight: 700;
    cursor: pointer;
    margin-left: 4px;
  }
  .image-toggle-link:hover {
    text-decoration: underline;
  }
  .p-checkbox .p-checkbox-box.p-highlight {
    border-color: #22c55e !important;
    background: #22c55e !important;
  }
`;

const Auth: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // OTP Fields
  const [showOTPVerification, setShowOTPVerification] = useState<boolean>(false);
  const [registrationEmail, setRegistrationEmail] = useState<string>('');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot Password Fields
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<number>(0);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('');
  const [resetOtpValues, setResetOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const resetOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    if (auth?.isAuthenticated) {
      if (auth.user?.role === 'admin') {
        navigate('/admin/home');
      } else if (auth.user?.role === 'delivery_executive') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/');
      }
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [auth?.isAuthenticated, navigate]);

  if (!auth) {
    return null;
  }

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: `${window.location.origin}/auth/callback`,
    onError: () => {
      toastRef.current?.show({ severity: 'error', summary: 'Authentication Failed', detail: 'Google login failed. Please try again.' });
    },
  });

  const handleOtpChange = (
    index: number,
    value: string,
    values: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    values: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newValues = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setValues(newValues);
    const nextEmptyIndex = newValues.findIndex((val) => !val);
    if (nextEmptyIndex !== -1) {
      refs.current[nextEmptyIndex]?.focus();
    } else {
      refs.current[5]?.focus();
    }
  };

  const renderOtpInputs = (
    values: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleOtpChange(index, e.target.value, values, setValues, refs)}
          onKeyDown={(e) => handleOtpKeyDown(index, e, values, refs)}
          onPaste={(e) => handleOtpPaste(e, setValues, refs)}
          style={{
            width: '50px',
            height: '56px',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.3s',
          }}
          onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(34, 197, 94, 0.15)'; }}
          onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
        />
      ))}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toastRef.current?.show({ severity: 'error', summary: 'Input Error', detail: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const response = await axios.post(
          `${backendUrl}/api/auth/login`,
          { email, password },
          { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
        );

        if (response.data.success) {
          const user = response.data.user;
          
          if (user.role === 'admin') {
            toastRef.current?.show({ severity: 'error', summary: 'Access Denied', detail: 'Administrators must log in via the dedicated portal.' });
            setLoading(false);
            return;
          }

          auth.login(user, response.data.token);
          toastRef.current?.show({ severity: 'success', summary: 'Success', detail: `Welcome back ${user.name}!` });
          
          if (user.role === 'delivery_executive') {
            navigate('/delivery/dashboard');
          } else {
            navigate('/');
          }
        }
      } else {
        if (!name) {
          toastRef.current?.show({ severity: 'error', summary: 'Input Error', detail: 'Please enter your name.' });
          setLoading(false);
          return;
        }

        const response = await axios.post(
          `${backendUrl}/api/auth/register`,
          { name, email, password },
          { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
        );

        if (response.data.success) {
          setRegistrationEmail(email);
          setShowOTPVerification(true);
          toastRef.current?.show({ severity: 'success', summary: 'OTP Sent', detail: 'An OTP has been dispatched to your email address.' });
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      toastRef.current?.show({ severity: 'error', summary: 'Request Failed', detail: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    const otp = otpValues.join('');

    if (otp.length !== 6) {
      toastRef.current?.show({ severity: 'warn', summary: 'Incomplete OTP', detail: 'Please enter complete 6-digit OTP code.' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/verify-otp`,
        { email: registrationEmail, otp },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      if (response.data.success) {
        auth.login(response.data.user, response.data.token);
        toastRef.current?.show({ severity: 'success', summary: 'Verified', detail: 'Email verified successfully! Welcome to TastyHub!' });
        setShowOTPVerification(false);
        setOtpValues(['', '', '', '', '', '']);
        navigate('/');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to verify OTP.';
      toastRef.current?.show({ severity: 'error', summary: 'Verification Failed', detail: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/resend-otp`,
        { email: registrationEmail },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      if (response.data.success) {
        toastRef.current?.show({ severity: 'success', summary: 'OTP Resent', detail: 'OTP resent successfully to your email!' });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to resend OTP.';
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: errorMsg });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSendResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordStep(1);
        toastRef.current?.show({ severity: 'info', summary: 'OTP Dispatched', detail: 'Password reset OTP has been sent to your email.' });
      } else {
        toastRef.current?.show({ severity: 'error', summary: 'Request Failed', detail: data.message || 'Failed to send OTP.' });
      }
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOTP = async () => {
    const otp = resetOtpValues.join('');

    if (otp.length !== 6) {
      toastRef.current?.show({ severity: 'warn', summary: 'Incomplete OTP', detail: 'Please enter the complete OTP.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/verify-reset-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordStep(2);
        toastRef.current?.show({ severity: 'success', summary: 'OTP Verified', detail: 'OTP verified. Enter your new secure password.' });
      } else {
        toastRef.current?.show({ severity: 'error', summary: 'Invalid Code', detail: data.message || 'Invalid OTP.' });
      }
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOTP = async () => {
    setResendLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/resend-reset-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toastRef.current?.show({ severity: 'success', summary: 'Code Resent', detail: 'OTP resent successfully!' });
      } else {
        toastRef.current?.show({ severity: 'error', summary: 'Error', detail: data.message || 'Failed to resend OTP.' });
      }
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to resend OTP. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      toastRef.current?.show({ severity: 'warn', summary: 'Insecure Password', detail: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toastRef.current?.show({ severity: 'error', summary: 'Mismatch', detail: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        toastRef.current?.show({ severity: 'success', summary: 'Completed', detail: 'Password reset successfully. Please login.' });
        setShowForgotPassword(false);
        setForgotPasswordStep(0);
        setMode('login');
      } else {
        toastRef.current?.show({ severity: 'error', summary: 'Failed', detail: data.message || 'Failed to reset password.' });
      }
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to reset password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dedicated-auth-container">
      <Toast ref={toastRef} />

      <div className="dedicated-auth-card">
        <div>
          <div className="image-login-title">
            {mode === 'login' ? 'Customer Portal' : 'Create Account'}
          </div>
          <div className="image-login-subtitle">
            {mode === 'login' ? 'Welcome back! Please login to your account' : 'Join us to enjoy seamless premium food ordering'}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '14px' }}>
                <label className="image-input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <i className="pi pi-user" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="image-text-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label className="image-input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <i className="pi pi-envelope" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                <input
                  type="email"
                  className="image-text-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="image-input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="pi pi-lock" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                <input
                  type="password"
                  className="image-text-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {mode === 'login' && (
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
                <span onClick={() => { setShowForgotPassword(true); setForgotPasswordStep(0); }} className="image-forgot-link">
                  Forgot password?
                </span>
              </div>
            )}

            <button type="submit" disabled={loading} className="image-submit-btn">
              {loading ? (
                <i className="pi pi-spin pi-spinner" />
              ) : (
                <>
                  <i className="pi pi-sign-in" />
                  <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>

          <Divider align="center">
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>or continue with</span>
          </Divider>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Button
              onClick={() => googleLogin()}
              outlined
              className="p-button-secondary"
              style={{
                height: '44px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 600,
                width: '100%',
                justifyContent: 'center',
                gap: '8px',
                borderColor: '#e2e8f0',
                color: '#1e293b'
              }}
            >
              <GoogleIcon />
              <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </Button>
          </div>

          <div className="image-toggle-footer">
            {mode === 'login' ? (
              <>
                Don't have an account?
                <span className="image-toggle-link" onClick={() => setMode('register')}>
                  Create Account
                </span>
              </>
            ) : (
              <>
                Already have an account?
                <span className="image-toggle-link" onClick={() => setMode('login')}>
                  Sign In
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* OTP Dialog Overlay */}
      <Dialog
        header={<div style={{ fontWeight: 800, color: '#0f172a' }}>Verify Your Email</div>}
        visible={showOTPVerification}
        style={{ width: '90%', maxWidth: '450px', borderRadius: '24px' }}
        modal
        onHide={() => setShowOTPVerification(false)}
      >
        <div style={{ padding: '0.5rem 0', textAlign: 'center' }}>
          <i className="pi pi-shield" style={{ fontSize: '44px', color: '#22c55e', marginBottom: '12px' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            We've sent a 6-digit OTP code to <strong style={{ color: '#000000' }}>{registrationEmail}</strong>.
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Enter OTP Code
            </span>
            {renderOtpInputs(otpValues, setOtpValues, otpInputRefs)}
          </div>

          <Button
            label="Verify & Register"
            icon="pi pi-check"
            loading={loading}
            className="p-button-success"
            style={{ width: '100%', borderRadius: '12px', height: '44px', fontWeight: 700, background: '#22c55e', borderColor: '#22c55e' }}
            onClick={handleOTPVerification}
          />

          <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748b' }}>Didn't receive code? </span>
            <Button
              label="Resend OTP"
              link
              className="p-button-success"
              style={{ padding: 0, fontWeight: 700, color: '#22c55e' }}
              disabled={loading || resendLoading}
              onClick={handleResendOTP}
            />
          </div>
        </div>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog
        header={<div style={{ fontWeight: 800, color: '#0f172a' }}>Reset Password</div>}
        visible={showForgotPassword}
        style={{ width: '90%', maxWidth: '450px', borderRadius: '24px' }}
        modal
        onHide={() => setShowForgotPassword(false)}
      >
        <div style={{ padding: '0.5rem 0' }}>
          {forgotPasswordStep === 0 && (
            <form onSubmit={handleSendResetOTP}>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                Enter your registered email address below, and we'll dispatch a password reset verification code.
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="image-input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <i className="pi pi-envelope" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    className="image-text-input"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
              <Button
                type="submit"
                label="Send Verification Code"
                loading={loading}
                className="p-button-success"
                style={{ width: '100%', borderRadius: '12px', height: '44px', fontWeight: 700, background: '#22c55e', borderColor: '#22c55e' }}
              />
            </form>
          )}

          {forgotPasswordStep === 1 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Code dispatched to <strong style={{ color: '#000000' }}>{forgotPasswordEmail}</strong>. Enter code below:
              </p>
              <div style={{ marginBottom: '1.5rem' }}>
                {renderOtpInputs(resetOtpValues, setResetOtpValues, resetOtpInputRefs)}
              </div>
              <Button
                label="Verify Code"
                loading={loading}
                className="p-button-success"
                style={{ width: '100%', borderRadius: '12px', height: '44px', fontWeight: 700, marginBottom: '1rem', background: '#22c55e', borderColor: '#22c55e' }}
                onClick={handleVerifyResetOTP}
              />
              <div>
                <Button
                  label="Resend OTP"
                  link
                  className="p-button-success"
                  style={{ padding: 0, fontWeight: 700, fontSize: '0.85rem', color: '#22c55e' }}
                  disabled={loading || resendLoading}
                  onClick={handleResendResetOTP}
                />
              </div>
            </div>
          )}

          {forgotPasswordStep === 2 && (
            <form onSubmit={handleResetPasswordSubmit}>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Reset verified! Create a secure new password for your account.
              </p>
              <div style={{ marginBottom: '14px' }}>
                <label className="image-input-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <i className="pi pi-lock" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    className="image-text-input"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="image-input-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <i className="pi pi-lock" style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    className="image-text-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
              <Button
                type="submit"
                label="Reset Password"
                loading={loading}
                className="p-button-success"
                style={{ width: '100%', borderRadius: '12px', height: '44px', fontWeight: 700, background: '#22c55e', borderColor: '#22c55e' }}
              />
            </form>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default Auth;