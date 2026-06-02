import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Input, Form, Checkbox } from 'antd';
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
  }
  .image-login-card .ant-card-body {
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
  }
  .image-text-input:focus, .image-text-input:hover {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12) !important;
  }
  .image-text-input .ant-input {
    color: #0f172a !important;
    background: transparent !important;
    font-size: 0.92rem !important;
  }
  .image-text-input .ant-input::placeholder {
    color: #94a3b8 !important;
  }
  .image-form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    font-size: 0.85rem;
  }
  .image-checkbox .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #22c55e !important;
    border-color: #22c55e !important;
  }
  .image-checkbox:hover .ant-checkbox-inner {
    border-color: #22c55e !important;
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
  .image-submit-btn:hover {
    background: #16a34a !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2) !important;
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

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const message = {
    info: (opts: any) => {
      const msg = typeof opts === 'string' ? opts : opts.content || '';
      toastRef.current?.show({ severity: 'info', summary: 'Info', detail: msg });
    },
    success: (opts: any) => {
      const msg = typeof opts === 'string' ? opts : opts.content || '';
      toastRef.current?.show({ severity: 'success', summary: 'Success', detail: msg });
    },
    error: (opts: any) => {
      const msg = typeof opts === 'string' ? opts : opts.content || '';
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: msg });
    },
    warning: (opts: any) => {
      const msg = typeof opts === 'string' ? opts : opts.content || '';
      toastRef.current?.show({ severity: 'warn', summary: 'Warning', detail: msg });
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
          
          navigate('/delivery/home');
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
      <Toast ref={toastRef} />
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
                style={{ marginBottom: '14px' }}
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
                style={{ marginBottom: '14px' }}
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
                style={{ marginBottom: '14px' }}
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
                style={{ marginBottom: '14px' }}
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
                style={{ marginBottom: '14px' }}
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
      </Card>
    </div>
  );
};

export default DeliveryAuth;
