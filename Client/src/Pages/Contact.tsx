import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { Row, Col, Form, Button, Card, Input, Select, Typography, message, Spin } from 'antd';
import { SendOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ShopOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LeafDecoration: React.FC<{ position: 'left' | 'right' | 'top-left' | 'top-right' }> = ({ position }) => {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');
  
  const style: React.CSSProperties = {
    position: 'absolute',
    [isTop ? 'top' : 'bottom']: 0,
    [isLeft ? 'left' : 'right']: 0,
    width: '150px',
    height: 'auto',
    opacity: 0.15,
    pointerEvents: 'none',
    zIndex: 0,
    transform: `${isTop ? 'scaleY(-1)' : ''} ${!isLeft ? 'scaleX(-1)' : ''}`,
  };

  return (
    <div style={style}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80,40 Q120,20 160,30 Q180,60 170,100 Q160,130 120,150 Q80,130 70,100 Q60,60 80,40 Z" fill="#e8f5e9" stroke="#28a745" strokeWidth="1.5" />
        <path d="M120,150 Q120,170 130,200" stroke="#28a745" strokeWidth="1.5" fill="none" />
        <path d="M120,150 Q100,120 110,80 Q120,50 160,30" stroke="#28a745" strokeWidth="1" fill="none" />
        <path d="M110,80 Q130,85 150,70 M110,110 Q130,115 160,90" stroke="#28a745" strokeWidth="0.8" fill="none" />
        <path d="M50,90 Q60,70 80,65 Q90,80 85,100 Q70,110 50,90 Z" fill="#e8f5e9" stroke="#28a745" strokeWidth="1" />
      </svg>
    </div>
  );
};

const Contact: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [componentLoading, setComponentLoading] = useState<boolean>(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setComponentLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (values: any) => {
    setLoading(true);

    emailjs.send('service_cypqzag', 'template_901b629', values, '78l0nLUglTZmz0VAp')
      .then(
        () => {
          messageApi.success({
            content: 'Your message has been sent! We will get back to you soon.',
            duration: 4,
          });
          form.resetFields();
        },
        (error: any) => {
          messageApi.error({
            content: 'Unable to send your message. Please try again later.',
            duration: 4,
          });
          console.error('EmailJS Error:', error);
        }
      )
      .finally(() => {
        setLoading(false);
      });
  };

  if (componentLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
        <Spin size="large" style={{ color: '#52c41a' }} />
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading contact form...</Paragraph>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <style>
        {`
          .ant-input:focus, .ant-input-focused, .ant-input.ant-input-focused,
          .ant-select-focused .ant-select-selector, .ant-select-selector:focus,
          .ant-select-selector:active, .ant-select-open .ant-select-selector {
            border-color: #52c41a !important;
            box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
          }
          .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
            border-color: #73d13d !important;
          }
          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: rgba(82, 196, 26, 0.1) !important;
          }
          .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: #52c41a !important;
            color: white !important;
          }
          .ant-input:focus, .ant-select-selector:focus {
            outline: none !important;
          }
          .ant-input:hover {
            border-color: #73d13d !important;
          }
        `}
      </style>
      <section className="contact-section" style={{ position: 'relative', overflow: 'hidden', padding: '48px 0' }}>
        <LeafDecoration position="left" />
        <LeafDecoration position="right" />
        <LeafDecoration position="top-left" />
        <LeafDecoration position="top-right" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Row justify="center" style={{ marginBottom: '48px' }}>
            <Col xs={24} lg={16}>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: "#52c41a" }}>Contact Food Delights</Title>
                <Paragraph style={{ color: '#8c8c8c', fontSize: '18px', fontWeight: 300 }}>
                  <q>Have a question about our menu, catering services, or want to place a special order? Fill out the form below and our culinary team will be in touch shortly!</q>
                </Paragraph>
              </div>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Card className="contact-info-card" style={{ height: '100%', border: '2px dashed #b7eb8f', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }} bodyStyle={{ padding: '32px' }}>
                <Title level={3} style={{ marginBottom: '32px' }}>Reach Out To Us</Title>
                <div className="contact-info-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                  <div className="icon-box" style={{ marginRight: '24px', color: '#52c41a' }}>
                    <EnvironmentOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ marginBottom: 0 }}>Our Location</Title>
                    <Paragraph style={{ marginBottom: 0, color: '#8c8c8c' }}>123 Foodie Street, Nellore, Andhra Pradesh</Paragraph>
                  </div>
                </div>
                <div className="contact-info-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                  <div className="icon-box" style={{ marginRight: '24px', color: '#52c41a' }}>
                    <PhoneOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ marginBottom: 0 }}>Order Hotline</Title>
                    <Paragraph style={{ marginBottom: 0, color: '#8c8c8c' }}>+91 98765 43210</Paragraph>
                  </div>
                </div>
                <div className="contact-info-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                  <div className="icon-box" style={{ marginRight: '24px', color: '#52c41a' }}>
                    <MailOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ marginBottom: 0 }}>Email Us</Title>
                    <Paragraph style={{ marginBottom: 0, color: '#8c8c8c' }}>orders@TastyHub.com</Paragraph>
                  </div>
                </div>
                <div className="contact-info-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                  <div className="icon-box" style={{ marginRight: '24px', color: '#52c41a' }}>
                    <ShopOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ marginBottom: 0 }}>Operating Hours</Title>
                    <Paragraph style={{ marginBottom: 0, color: '#8c8c8c' }}>Mon-Sat: 10:00 AM - 10:00 PM</Paragraph>
                    <Paragraph style={{ marginBottom: 0, color: '#8c8c8c' }}>Sunday: 11:00 AM - 9:00 PM</Paragraph>
                  </div>
                </div>
                <div className="map-container" style={{ marginTop: '32px' }}>
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d45513.21203261365!2d79.96275383651195!3d14.437234694343417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4c8cca0e958771%3A0xd3036c2025161f55!2sNellore%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1743406326746!5m2!1sen!2sin" style={{ border: 0, width: '100%', height: '250px', borderRadius: '8px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Food Delights Location" />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={14}>
              <Card className="contact-form-card" style={{ border: '2px dashed #b7eb8f', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }} bodyStyle={{ padding: '48px' }}>
                <Title level={3} style={{ marginBottom: '32px' }}>Send a Message</Title>
                <Form form={form} onFinish={handleSubmit} layout="vertical" autoComplete="off">
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Full Name" name="fullname" style={{ marginBottom: '32px' }} rules={[{ required: true, message: 'Please enter your full name' }]}>
                        <Input placeholder="Your name" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Email Address" name="email" style={{ marginBottom: '32px' }} rules={[{ required: true, message: 'Please enter your email address' }, { type: 'email', message: 'Please enter a valid email address' }]}>
                        <Input type="email" placeholder="Your email" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Phone Number" name="phone" style={{ marginBottom: '32px' }} rules={[{ required: true, message: 'Please enter your phone number' }]}>
                        <Input type="tel" placeholder="Your phone number" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Preferred Dish" name="preferredDish" style={{ marginBottom: '32px' }} rules={[{ required: true, message: 'Please enter your preferred dish' }]}>
                        <Input placeholder="Your favorite dish" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Dietary Restrictions" name="dietaryRestrictions" style={{ marginBottom: '32px' }} rules={[{ required: true, message: 'Please select your dietary restrictions' }]}>
                        <Select placeholder="Select dietary restrictions" size="large" className="food-select" style={{ width: '100%' }}>
                          <Option value="none">None</Option>
                          <Option value="vegetarian">Vegetarian</Option>
                          <Option value="non-vegetarian">Non-Vegetarian</Option>
                          <Option value="other">Other (Please specify in message)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Order Type" name="orderType" style={{ marginBottom: '32px' }} rules={[{ required: true, message: 'Please select an order type' }]}>
                        <Select placeholder="Select an option" size="large" className="food-select" style={{ width: '100%' }}>
                          <Option value="takeaway">Takeaway Order</Option>
                          <Option value="delivery">Home Delivery</Option>
                          <Option value="catering">Catering Service</Option>
                          <Option value="party-orders">Party Orders</Option>
                          <Option value="bulk-ordering">Bulk Ordering</Option>
                          <Option value="inquiry">General Inquiry</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Your Message" name="message" style={{ marginBottom: '32px' }} rules={[{ required: true, message: 'Please enter your message' }]}>
                    <TextArea placeholder="Tell us about your requirements or questions" rows={6} size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" className="submit-btn" loading={loading} style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a', height: '48px' }}>
                      {loading ? ('Sending...') : (<><SendOutlined style={{ marginRight: '8px' }} /> Send Message</>)}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default Contact;