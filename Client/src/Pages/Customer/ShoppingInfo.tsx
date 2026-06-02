import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Link } from 'react-router-dom';

const ShoppingInfo: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const orderingMethods = [
    {
      icon: 'pi pi-globe',
      title: 'Online Ordering',
      description: 'Order from our website 24/7',
      features: ['Full menu access', 'Real-time tracking', 'Saved preferences']
    },
    {
      icon: 'pi pi-phone',
      title: 'Phone Orders',
      description: 'Call us to place your order',
      features: ['Personal assistance', 'Custom requests', 'Quick reorders']
    },
    {
      icon: 'pi pi-shopping-bag',
      title: 'In-Store Pickup',
      description: 'Order ahead and pickup',
      features: ['Skip the line', 'Fresh preparation', 'Direct interaction']
    }
  ];

  const deliveryZones = [
    { zone: 'Zone 1', area: 'Nellore City Center', time: '30-45 mins', fee: '₹40', color: '#22c55e' },
    { zone: 'Zone 2', area: 'Surrounding Areas', time: '45-60 mins', fee: '₹60', color: '#3b82f6' },
    { zone: 'Zone 3', area: 'Extended Areas', time: '60-75 mins', fee: '₹80', color: '#f97316' }
  ];

  const paymentMethods = [
    { icon: 'pi pi-credit-card', method: 'Credit/Debit Cards', description: 'Visa, MasterCard, RuPay' },
    { icon: 'pi pi-indian-rupee', method: 'UPI & Digital Wallets', description: 'Google Pay, PhonePe, Paytm' },
    { icon: 'pi pi-money-bill', method: 'Cash on Delivery', description: 'Pay when your order arrives' },
    { icon: 'pi pi-gift', method: 'Gift Cards', description: 'Use your TastyHub gift cards' }
  ];

  const orderSteps = [
    { icon: 'pi pi-shopping-cart', title: 'Browse Menu', description: 'Explore our delicious offerings' },
    { icon: 'pi pi-plus', title: 'Add to Cart', description: 'Select your favorite items' },
    { icon: 'pi pi-credit-card', title: 'Checkout', description: 'Review and complete payment' },
    { icon: 'pi pi-spinner', title: 'Preparation', description: 'We prepare your fresh order' },
    { icon: 'pi pi-check-circle', title: 'Delivery', description: 'Enjoy your meal!' }
  ];

  const qualityFeatures = [
    { icon: 'pi pi-star', text: 'Fresh ingredients sourced daily', color: '#22c55e' },
    { icon: 'pi pi-shield', text: 'Food safety certified kitchen', color: '#3b82f6' },
    { icon: 'pi pi-clock', text: 'Made-to-order preparation', color: '#f97316' },
    { icon: 'pi pi-lock', text: 'Temperature-controlled delivery', color: '#ec4899' }
  ];

  const breadcrumbItems = [
    {
      template: () => (
        <Link to="/user/shoppinginfo" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#22c55e', fontWeight: 600 }}>
          <i className="pi pi-shopping-cart" />
          <span>Shopping Info</span>
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
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Shopping Info...</span>
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
            <i className="pi pi-shopping-cart" style={{ fontSize: '40px' }} />
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 800, color: '#1f2937' }}>
              Shopping Information
            </h1>
          </div>
          <p style={{ fontSize: '16px', margin: '8px 0 0 52px', color: '#6b7280' }}>
            Everything you need to know about ordering from TastyHub
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
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '16px',
            color: '#1e3a8a'
          }}>
            <i className="pi pi-info-circle" style={{ fontSize: '20px', color: '#3b82f6', marginTop: '3px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>Easy Ordering, Fresh Food</strong>
              <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                At TastyHub, we make it simple to enjoy delicious, fresh food. Order online, by phone, or visit us in person. We're committed to quality and convenience.
              </span>
            </div>
          </div>

          {/* How to Order Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-shopping-cart" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  How to Order
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
              {orderingMethods.map((method, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '16px',
                    border: '2px dashed #22c55e',
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#dcfce7',
                      padding: '12px',
                      borderRadius: '50%',
                      color: '#22c55e',
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '50px',
                      height: '50px'
                    }}
                  >
                    <i className={method.icon} />
                  </div>

                  <h4 style={{ margin: 0, color: '#166534', fontSize: '18px', fontWeight: 700 }}>
                    {method.title}
                  </h4>

                  <span style={{ fontSize: '14px', color: '#4b5563' }}>
                    {method.description}
                  </span>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    {method.features.map((feature, idx) => (
                      <Tag
                        key={idx}
                        value={feature}
                        severity="success"
                        style={{
                          fontSize: '11px',
                          border: '1px dashed #22c55e',
                          background: 'transparent',
                          color: '#166534',
                          fontWeight: 600,
                          borderRadius: '6px'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Areas & Times Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-truck" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Delivery Areas & Times
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
              {deliveryZones.map((zone, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    padding: '20px 16px',
                    borderTop: `4px solid ${zone.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <Tag value={zone.zone} style={{ backgroundColor: zone.color, color: 'white', alignSelf: 'start', borderRadius: '6px' }} />
                  <strong style={{ fontSize: '16px', color: '#1f2937' }}>{zone.area}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px' }}>
                    <i className="pi pi-clock" />
                    <span>{zone.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px' }}>
                    <i className="pi pi-money-bill" />
                    <span>Delivery: {zone.fee}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              marginTop: '20px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '12px',
              color: '#15803d'
            }}>
              <i className="pi pi-check-circle" style={{ fontSize: '18px', color: '#22c55e', marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>Free Delivery</strong>
                <span style={{ fontSize: '13px' }}>Enjoy free delivery on orders over ₹299 in all zones!</span>
              </div>
            </div>
          </Card>

          {/* Payment Options Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-credit-card" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Payment Options
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {paymentMethods.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                  <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '10px',
                    borderRadius: '50%',
                    color: '#3b82f6',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    flexShrink: 0
                  }}>
                    <i className={item.icon} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#1f2937', display: 'block', marginBottom: '2px' }}>{item.method}</strong>
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Order Process Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-sync" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Order Process
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{ marginTop: '16px' }}>
              <Timeline
                value={orderSteps}
                align="left"
                marker={(step) => (
                  <span style={{
                    display: 'flex',
                    width: '36px',
                    height: '36px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    fontSize: '16px'
                  }}>
                    <i className={step.icon} />
                  </span>
                )}
                content={(step) => (
                  <div style={{ paddingLeft: '12px', paddingBottom: '24px' }}>
                    <strong style={{ fontSize: '16px', color: '#1f2937', display: 'block', marginBottom: '2px' }}>{step.title}</strong>
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>{step.description}</span>
                  </div>
                )}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              marginTop: '12px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '12px',
              color: '#1e3a8a'
            }}>
              <i className="pi pi-info-circle" style={{ fontSize: '18px', color: '#3b82f6', marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>Order Tracking</strong>
                <span style={{ fontSize: '13px' }}>Track your order in real-time from preparation to delivery with SMS and email notifications.</span>
              </div>
            </div>
          </Card>

          {/* Quality Guarantee Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-star" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Quality Guarantee
                </h3>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '12px'
            }}>
              {qualityFeatures.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    borderLeft: `4px solid ${feature.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    backgroundColor: `${feature.color}15`,
                    padding: '8px',
                    borderRadius: '50%',
                    color: feature.color,
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    flexShrink: 0
                  }}>
                    <i className={feature.icon} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: 600 }}>{feature.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Operating Hours Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-clock" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Operating Hours
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
              <div style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', color: '#374151' }}>
                  Restaurant Hours
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Monday - Thursday</span>
                    <strong style={{ color: '#1f2937' }}>11:00 AM - 10:00 PM</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Friday - Saturday</span>
                    <strong style={{ color: '#1f2937' }}>11:00 AM - 11:00 PM</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Sunday</span>
                    <strong style={{ color: '#1f2937' }}>12:00 PM - 9:00 PM</strong>
                  </div>
                </div>
              </div>

              <div style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', color: '#374151' }}>
                  Delivery Hours
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Monday - Thursday</span>
                    <strong style={{ color: '#1f2937' }}>11:30 AM - 9:30 PM</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Friday - Saturday</span>
                    <strong style={{ color: '#1f2937' }}>11:30 AM - 10:30 PM</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Sunday</span>
                    <strong style={{ color: '#1f2937' }}>12:30 PM - 8:30 PM</strong>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-phone" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Contact Information
                </h3>
              </div>
            }
            style={{ marginBottom: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '20px' }}>
              Have questions about ordering? Our team is here to help:
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
                <span>TastyHub Customer Service</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-map-marker" style={{ color: '#3b82f6', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Address</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>1-23 Gourmet Street, Nellore</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-envelope" style={{ color: '#22c55e', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Email</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>orders@TastyHub.com</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-phone" style={{ color: '#f97316', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Phone Orders</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>(+91) 99887 76655</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <i className="pi pi-globe" style={{ color: '#a855f7', fontSize: '18px', marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '2px' }}>Website</strong>
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>www.TastyHub.com</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer Divider */}
          <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
              <i className="pi pi-shopping-cart" />
              <span>Start your delicious journey today!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingInfo;