import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Input, Form, message, Checkbox } from 'antd';
import { AuthContext } from '../context/AuthContext';

const customStyles = `
  .auth-page-container {
    background-color: #f1f5f9;
    color: #1e293b;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Outfit', sans-serif;
    padding: 2rem 1rem;
  }
  .image-login-card {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 24px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04) !important;
    width: 100%;
    max-width: 480px;
  }
  .image-login-card .ant-card-body {
    padding: 3rem 2.5rem !important;
  }
  .image-login-title {
    font-size: 2.2rem !important;
    font-weight: 800 !important;
    color: #0f172a !important;
    margin-bottom: 0.5rem !important;
    text-align: center;
    letter-spacing: -0.75px;
  }
  .image-login-subtitle {
    font-size: 0.95rem !important;
    color: #64748b !important;
    margin-bottom: 2.5rem !important;
    text-align: center;
  }
  .image-input-label {
    display: block !important;
    font-size: 0.9rem !important;
    font-weight: 700 !important;
    color: #1e293b !important;
    margin-bottom: 0.6rem !important;
    text-align: left;
  }
  .image-text-input {
    background: #ffffff !important;
    border: 1.5px solid #e2e8f0 !important;
    color: #0f172a !important;
    border-radius: 12px !important;
    padding: 10px 14px !important;
    transition: all 0.2s ease;
    font-size: 0.95rem !important;
    height: 48px !important;
  }
  .image-text-input:focus, .image-text-input:hover {
    border-color: #0f172a !important;
    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
  }
  .image-text-input .ant-input {
    color: #0f172a !important;
    background: transparent !important;
    font-size: 0.95rem !important;
  }
  .image-text-input .ant-input::placeholder {
    color: #94a3b8 !important;
  }
  .image-form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    font-size: 0.88rem;
  }
  .image-checkbox .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #0f172a !important;
    border-color: #0f172a !important;
  }
  .image-checkbox:hover .ant-checkbox-inner {
    border-color: #0f172a !important;
  }
  .image-forgot-link {
    color: #0f172a !important;
    font-weight: 700;
    text-decoration: none;
  }
  .image-forgot-link:hover {
    text-decoration: underline;
  }
  .image-submit-btn {
    background: #000000 !important;
    border: none !important;
    color: #ffffff !important;
    height: 52px !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 1rem !important;
    transition: all 0.2s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    width: 100%;
    margin-bottom: 2rem;
    cursor: pointer;
  }
  .image-submit-btn:hover {
    background: #1e293b !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
  }
  .image-toggle-footer {
    text-align: center;
    font-size: 0.92rem;
    color: #64748b;
  }
  .image-toggle-link {
    color: #0f172a !important;
    font-weight: 700;
    cursor: pointer;
    margin-left: 4px;
  }
  .image-toggle-link:hover {
    text-decoration: underline;
  }
  .image-info-banner {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    background-color: #f8fafc;
    border: 1px dashed #cbd5e1;
    padding: 0.85rem;
    border-radius: 12px;
    margin-top: 1.5rem;
  }
`;

