import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Row, Col, Form, Button, Card, Input, Select, Typography, message, Collapse, Tag } from 'antd';
import {
  SendOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined,
  RightOutlined, QuestionCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const customStyles = `
  .contact-card {
    background: #ffffff !important;
    border: 1px solid #dcfce7 !important;
    border-radius: 20px !important;
    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.08) !important;
  }
  .contact-card:hover {
    border-color: #86efac !important;
    transform: translateY(-4px);
  }
  .glowing-icon {
    width: 50px;
    height: 50px;
    background: #f0fdf4;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #22c55e;
    font-size: 20px;
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.12);
  }
  .contact-input {
    background: #ffffff !important;
    border: 1.5px solid #d1d5db !important;
    color: #0f172a !important;
    border-radius: 10px !important;
    padding: 12px 16px !important;
    font-size: 15px !important;
  }
  .contact-input::placeholder {
    color: #94a3b8 !important;
  }
  .contact-input:focus, .contact-input:hover {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
  }
  .contact-select .ant-select-selector {
    background: #ffffff !important;
    border: 1.5px solid #d1d5db !important;
    color: #0f172a !important;
    border-radius: 10px !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
  }
  .contact-select .ant-select-selection-placeholder {
    color: #94a3b8 !important;
  }
  .contact-select.ant-select-focused .ant-select-selector,
  .contact-select:hover .ant-select-selector {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
  }
  .faq-collapse {
    background: transparent !important;
    border: none !important;
  }
  .faq-panel {
    background: #f9fffa !important;
    border: 1px solid #dcfce7 !important;
    border-radius: 12px !important;
    margin-bottom: 12px !important;
    overflow: hidden !important;
  }
  .faq-panel .ant-collapse-header {
    color: #166534 !important;
    font-weight: 600 !important;
    padding: 16px !important;
  }
  .faq-panel .ant-collapse-content {
    background: transparent !important;
    border-top: 1px solid #dcfce7 !important;
    color: #475569 !important;
  }
  .premium-btn {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
    border: none !important;
    color: white !important;
    border-radius: 10px !important;
    height: 48px !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px !important;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.25) !important;
  }
`;

const Contact: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleSubmit = (values: any) => {
    setLoading(true);
    emailjs.send('service_cypqzag', 'template_901b629', values, '78l0nLUglTZmz0VAp')
      .then(() => {
        messageApi.success({ content: 'Your message has been received. Our team will reach out soon.', duration: 4 });
        form.resetFields();
      })
      .catch((error: any) => {
        messageApi.error({ content: 'Email transmission failed. Please try again later.', duration: 4 });
        console.error('EmailJS Error:', error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ backgroundColor: '#f8faf8', color: '#0f172a', minHeight: '100vh', padding: '0.5rem 0 3rem', fontFamily: 'Outfit, sans-serif' }}>
      {contextHolder}

      <div style={{ width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Tag color="success" style={{ fontSize: '0.85rem', padding: '0.3rem 1rem', borderRadius: '100px', fontWeight: 700, border: 'none', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', marginBottom: '1rem' }}>
            CONNECT WITH TASTYHUB
          </Tag>
          <Title level={1} style={{ color: '#166534', fontWeight: 900, fontSize: '3rem', margin: '0 0 1rem 0' }}>
            Let's Start a Conversation
          </Title>
          <Paragraph style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Reach out for support, orders, catering, or feedback. We kept this page clean and consistent with the green and white customer theme.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} align="stretch">
          <Col xs={24} lg={10} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card className="contact-card" styles={{ body: { padding: '2rem' } }}>
              <Title level={3} style={{ color: '#166534', fontWeight: 800, marginBottom: '2rem' }}>Corporate Directory</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div className="glowing-icon"><EnvironmentOutlined /></div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Headquarters</span>
                    <Paragraph style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>123 Gourmet Plaza, Gachibowli, Hyderabad, India</Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div className="glowing-icon"><PhoneOutlined /></div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Support Hotline</span>
                    <Paragraph style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>+91 1800-456-9999</Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div className="glowing-icon"><MailOutlined /></div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Email Desk</span>
                    <Paragraph style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>support@tastyhub.com</Paragraph>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="contact-card" styles={{ body: { padding: '2rem' } }}>
              <Title level={3} style={{ color: '#166534', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QuestionCircleOutlined style={{ color: '#22c55e' }} />
                <span>Frequently Asked Questions</span>
              </Title>

              <Collapse expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} style={{ color: '#22c55e' }} />} className="faq-collapse">
                <Panel header="Can I schedule my delivery in advance?" key="1" className="faq-panel">
                  <span style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Yes. During checkout, choose your preferred date and timeslot for scheduled delivery.
                  </span>
                </Panel>
                <Panel header="How does wallet balance work?" key="2" className="faq-panel">
                  <span style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    If wallet payment is enabled during checkout, the available amount is deducted automatically before external payment.
                  </span>
                </Panel>
                <Panel header="How do I redeem gift cards?" key="3" className="faq-panel">
                  <span style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Open your profile, go to the Gift Cards tab, and redeem the code to credit your balance.
                  </span>
                </Panel>
              </Collapse>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card className="contact-card" style={{ height: '100%' }} styles={{ body: { padding: '3rem' } }}>
              <Title level={3} style={{ color: '#166534', fontWeight: 800, marginBottom: '0.25rem' }}>Send a Message</Title>
              <Paragraph style={{ color: '#64748b', marginBottom: '2.5rem' }}>Our team usually responds within one business hour.</Paragraph>

              <Form form={form} onFinish={handleSubmit} layout="vertical" autoComplete="off">
                <Row gutter={[20, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span style={{ color: '#166534', fontWeight: 600 }}>Full Name *</span>} name="fullname" rules={[{ required: true, message: 'Please enter your name' }]}>
                      <Input className="contact-input" placeholder="Hari Krishna" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span style={{ color: '#166534', fontWeight: 600 }}>Email Address *</span>} name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Invalid email' }]}>
                      <Input className="contact-input" placeholder="hari@example.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[20, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span style={{ color: '#166534', fontWeight: 600 }}>Phone Number *</span>} name="phone" rules={[{ required: true, message: 'Please enter phone' }]}>
                      <Input className="contact-input" placeholder="+91 98765 43210" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span style={{ color: '#166534', fontWeight: 600 }}>Preferred Dish *</span>} name="preferredDish" rules={[{ required: true, message: 'Please enter preferred dish' }]}>
                      <Input className="contact-input" placeholder="Artisan Veg Pizza" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[20, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span style={{ color: '#166534', fontWeight: 600 }}>Dietary Choices *</span>} name="dietaryRestrictions" rules={[{ required: true, message: 'Please select option' }]}>
                      <Select placeholder="Select choice" className="contact-select" style={{ width: '100%' }}>
                        <Option value="none">None</Option>
                        <Option value="vegetarian">Pure Vegetarian</Option>
                        <Option value="non-vegetarian">Non-Vegetarian</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span style={{ color: '#166534', fontWeight: 600 }}>Inquiry Category *</span>} name="orderType" rules={[{ required: true, message: 'Please select category' }]}>
                      <Select placeholder="Select category" className="contact-select" style={{ width: '100%' }}>
                        <Option value="takeaway">Takeaway</Option>
                        <Option value="delivery">Delivery</Option>
                        <Option value="catering">Catering</Option>
                        <Option value="bulk-ordering">Bulk Ordering</Option>
                        <Option value="inquiry">General Inquiry</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label={<span style={{ color: '#166534', fontWeight: 600 }}>Your Message *</span>} name="message" rules={[{ required: true, message: 'Please type your details' }]}>
                  <TextArea className="contact-input" placeholder="Tell us how we can help..." rows={5} />
                </Form.Item>

                <Form.Item style={{ marginTop: '2rem', marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" loading={loading} className="premium-btn" style={{ width: '100%' }}>
                    {loading ? 'Sending...' : <><SendOutlined style={{ marginRight: '8px' }} /> Send Message</>}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Contact;
