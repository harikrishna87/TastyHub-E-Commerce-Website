import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const breadcrumbItems = [
    { 
      label: 'Terms of Service', 
      template: () => <span style={{ color: '#22c55e', fontWeight: 600 }}>Terms of Service</span> 
    }
  ];

  const breadcrumbHome = { 
    icon: 'pi pi-home', 
    command: () => navigate('/') 
  };

  const termsData = [
    {
      key: '1',
      title: 'Account Registration and Security',
      icon: 'pi pi-user',
      description: 'To access certain features of our website, you may need to create an account. You are responsible for:',
      items: [
        'Providing accurate and complete information when creating your account',
        'Maintaining the confidentiality of your account credentials',
        'All activities that occur under your account',
        'Notifying us immediately of any unauthorized use of your account'
      ]
    },
    {
      key: '2',
      title: 'Ordering and Payment',
      icon: 'pi pi-credit-card',
      description: 'When placing an order through our website:',
      items: [
        'You agree to provide current, complete, and accurate purchase information',
        'We reserve the right to refuse or cancel your order at any time for reasons including product availability, pricing errors, or suspected fraud',
        'We charge your payment method when your order is processed',
        'All payments are processed securely through certified gateway processors'
      ]
    },
    {
      key: '3',
      title: 'Product Information',
      icon: 'pi pi-info-circle',
      description: 'We strive to provide accurate product descriptions, prices, and availability information. However:',
      items: [
        'We do not warrant that product descriptions or other content is accurate, complete, reliable, or error-free',
        'Images are for illustrative purposes and may not exactly match the prepared dishes',
        'We reserve the right to limit quantities of products purchased',
        'Product availability and pricing are subject to change without notice'
      ]
    },
    {
      key: '4',
      title: 'Shipping and Delivery',
      icon: 'pi pi-truck',
      description: 'When you place an order:',
      items: [
        'Estimated delivery times are estimates and not guaranteed',
        'Risk of loss and title for items purchased pass to you upon delivery handover',
        'You are responsible for inspecting products immediately upon receipt',
        'We are not liable for delivery delays due to carrier issues or severe weather events'
      ]
    },
    {
      key: '5',
      title: 'Returns and Refunds',
      icon: 'pi pi-replay',
      description: 'Our standard return and refund policy states:',
      items: [
        'Perishable foods are non-returnable once delivery handover is signed',
        'Unopened, packaged dry ingredients can be returned within 7 days',
        'Refunds for canceled items are settled back to the source bank account in 5-7 business days',
        'Wallet deposits or gift card redemptions are non-refundable cash-outs'
      ]
    }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: 'transparent',
        gap: '1rem'
      }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Terms of Service...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: 'transparent', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} style={{ background: 'transparent', border: 'none', padding: 0 }} />
      </div>

      {/* Header section */}
      <div style={{
        color: '#22c55e',
        padding: '10px 0 30px 0',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="pi pi-file-edit" style={{ fontSize: '40px', color: '#22c55e' }} />
          <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#1f2937' }}>
            Terms of Service
          </h1>
        </div>
        <p style={{ fontSize: '16px', margin: '8px 0 0 52px', color: '#6b7280', fontWeight: 500 }}>
          Please review the terms and agreements that govern your access to TastyHub.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Core Notice */}
        <div style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <i className="pi pi-check-square" style={{ fontSize: '24px', color: '#22c55e', marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '1.05rem' }}>Agreement to Terms</h4>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
              By accessing or using the TastyHub website, catalog, and delivery networks, you agree to be bound by these comprehensive Terms of Service. If you disagree, please stop using our services immediately.
            </p>
          </div>
        </div>

        {/* Dynamic Accordion panels for full document */}
        <Accordion activeIndex={0} style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {termsData.map((section) => (
            <AccordionTab key={section.key} header={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1f2937' }}>
                <i className={`${section.icon}`} style={{ color: '#22c55e', marginRight: '8px' }} />
                {section.key}. {section.title}
              </span>
            }>
              <p style={{ lineHeight: 1.6, color: '#4b5563', fontSize: '0.98rem', marginBottom: '1.25rem' }}>
                {section.description}
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', color: '#4b5563' }}>
                {section.items.map((item, idx) => (
                  <li key={idx} style={{ lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </AccordionTab>
          ))}
        </Accordion>

        {/* Prohibited Activities Warning panel */}
        <Card style={{ borderRadius: '16px', border: '1px solid #fed7aa', backgroundColor: '#fff7ed', boxShadow: 'none' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#c2410c', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="pi pi-exclamation-triangle" style={{ color: '#f97316' }} />
            Prohibited Activities
          </h3>
          <p style={{ color: '#ea580c', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            You are strictly prohibited from copying website design elements, scrapers, APIs, or database product structures. Unauthorized penetration testing or bulk automated shopping requests are subject to immediate legal prosecution and service termination.
          </p>
        </Card>

        {/* Corporate details Card */}
        <Card style={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#1f2937', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="pi pi-building" style={{ color: '#22c55e' }} />
            Legal Entities
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            For standard business contract negotiations, legal disputes, or copyright notifications:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <i className="pi pi-map-marker" style={{ fontSize: '1.25rem', color: '#3b82f6' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>HQ Address</span>
                <span style={{ fontSize: '0.92rem', color: '#4b5563', fontWeight: 700 }}>1-23 Gourmet Street, Nellore</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <i className="pi pi-envelope" style={{ fontSize: '1.25rem', color: '#22c55e' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Secure Mail</span>
                <span style={{ fontSize: '0.92rem', color: '#4b5563', fontWeight: 700 }}>legal@tastyhub.com</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <i className="pi pi-phone" style={{ fontSize: '1.25rem', color: '#f59e0b' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Phone Hotline</span>
                <span style={{ fontSize: '0.92rem', color: '#4b5563', fontWeight: 700 }}>(+91) 99887 76655</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af', fontSize: '0.88rem', borderTop: '1px solid #f3f4f6' }}>
          <i className="pi pi-refresh" style={{ marginRight: '6px' }} />
          <span>Last Updated: {new Date().toDateString()} • Legal Protection Verified</span>
        </div>

      </div>
    </div>
  );
};

export default TermsOfService;