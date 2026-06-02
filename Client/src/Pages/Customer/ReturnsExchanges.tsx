import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Steps } from 'primereact/steps';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Link } from 'react-router-dom';

const ReturnsExchanges: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const shownotification = () => {
    if ((window as any).showToast) {
      (window as any).showToast('info', 'Upcoming Feature', 'This feature will be added in an upcoming update.');
    } else {
      alert('This feature will be added in an upcoming update.');
    }
  };

  const policyTypes = [
    {
      icon: 'pi pi-refresh',
      title: 'Food Quality Issues',
      description: 'Full refund or replacement for quality concerns',
      timeframe: 'Within 2 hours',
      color: '#22c55e',
      bgColor: '#f0fdf4'
    },
    {
      icon: 'pi pi-sync',
      title: 'Wrong Order',
      description: 'Immediate replacement or full refund',
      timeframe: 'Within 1 hour',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      icon: 'pi pi-clock',
      title: 'Late Delivery',
      description: 'Partial refund or credit for future orders',
      timeframe: 'Delivery time +30 mins',
      color: '#f97316',
      bgColor: '#fff7ed'
    },
    {
      icon: 'pi pi-exclamation-circle',
      title: 'Missing Items',
      description: 'Immediate delivery or refund for missing items',
      timeframe: 'Within 2 hours',
      color: '#ec4899',
      bgColor: '#fdf2f8'
    }
  ];

  const stepsItems = [
    { label: 'Contact Us' },
    { label: 'Review' },
    { label: 'Offer' },
    { label: 'Complete' }
  ];

  const eligibleReasons = [
    { icon: 'pi pi-exclamation-triangle', text: 'Food arrived cold or spoiled', severity: 'high' },
    { icon: 'pi pi-shopping-cart', text: 'Incorrect items delivered', severity: 'high' },
    { icon: 'pi pi-clock', text: 'Significant delivery delays', severity: 'medium' },
    { icon: 'pi pi-exclamation-circle', text: 'Missing items from order', severity: 'high' },
    { icon: 'pi pi-star', text: 'Food quality below standards', severity: 'medium' },
    { icon: 'pi pi-shield', text: 'Food safety concerns', severity: 'high' }
  ];

  const refundMethods = [
    {
      method: 'Original Payment Method',
      timeframe: '3-5 business days',
      description: 'Refunded to your original card or payment method',
      icon: 'pi pi-credit-card'
    },
    {
      method: 'Store Credit',
      timeframe: 'Immediate',
      description: 'Credit added to your account for future orders',
      icon: 'pi pi-star'
    },
    {
      method: 'Gift Card',
      timeframe: 'Immediate',
      description: 'Digital gift card sent via email',
      icon: 'pi pi-gift'
    }
  ];

  const satisfactionSteps = [
    {
      icon: 'pi pi-phone',
      children: 'Customer contacts us with concern',
      color: 'blue',
    },
    {
      icon: 'pi pi-file',
      children: 'Issue documented and reviewed by quality team',
      color: 'orange',
    },
    {
      icon: 'pi pi-heart',
      children: 'Resolution offered based on our satisfaction guarantee',
      color: 'green',
    },
    {
      icon: 'pi pi-check-circle',
      children: 'Customer satisfaction confirmed and issue resolved',
      color: 'green',
    }
  ];

  const breadcrumbItems = [
    {
      template: () => (
        <Link to="/returns" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#22c55e', fontWeight: 600 }}>
          <i className="pi pi-refresh" />
          <span>Returns & Exchanges</span>
        </Link>
      )
    }
  ];
  const breadcrumbHome = {
    template: () => (
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#64748b' }}>
        <i className="pi pi-home" />
        <span>Home</span>
      </Link>
    )
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'transparent'
      }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Returns & Exchanges...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: 'transparent', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%' }}>
        
        {/* Breadcrumb Container */}
        <div style={{ marginBottom: '24px' }}>
          <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} style={{ background: 'transparent', border: 'none', padding: 0 }} />
        </div>

        {/* Title Section */}
        <div style={{ color: '#22c55e', padding: '10px 0 24px 0', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="pi pi-refresh" style={{ fontSize: '40px' }} />
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 800, color: '#1f2937' }}>
              Returns & Exchanges
            </h1>
          </div>
          <p style={{ fontSize: '16px', margin: '8px 0 0 52px', color: '#6b7280' }}>
            Your satisfaction is our priority. Learn about our return and exchange policies.
          </p>
        </div>

        <div style={{ padding: '0 8px' }}>
          {/* Quick Help Alert */}
          <div style={{
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            marginBottom: '32px',
            borderRadius: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '16px',
            color: '#15803d'
          }}>
            <i className="pi pi-shield" style={{ fontSize: '20px', color: '#22c55e', marginTop: '3px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>100% Satisfaction Guarantee</strong>
              <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                At TastyHub, we stand behind every meal we serve. If you\'re not completely satisfied, we\'ll make it right with a full refund or replacement.
              </span>
            </div>
          </div>

          {/* Return & Exchange Policies Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-file" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Return & Exchange Policies
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginTop: '12px'
            }}>
              {policyTypes.map((policy, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    padding: '20px 16px',
                    borderLeft: `4px solid ${policy.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    backgroundColor: `${policy.color}15`,
                    padding: '10px',
                    borderRadius: '50%',
                    color: policy.color,
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px'
                  }}>
                    <i className={policy.icon} />
                  </div>
                  <h4 style={{ margin: 0, color: policy.color, fontSize: '16px', fontWeight: 700 }}>{policy.title}</h4>
                  <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>{policy.description}</span>
                  <Tag value={policy.timeframe} style={{ alignSelf: 'start', backgroundColor: policy.color, color: 'white', borderRadius: '6px', fontSize: '12px' }} />
                </div>
              ))}
            </div>
          </Card>

          {/* Eligible Return Reasons Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-check-circle" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Eligible Return Reasons
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
              We accept returns and provide refunds for the following reasons:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {eligibleReasons.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                  <div style={{
                    backgroundColor: item.severity === 'high' ? '#fef2f2' : '#fff7ed',
                    padding: '8px',
                    borderRadius: '50%',
                    color: item.severity === 'high' ? '#ef4444' : '#f97316',
                    fontSize: '16px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={item.icon} />
                  </div>
                  <div>
                    <span style={{ fontSize: '15px', color: '#1f2937', fontWeight: 600, display: 'block' }}>{item.text}</span>
                    <Tag 
                      value={item.severity === 'high' ? 'High Priority' : 'Standard'} 
                      severity={item.severity === 'high' ? 'danger' : 'warning'} 
                      style={{ fontSize: '11px', marginTop: '4px', borderRadius: '4px' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Return Process Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-comments" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Return Process
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{ margin: '16px 0 24px 0' }}>
              <Steps model={stepsItems} activeIndex={3} readOnly style={{ fontSize: '14px' }} />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '12px',
              color: '#1e3a8a'
            }}>
              <i className="pi pi-info-circle" style={{ fontSize: '18px', color: '#3b82f6', marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>Quick Resolution</strong>
                <span style={{ fontSize: '13px' }}>Most returns are processed within 2 hours during business hours. Emergency food safety issues are handled immediately.</span>
              </div>
            </div>
          </Card>

          {/* Refund Methods Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-money-bill" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Refund Methods
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginTop: '12px'
            }}>
              {refundMethods.map((method, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '16px',
                    border: '2px dashed #22c55e',
                    padding: '20px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    backgroundColor: '#dcfce7',
                    padding: '12px',
                    borderRadius: '50%',
                    color: '#22c55e',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px'
                  }}>
                    <i className={method.icon} />
                  </div>
                  <h4 style={{ margin: 0, color: '#166534', fontSize: '16px', fontWeight: 700 }}>{method.method}</h4>
                  <span style={{ fontSize: '14px', color: '#4b5563' }}>{method.description}</span>
                  <Tag value={method.timeframe} severity="info" style={{ borderRadius: '6px', fontSize: '12px', border: '1px dashed' }} />
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Satisfaction Process Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-heart" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Customer Satisfaction Process
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
              Our commitment to your satisfaction follows a structured process:
            </p>
            <div style={{ marginTop: '16px' }}>
              <Timeline
                value={satisfactionSteps}
                align="left"
                marker={(step) => (
                  <span style={{
                    display: 'flex',
                    width: '32px',
                    height: '32px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    borderRadius: '50%',
                    backgroundColor: step.color === 'green' ? '#22c55e' : step.color === 'orange' ? '#f97316' : '#3b82f6',
                    fontSize: '14px'
                  }}>
                    <i className={step.icon} />
                  </span>
                )}
                content={(step) => (
                  <div style={{ paddingLeft: '12px', paddingBottom: '20px', fontSize: '15px', color: '#374151', fontWeight: 500 }}>
                    {step.children}
                  </div>
                )}
              />
            </div>
          </Card>

          {/* Important Notes Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-bell" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Important Notes
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px', color: '#92400e' }}>
                <i className="pi pi-exclamation-triangle" style={{ fontSize: '18px', marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>Time Sensitive</strong>
                  <span style={{ fontSize: '13px' }}>For food safety and quality reasons, returns must be reported within 2 hours of delivery.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', color: '#1e3a8a' }}>
                <i className="pi pi-info-circle" style={{ fontSize: '18px', marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>Photo Documentation</strong>
                  <span style={{ fontSize: '13px' }}>For quality issues, photos help us improve our service and process your return faster.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', color: '#15803d' }}>
                <i className="pi pi-check-circle" style={{ fontSize: '18px', marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>No Questions Asked</strong>
                  <span style={{ fontSize: '13px' }}>We believe in making things right. If you\'re not satisfied, we\'ll find a solution that works for you.</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Us Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-phone" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Contact Us for Returns
                </h3>
              </div>
            }
            style={{ marginBottom: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '20px' }}>
              Need to return or exchange an order? Contact our customer service team:
            </p>

            <div
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                padding: '24px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>
                <i className="pi pi-users" style={{ color: '#22c55e' }} />
                <span>TastyHub Returns Department</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-phone" style={{ color: '#ef4444', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Emergency Line</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>(+91) 99887 76655</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-envelope" style={{ color: '#22c55e', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Email Support</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>returns@TastyHub.com</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-clock" style={{ color: '#f97316', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Support Hours</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>24/7 Emergency | 8 AM - 10 PM Regular</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-map-marker" style={{ color: '#3b82f6', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Service Area</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>Nellore & Surrounding Areas</span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Button label="Call Now" icon="pi pi-phone" className="p-button-success" style={{ borderRadius: '8px' }} onClick={shownotification} />
                <Button label="Send Email" icon="pi pi-envelope" className="p-button-outlined p-button-success" style={{ borderRadius: '8px' }} onClick={shownotification} />
                <Button label="Live Chat" icon="pi pi-comments" className="p-button-outlined p-button-secondary" style={{ borderRadius: '8px' }} onClick={shownotification} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReturnsExchanges;