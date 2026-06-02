import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Tag } from 'primereact/tag';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const breadcrumbItems = [
    { 
      label: 'Privacy Policy', 
      template: () => <span style={{ color: '#22c55e', fontWeight: 600 }}>Privacy Policy</span> 
    }
  ];
  
  const breadcrumbHome = { 
    icon: 'pi pi-home', 
    command: () => navigate('/') 
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        gap: '1rem'
      }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Privacy Policy...</span>
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
          <i className="pi pi-shield" style={{ fontSize: '40px', color: '#22c55e' }} />
          <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#1f2937' }}>
            Privacy Policy
          </h1>
        </div>
        <p style={{ fontSize: '16px', margin: '8px 0 0 52px', color: '#6b7280', fontWeight: 500 }}>
          Your privacy matters to us. Learn how we collect, use, and safeguard your data.
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
          <i className="pi pi-info-circle" style={{ fontSize: '24px', color: '#22c55e', marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '1.05rem' }}>Our Commitment to Privacy</h4>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
              At TastyHub, we value your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you interact with our services.
            </p>
          </div>
        </div>

        {/* Dynamic Accordion panels for full document */}
        <Accordion activeIndex={0} style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <AccordionTab header={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1f2937' }}>
              <i className="pi pi-database" style={{ color: '#22c55e', marginRight: '8px' }} />
              1. Information We Collect
            </span>
          }>
            <p style={{ lineHeight: 1.6, color: '#4b5563', fontSize: '0.98rem', marginBottom: '1.5rem' }}>
              We collect information that you provide directly to us when you interact with our services:
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.25rem', color: '#4b5563', listStyleType: 'none' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-user" style={{ color: '#22c55e' }} />
                <span>Contact details (name, email, phone number, shipping and billing address)</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-lock" style={{ color: '#22c55e' }} />
                <span>Account credentials (username and password)</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-credit-card" style={{ color: '#22c55e' }} />
                <span>Secure payment identifiers (processed through compliant gateways)</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-history" style={{ color: '#22c55e' }} />
                <span>Order history, preferences, and culinary feedback</span>
              </li>
            </ul>
          </AccordionTab>

          <AccordionTab header={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1f2937' }}>
              <i className="pi pi-cog" style={{ color: '#22c55e', marginRight: '8px' }} />
              2. How We Use Your Information
            </span>
          }>
            <p style={{ lineHeight: 1.6, color: '#4b5563', fontSize: '0.98rem', marginBottom: '1.5rem' }}>
              We process your personal details to deliver premium culinary experiences:
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.25rem', color: '#4b5563', listStyleType: 'none' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-check-circle" style={{ color: '#22c55e' }} />
                <span>Processing, cooking, packing, and delivering orders</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-envelope" style={{ color: '#22c55e' }} />
                <span>Sending order status tracking updates and SMS alerts</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-percentage" style={{ color: '#22c55e' }} />
                <span>Distributing special loyalty discounts and announcements</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="pi pi-shield" style={{ color: '#22c55e' }} />
                <span>Enhancing site operations and preventing platform abuse</span>
              </li>
            </ul>
          </AccordionTab>

          <AccordionTab header={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1f2937' }}>
              <i className="pi pi-server" style={{ color: '#22c55e', marginRight: '8px' }} />
              3. Cookies Policy
            </span>
          }>
            <p style={{ lineHeight: 1.6, color: '#4b5563', fontSize: '0.98rem', marginBottom: '1.5rem' }}>
              We use cookies to analyze web traffic, optimize loading speeds, and remember authentication sessions. You can configure browser flags to block cookies:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ borderLeft: '4px solid #22c55e', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <Tag value="Essential" severity="success" style={{ marginBottom: '6px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Necessary for session persistence and login stability.</p>
              </div>
              <div style={{ borderLeft: '4px solid #3b82f6', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <Tag value="Functional" severity="info" style={{ marginBottom: '6px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Used to keep products loaded inside your local cart storage.</p>
              </div>
              <div style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <Tag value="Analytical" severity="warning" style={{ marginBottom: '6px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Helps us measure site access counts and visual layout clickmaps.</p>
              </div>
            </div>
          </AccordionTab>

          <AccordionTab header={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1f2937' }}>
              <i className="pi pi-key" style={{ color: '#22c55e', marginRight: '8px' }} />
              4. Data Protection and Encryption
            </span>
          }>
            <p style={{ lineHeight: 1.6, color: '#4b5563', fontSize: '0.98rem' }}>
              All database endpoints leverage secure industry-standard encryption protocols. Data transmissions between clients and servers are forced via HTTPS (SSL/TLS v1.3). Passwords are encrypted on-disk using salted bcrypt hashing routines.
            </p>
          </AccordionTab>

          <AccordionTab header={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1f2937' }}>
              <i className="pi pi-user-edit" style={{ color: '#22c55e', marginRight: '8px' }} />
              5. Customer Rights
            </span>
          }>
            <p style={{ lineHeight: 1.6, color: '#4b5563', fontSize: '0.98rem', marginBottom: '1rem' }}>
              Under active digital data frameworks, you have complete control over your private information:
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', color: '#4b5563' }}>
              <li>The right to request a complete machine-readable copy of personal data on file.</li>
              <li>The right to request immediate correction or modification of account indices.</li>
              <li>The right to complete account deletion (also known as the "right to be forgotten").</li>
            </ul>
          </AccordionTab>
        </Accordion>

        {/* Corporate details Card */}
        <Card style={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#1f2937', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="pi pi-envelope" style={{ color: '#22c55e' }} />
            Contact Our Privacy Officer
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            For privacy disputes, complete account deletions, or data requests, reach out directly:
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
                <span style={{ fontSize: '0.92rem', color: '#4b5563', fontWeight: 700 }}>privacy@tastyhub.com</span>
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
          <span>Last Updated: {new Date().toDateString()} • Privacy Protection Verified</span>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;