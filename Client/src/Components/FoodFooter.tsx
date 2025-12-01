import React from 'react';
import { Row, Col, Form, Button, Input, message } from 'antd';
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  PinterestOutlined,
  YoutubeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

interface FooterProps {
  companyName?: string;
  companyLogo?: string;
}

const LeafDecoration: React.FC<{ position: 'left' | 'right' }> = ({ position }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    [position]: 0,
    width: '120px',
    height: 'auto',
    opacity: 0.25,
    pointerEvents: 'none',
    zIndex: 0,
  };

  const svgPath = position === 'left'
    ? "M10,50 C30,30 50,10 100,25 C80,40 80,50 90,80 C60,70 40,90 10,50"
    : "M110,50 C90,30 70,10 20,25 C40,40 40,50 30,80 C60,70 80,90 110,50";

  return (
    <div style={style}>
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d={svgPath}
          fill="none"
          stroke="#28a745"
          strokeWidth="2"
        />
        <path
          d={position === 'left'
            ? "M55,40 C60,30 70,25 85,30"
            : "M65,40 C60,30 50,25 35,30"}
          fill="none"
          stroke="#28a745"
          strokeWidth="1.5"
        />
        <path
          d={position === 'left'
            ? "M50,55 C55,45 65,40 80,45"
            : "M70,55 C65,45 55,40 40,45"}
          fill="none"
          stroke="#28a745"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({
  companyName = "TastyHub",
  companyLogo = "/logo.png"
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubscribe = (values: { email: string }) => {
    if (values.email && values.email.includes('@')) {
      messageApi.info({
          content: "This feature is under development. Please check back later.",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
    }
  };

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo(0, 0);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: '40px',
        background: 'white',
        paddingTop: '40px',
        paddingBottom: '24px',
        borderTop: '1px solid #dee2e6',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <LeafDecoration position="left" />
      <LeafDecoration position="right" />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 15px',
        position: 'relative',
        zIndex: 1
      }}>
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} md={10}>
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
              <img
                src={companyLogo}
                alt={`${companyName} Logo`}
                style={{ marginRight: '8px' }}
                width="40"
                height="40"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <h4 style={{ marginBottom: 0, color: '#52c41a', fontSize: '24px', fontWeight: 500 }}>
                {companyName}
              </h4>
            </div>
            <p style={{ marginBottom: '24px', color: '#212529' }}>
              Bringing exceptional quality food products to your doorstep since 2005. We believe in sustainable sourcing and supporting local farmers.
            </p>
            <div style={{ marginBottom: '32px' }}>
              <h6 style={{ color: '#212529', fontSize: '16px', fontWeight: 500, marginBottom: '12px' }}>
                Connect With Us
              </h6>
              <div style={{ display: 'flex' }}>
                <Link
                  to="#"
                  style={{ marginRight: '24px', color: '#52c41a', fontSize: '18px' }}
                  aria-label="Facebook"
                  onClick={(e) => e.preventDefault()}
                >
                  <FacebookOutlined />
                </Link>
                <Link
                  to="#"
                  style={{ marginRight: '24px', color: '#52c41a', fontSize: '18px' }}
                  aria-label="Instagram"
                  onClick={(e) => e.preventDefault()}
                >
                  <InstagramOutlined />
                </Link>
                <Link
                  to="#"
                  style={{ marginRight: '24px', color: '#52c41a', fontSize: '18px' }}
                  aria-label="Twitter"
                  onClick={(e) => e.preventDefault()}
                >
                  <TwitterOutlined />
                </Link>
                <Link
                  to="#"
                  style={{ marginRight: '24px', color: '#52c41a', fontSize: '18px' }}
                  aria-label="Pinterest"
                  onClick={(e) => e.preventDefault()}
                >
                  <PinterestOutlined />
                </Link>
                <Link
                  to="#"
                  style={{ color: '#52c41a', fontSize: '18px' }}
                  aria-label="YouTube"
                  onClick={(e) => e.preventDefault()}
                >
                  <YoutubeOutlined />
                </Link>
              </div>
            </div>
          </Col>

          <Col xs={12} md={3}>
            <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
              Shop
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                to="/store"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/menu-items')}
              >
                All Products
              </Link>
              <Link
                to="#"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/newarrivals')}
              >
                New Arrivals
              </Link>
              <Link
                to="/dealsdiscount"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/dealsdiscount')}
              >
                Deals & Discounts
              </Link>
              <Link
                to="/giftcards"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/giftcards')}
              >
                Gift Cards
              </Link>
            </div>
          </Col>

          <Col xs={12} md={3}>
            <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
              Support
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                to="/contact"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/contact')}
              >
                Contact Us
              </Link>
              <Link
                to="/faq"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation("/faq")}
              >
                FAQ
              </Link>
              <Link
                to="/shoppinginfo"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/shoppinginfo')}
              >
                Shipping Info
              </Link>
              <Link
                to="/returnexchanges"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/returnexchanges')}
              >
                Returns & Exchanges
              </Link>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
              Stay Updated
            </h5>
            <p style={{ color: '#212529', marginBottom: '16px' }}>
              Subscribe to our newsletter for exclusive offers and updates on new products.
            </p>

            <Form
              form={form}
              onFinish={handleSubscribe}
              style={{ marginBottom: '24px' }}
            >
              <div style={{ display: 'flex', marginBottom: '24px' }}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                  style={{ flex: 1, marginRight: '8px', marginBottom: 0 }}
                >
                  <Input
                    placeholder="Your email address"
                    style={{
                      borderColor: '#28a745',
                      borderRadius: '6px 0 0 6px'
                    }}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    borderRadius: '0 6px 6px 0'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </Form>
            <div style={{ marginTop: '32px' }}>
              <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
                Contact Info
              </h5>
              <address style={{ marginBottom: 0, color: '#212529', fontStyle: 'normal' }}>
                <div style={{ marginBottom: '16px' }}>
                  <EnvironmentOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  1-23 Gourmet Street, Nellore
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  (+91) 99887 76655
                </div>
                <div>
                  <MailOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  support@TastyHub.com
                </div>
              </address>
            </div>
          </Col>
        </Row>

        <hr style={{ borderColor: '#52c41a', margin: '32px 0' }} />

        <Row>
          <Col xs={24} md={12} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Link
                to="/privacy"
                style={{
                  color: '#212529',
                  padding: '4px 16px',
                  borderRight: '1px solid #28a745',
                  textDecoration: 'none'
                }}
                onClick={handleNavigation('/privacy')}
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                style={{
                  color: '#212529',
                  padding: '4px 16px',
                  textDecoration: 'none'
                }}
                onClick={handleNavigation('/terms')}
              >
                Terms of Service
              </Link>
            </div>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <p style={{
              marginBottom: 0,
              color: '#6c757d',
              fontSize: '14px'
            }}>
              &copy; {currentYear} {companyName}. All rights reserved.
            </p>
          </Col>
        </Row>
      </div>
      {contextHolder}
    </footer>
  );
};

export default Footer;