const DeliveryAuth: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    if (authContext?.isAuthenticated && authContext.user?.role === 'delivery_executive') {
      navigate('/delivery/dashboard');
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [authContext?.isAuthenticated, navigate]);

  const handleSubmit = async (values: any) => {
    if (mode === 'login') {
      try {
        setLoading(true);
        const res = await axios.post(`${backendUrl}/api/delivery/login`, values, { withCredentials: true });
        
        if (res.data.success) {
          const { user, token } = res.data;
          
          if (user.deliveryStatus === 'Pending') {
            message.warning({
              content: 'Login approved! However, your executive profile is waiting for administrator authorization to accept deliveries.',
              duration: 6
            });
          } else {
            message.success({
              content: `Welcome back, Partner ${user.name}! 🛵`,
              duration: 4
            });
          }

          if (authContext?.login) {
            authContext.login(user, token || localStorage.getItem('token') || '');
          }
          
          navigate('/delivery/dashboard');
        }
      } catch (err: any) {
        message.error({
          content: err.response?.data?.message || 'Login failed. Please verify credentials.',
          duration: 4
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const res = await axios.post(`${backendUrl}/api/delivery/register`, values);
        if (res.data.success) {
          message.success({
            content: 'Registration completed successfully! Your application has been sent for administrative approval.',
            duration: 7
          });
          form.resetFields();
          setMode('login');
        }
      } catch (err: any) {
        message.error({
          content: err.response?.data?.message || 'Registration failed. Try again.',
          duration: 4
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-page-container">
      <Card className="image-login-card" style={{ border: 'none' }}>
        {mode === 'login' ? (
          <div>
            <div className="image-login-title">Delivery Portal</div>
            <div className="image-login-subtitle">Welcome back! Please login to your account</div>

            <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
              <Form.Item 
                label={<span className="image-input-label">Email Address</span>} 
                name="email" 
                rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Invalid email format' }]}
              >
                <Input 
                  prefix={<i className="pi pi-envelope" style={{ color: '#94a3b8', marginRight: '8px', verticalAlign: 'middle' }} />} 
                  className="image-text-input" 
                  placeholder="Enter your email" 
                />
              </Form.Item>

              <Form.Item 
                label={<span className="image-input-label">Password</span>} 
                name="password" 
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password 
                  prefix={<i className="pi pi-lock" style={{ color: '#94a3b8', marginRight: '8px', verticalAlign: 'middle' }} />} 
                  className="image-text-input" 
                  placeholder="Enter your password" 
                  iconRender={(visible) => (visible ? <i className="pi pi-eye" style={{ cursor: 'pointer' }} /> : <i className="pi pi-eye-slash" style={{ cursor: 'pointer' }} />)}
                />
              </Form.Item>

              <div className="image-form-footer">
                <Checkbox className="image-checkbox"><span style={{ fontWeight: 600, color: '#475569' }}>Remember me</span></Checkbox>
                <a href="#forgot" className="image-forgot-link" onClick={(e) => { e.preventDefault(); message.info('Please contact support desk at partner@tastyhub.com to reset your credentials.'); }}>Forgot password?</a>
              </div>

              <Form.Item style={{ margin: 0 }}>
                <Button type="primary" htmlType="submit" loading={loading} className="image-submit-btn">
                  <i className="pi pi-sign-in" style={{ marginRight: '8px' }} /> Sign In
                </Button>
              </Form.Item>
            </Form>

            <div className="image-toggle-footer">
              Don't have an account? 
              <span className="image-toggle-link" onClick={() => { form.resetFields(); setMode('register'); }}>Create Account</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="image-login-title">Apply Now</div>
            <div className="image-login-subtitle">Join Nellore's premium dining distribution fleet</div>

            <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
              <Form.Item 
                label={<span className="image-input-label">Full Name</span>} 
                name="name" 
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input 
                  prefix={<i className="pi pi-user" style={{ color: '#94a3b8', marginRight: '8px', verticalAlign: 'middle' }} />} 
                  className="image-text-input" 
                  placeholder="Enter your full name" 
                />
              </Form.Item>

              <Form.Item 
                label={<span className="image-input-label">Email Address</span>} 
                name="email" 
                rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Invalid email' }]}
              >
                <Input 
                  prefix={<i className="pi pi-envelope" style={{ color: '#94a3b8', marginRight: '8px', verticalAlign: 'middle' }} />} 
                  className="image-text-input" 
                  placeholder="Enter your email" 
                />
              </Form.Item>

              <Form.Item 
                label={<span className="image-input-label">Secure Password</span>} 
                name="password" 
                rules={[{ required: true, message: 'Please enter password' }, { min: 6, message: 'Must be at least 6 characters' }]}
              >
                <Input.Password 
                  prefix={<i className="pi pi-lock" style={{ color: '#94a3b8', marginRight: '8px', verticalAlign: 'middle' }} />} 
                  className="image-text-input" 
                  placeholder="Create secure password" 
                  iconRender={(visible) => (visible ? <i className="pi pi-eye" style={{ cursor: 'pointer' }} /> : <i className="pi pi-eye-slash" style={{ cursor: 'pointer' }} />)}
                />
              </Form.Item>

              <Form.Item style={{ margin: 0 }}>
                <Button type="primary" htmlType="submit" loading={loading} className="image-submit-btn">
                  <i className="pi pi-send" style={{ marginRight: '8px' }} /> Submit Application 🚀
                </Button>
              </Form.Item>
            </Form>

            <div className="image-toggle-footer">
              Already have an account? 
              <span className="image-toggle-link" onClick={() => { form.resetFields(); setMode('login'); }}>Sign In</span>
            </div>
          </div>
        )}

        <div className="image-info-banner" style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <i className="pi pi-info-circle" style={{ color: '#0f172a', fontSize: '1.1rem', verticalAlign: 'middle' }} />
          <span style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4, textAlign: 'left' }}>
            All carrier applications require manual background check approval. Approval is processed within 24 hours.
          </span>
        </div>
      </Card>
    </div>
  );
};

export default DeliveryAuth;
