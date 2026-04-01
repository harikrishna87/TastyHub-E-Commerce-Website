import React, { useState, useContext, useRef } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Alert,
  Divider,
  Typography,
  message,
  Steps,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  UserAddOutlined,
  KeyOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

interface AuthModalProps {
  show: boolean;
  onHide: () => void;
  isLoginMode: boolean;
  onToggleMode: () => void;
}

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

const modalContentStyle = {
  body: { padding: '32px' },
  content: { boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: '20px' },
  mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
};

const primaryButtonStyle = {
  height: '44px',
  borderRadius: '6px',
  backgroundColor: '#52c41a',
  borderColor: '#52c41a',
  fontSize: '16px',
  fontWeight: 500,
  boxShadow: 'none',
};

const inputStyle = {
  borderRadius: '6px',
  borderColor: '#52c41a',
  boxShadow: 'none',
};

const AuthModal: React.FC<AuthModalProps> = ({ show, onHide, isLoginMode, onToggleMode }) => {
  const [form] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [showOTPVerification, setShowOTPVerification] = useState<boolean>(false);
  const [registrationEmail, setRegistrationEmail] = useState<string>('');
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<number>(0);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [resetOtpValues, setResetOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resetOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (!auth) {
    return null;
  }

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: `${window.location.origin}/auth/callback`,
    onError: () => {
      setError('Google login failed. Please try again.');
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
            border: '2px solid #52c41a',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.3s',
          }}
          onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(82, 196, 26, 0.2)'; }}
          onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
        />
      ))}
    </div>
  );

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      if (isLoginMode) {
        const response = await axios.post(
          `${backendUrl}/api/auth/login`,
          { email: values.email, password: values.password },
          { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
        );

        if (response.data.success) {
          auth.login(response.data.user, response.data.token);
          messageApi.success({ content: `Welcome back ${response.data.user.name}!`, duration: 3, style: { marginTop: '10vh' } });
          onHide();
          form.resetFields();
          navigate('/');
        } else {
          const errorMsg = response.data.message || 'An error occurred.';
          setError(errorMsg);
          messageApi.error({ content: errorMsg, duration: 3, style: { marginTop: '10vh' } });
        }
      } else {
        const response = await axios.post(
          `${backendUrl}/api/auth/register`,
          { name: values.name, email: values.email, password: values.password },
          { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
        );

        if (response.data.success) {
          setRegistrationEmail(values.email);
          setShowOTPVerification(true);
          messageApi.success({ content: 'OTP sent to your email. Please verify.', duration: 3, style: { marginTop: '10vh' } });
          form.resetFields();
        } else {
          const errorMsg = response.data.message || 'An error occurred.';
          setError(errorMsg);
          messageApi.error({ content: errorMsg, duration: 3, style: { marginTop: '10vh' } });
        }
      }
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (err.code === 'ECONNABORTED') errorMessage = 'Request timeout. Please try again.';
      else if (err.code === 'ERR_NETWORK') errorMessage = 'Cannot connect to server. Please check your connection.';
      else if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.message) errorMessage = err.message;

      setError(errorMessage);
      messageApi.error({ content: errorMessage, duration: 5, style: { marginTop: '10vh' } });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    const otp = otpValues.join('');

    if (otp.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/verify-otp`,
        { email: registrationEmail, otp },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      if (response.data.success) {
        auth.login(response.data.user, response.data.token);
        messageApi.success({ content: 'Email verified successfully! Welcome to TastyHub!', duration: 3, style: { marginTop: '10vh' } });
        setShowOTPVerification(false);
        onHide();
        setOtpValues(['', '', '', '', '', '']);
        navigate('/');
      } else {
        const errorMsg = response.data.message || 'Invalid OTP.';
        setError(errorMsg);
        messageApi.error({ content: errorMsg, duration: 3, style: { marginTop: '10vh' } });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify OTP.';
      setError(errorMessage);
      messageApi.error({ content: errorMessage, duration: 3, style: { marginTop: '10vh' } });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/resend-otp`,
        { email: registrationEmail },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      if (response.data.success) {
        messageApi.success({ content: 'OTP resent successfully!', duration: 3, style: { marginTop: '10vh' } });
      } else {
        const errorMsg = response.data.message || 'Failed to resend OTP.';
        setError(errorMsg);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP.';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleSendResetOTP = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordEmail(values.email);
        setForgotPasswordStep(1);
        messageApi.success({ content: 'OTP sent to your email.', duration: 3, style: { marginTop: '10vh' } });
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOTP = async () => {
    const otp = resetOtpValues.join('');

    if (otp.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    setError(null);

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
        messageApi.success({ content: 'OTP verified. Enter your new password.', duration: 3, style: { marginTop: '10vh' } });
      } else {
        setError(data.message || 'Invalid OTP.');
      }
    } catch {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/auth/resend-reset-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (data.success) {
        messageApi.success({ content: 'OTP resent successfully!', duration: 3, style: { marginTop: '10vh' } });
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, newPassword: values.newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        messageApi.success({ content: 'Password reset successfully. Please login.', duration: 3, style: { marginTop: '10vh' } });
        handleCloseForgotPassword();
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    form.resetFields();
    setError(null);
    onHide();
  };

  const handleToggleMode = () => {
    form.resetFields();
    setError(null);
    onToggleMode();
  };

  const handleOpenForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep(0);
    setForgotPasswordEmail('');
    setResetOtpValues(['', '', '', '', '', '']);
    setError(null);
    forgotPasswordForm.resetFields();
    handleModalClose();
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(0);
    setForgotPasswordEmail('');
    setResetOtpValues(['', '', '', '', '', '']);
    setError(null);
    forgotPasswordForm.resetFields();
  };

  const handleBackFromOTP = () => {
    setShowOTPVerification(false);
    setRegistrationEmail('');
    setError(null);
    setOtpValues(['', '', '', '', '', '']);
  };

  const sharedStyles = `
    .no-hover-effect:hover { border-color: inherit !important; box-shadow: none !important; }
    .no-hover-effect:focus { border-color: inherit !important; box-shadow: none !important; }
    .ant-btn.no-hover-effect:hover { background-color: inherit !important; border-color: inherit !important; box-shadow: none !important; }
    .ant-btn-primary.no-hover-effect:hover { background-color: #28a745 !important; border-color: #28a745 !important; }
  `;

  return (
    <>
      {contextHolder}

      <Modal
        open={show && !showOTPVerification && !showForgotPassword}
        onCancel={handleModalClose}
        footer={null}
        centered
        width={480}
        closable
        styles={modalContentStyle}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ color: '#52c41a', margin: '0 0 8px 0', fontWeight: 600 }}>
            {isLoginMode ? 'Login to TastyHub' : 'Register for TastyHub'}
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
            {isLoginMode ? 'Sign in to your account' : 'Create your account today'}
          </Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px', borderRadius: '6px', boxShadow: 'none' }} />}

        <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false} size="large">
          {!isLoginMode && (
            <Form.Item name="name" label={<Text strong>Full Name</Text>} rules={[{ required: true, message: 'Please enter your name' }]} style={{ marginBottom: '20px' }}>
              <Input prefix={<UserOutlined style={{ color: '#52c41a' }} />} placeholder="Enter your name" style={inputStyle} className="no-hover-effect" />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label={<Text strong>Email address</Text>}
            rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}
            style={{ marginBottom: '20px' }}
          >
            <Input prefix={<MailOutlined style={{ color: '#52c41a' }} />} placeholder="Enter email" style={inputStyle} className="no-hover-effect" />
          </Form.Item>

          <Form.Item name="password" label={<Text strong>Password</Text>} rules={[{ required: true, message: 'Please enter your password' }]} style={{ marginBottom: '8px' }}>
            <Input.Password prefix={<LockOutlined style={{ color: '#52c41a' }} />} placeholder="Password" style={inputStyle} className="no-hover-effect" />
          </Form.Item>

          {isLoginMode && (
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link onClick={handleOpenForgotPassword} style={{ color: '#52c41a', fontWeight: 500, textDecoration: 'none', fontSize: '14px' }} className="no-hover-effect">
                Forgot Password?
              </Link>
            </div>
          )}

          <Form.Item style={{ marginBottom: '20px', marginTop: !isLoginMode ? '24px' : '0' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={isLoginMode ? <LoginOutlined /> : <UserAddOutlined />}
              style={primaryButtonStyle}
              className="no-hover-effect"
            >
              {isLoginMode ? 'Login' : 'Register'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '20px 0', color: '#8c8c8c' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>or continue with</Text>
        </Divider>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Button
            onClick={() => googleLogin()}
            block
            size="large"
            style={{ height: '44px', borderRadius: '6px', fontSize: '15px', fontWeight: 500, boxShadow: 'none', border: '1px solid #dadce0', color: '#3c4043', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <GoogleIcon />
            {isLoginMode ? 'Sign in with Google' : 'Sign up with Google'}
          </Button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <Link onClick={handleToggleMode} style={{ color: '#52c41a', fontWeight: 500, textDecoration: 'none', fontSize: '14px' }} className="no-hover-effect">
            {isLoginMode ? 'Register' : 'Login'}
          </Link>
        </div>

        <style>{sharedStyles}</style>
      </Modal>

      <Modal
        open={showOTPVerification}
        onCancel={handleBackFromOTP}
        footer={null}
        centered
        width={480}
        closable
        styles={modalContentStyle}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <SafetyOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={3} style={{ color: '#52c41a', margin: '0 0 8px 0', fontWeight: 600 }}>Verify Your Email</Title>
          <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
            We've sent a 6-digit OTP to <span style={{ color: '#52c41a' }}>{registrationEmail}</span>. Please check your Spam or Junk folder if you don't see it.
          </Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px', borderRadius: '6px', boxShadow: 'none' }} />}

        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '12px' }}>Enter OTP</Text>
          {renderOtpInputs(otpValues, setOtpValues, otpInputRefs)}
        </div>

        <Button
          type="primary"
          onClick={handleOTPVerification}
          loading={loading}
          block
          size="large"
          icon={<SafetyOutlined />}
          style={{ ...primaryButtonStyle, marginBottom: '20px' }}
          className="no-hover-effect"
        >
          Verify OTP
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>Didn't receive the OTP? </Text>
          <Button
            type="link"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleResendOTP(); }}
            style={{ color: '#52c41a', fontWeight: 500, padding: 0, height: 'auto', fontSize: '14px' }}
            disabled={loading || resendLoading}
            loading={resendLoading}
          >
            Resend OTP
          </Button>
        </div>

        <style>{sharedStyles}</style>
      </Modal>

      <Modal
        open={showForgotPassword}
        onCancel={handleCloseForgotPassword}
        footer={null}
        centered
        width={480}
        closable
        styles={modalContentStyle}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ color: '#52c41a', margin: '0 0 8px 0', fontWeight: 600 }}>Reset Password</Title>
          <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
            {forgotPasswordStep === 0 && 'Enter your email to receive a reset OTP'}
            {forgotPasswordStep === 1 && 'Enter the OTP sent to your email'}
            {forgotPasswordStep === 2 && 'Enter your new password'}
          </Text>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Steps
            current={forgotPasswordStep}
            size="small"
            items={[
              { title: 'Email', icon: <MailOutlined /> },
              { title: 'Verify OTP', icon: <SafetyOutlined /> },
              { title: 'New Password', icon: <KeyOutlined /> },
            ]}
          />
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px', borderRadius: '6px', boxShadow: 'none' }} />}

        {forgotPasswordStep === 0 && (
          <Form form={forgotPasswordForm} onFinish={handleSendResetOTP} layout="vertical" requiredMark={false} size="large">
            <Form.Item
              name="email"
              label={<Text strong>Email Address</Text>}
              rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}
              style={{ marginBottom: '24px' }}
            >
              <Input prefix={<MailOutlined style={{ color: '#52c41a' }} />} placeholder="Enter your email" style={inputStyle} className="no-hover-effect" />
            </Form.Item>
            <Form.Item style={{ marginBottom: '0' }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" style={primaryButtonStyle} className="no-hover-effect">
                Send OTP
              </Button>
            </Form.Item>
          </Form>
        )}

        {forgotPasswordStep === 1 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>Enter OTP</Text>
              <Text style={{ display: 'block', marginBottom: '16px', fontSize: '13px', color: '#8c8c8c' }}>
                Code sent to <span style={{ color: '#52c41a' }}>{forgotPasswordEmail}</span>
              </Text>
              {renderOtpInputs(resetOtpValues, setResetOtpValues, resetOtpInputRefs)}
            </div>

            <Button
              type="primary"
              onClick={handleVerifyResetOTP}
              loading={loading}
              block
              size="large"
              icon={<SafetyOutlined />}
              style={{ ...primaryButtonStyle, marginBottom: '16px' }}
              className="no-hover-effect"
            >
              Verify OTP
            </Button>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>Didn't receive the OTP? </Text>
              <Button
                type="link"
                onClick={handleResendResetOTP}
                style={{ color: '#52c41a', fontWeight: 500, padding: 0, height: 'auto', fontSize: '14px' }}
                disabled={loading || resendLoading}
                loading={resendLoading}
              >
                Resend OTP
              </Button>
            </div>
          </div>
        )}

        {forgotPasswordStep === 2 && (
          <Form form={forgotPasswordForm} onFinish={handleResetPassword} layout="vertical" requiredMark={false} size="large">
            <Form.Item
              name="newPassword"
              label={<Text strong>New Password</Text>}
              rules={[{ required: true, message: 'Please enter new password' }, { min: 8, message: 'Password must be at least 8 characters' }]}
              style={{ marginBottom: '20px' }}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#52c41a' }} />} placeholder="Enter new password" style={inputStyle} className="no-hover-effect" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<Text strong>Confirm New Password</Text>}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
              style={{ marginBottom: '24px' }}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#52c41a' }} />} placeholder="Confirm new password" style={inputStyle} className="no-hover-effect" />
            </Form.Item>

            <Form.Item style={{ marginBottom: '0' }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" style={primaryButtonStyle} className="no-hover-effect">
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        )}

        <style>{sharedStyles}</style>
      </Modal>
    </>
  );
};

export default AuthModal;