import React, { useState } from 'react';
import { Row, Col, Card, Button, Typography } from 'antd';
import AuthModal from '../Components/AuthModal';

const { Title, Paragraph } = Typography;

const Auth: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(true);

  const handleToggleMode = () => setIsLoginMode(prev => !prev);
  const handleClose = () => setShowModal(false);

  return (
    <div 
      style={{ 
        padding: '48px 24px',
        minHeight: 'calc(100vh - 200px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <Row justify="center">
        <Col xs={24} md={16} lg={12}>
          <Card 
            style={{ 
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
              border: 'none'
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <Title 
              level={2} 
              style={{ 
                marginBottom: '24px', 
                color: '#52c41a',
                fontWeight: 600
              }}
            >
              {isLoginMode ? 'Welcome Back!' : 'Join TastyHub!'}
            </Title>
            <Paragraph 
              style={{ 
                color: '#8c8c8c',
                marginBottom: '24px',
                fontSize: '16px'
              }}
            >
              {isLoginMode
                ? 'Login to access your cart, view your orders, and manage your account.'
                : 'Register for a new account to enjoy seamless ordering and personalized features.'}
            </Paragraph>
            <AuthModal
              show={showModal}
              onHide={handleClose}
              isLoginMode={isLoginMode}
              onToggleMode={handleToggleMode}
            />
            {!showModal && (
              <div style={{ marginTop: '24px' }}>
                <Paragraph>
                  {isLoginMode
                    ? "If the login form isn't visible, please refresh or click the login/register link in the navigation."
                    : "If the registration form isn't visible, please refresh or click the login/register link in the navigation."}
                </Paragraph>
                <Button 
                  type="primary" 
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => setShowModal(true)}
                >
                  Open {isLoginMode ? 'Login' : 'Register'} Form
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Auth;