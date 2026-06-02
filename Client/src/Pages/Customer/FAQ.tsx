import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Link } from 'react-router-dom';

const FAQ: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const Today = new Date();
  const FormattedDate = Today.toDateString();

  const faqCategories = [
    {
      title: "Orders & Delivery",
      icon: "pi pi-shopping-cart",
      color: '#22c55e',
      bgColor: '#f0fdf4',
      questions: [
        {
          key: 'order-1',
          question: 'How do I place an order?',
          answer: 'You can place an order through our website or mobile app. Simply browse our menu, add items to your cart, provide delivery details, and complete the payment process. Our user-friendly interface makes ordering quick and easy.'
        },
        {
          key: 'order-2',
          question: 'What are your delivery hours?',
          answer: 'We deliver from 9:00 AM to 11:00 PM, seven days a week. During peak hours (12:00-2:00 PM and 7:00-9:00 PM), delivery times may be slightly longer due to high demand.'
        },
        {
          key: 'order-3',
          question: 'How long does delivery take?',
          answer: 'Standard delivery takes 30-45 minutes. Express delivery (additional charges apply) takes 15-25 minutes. Delivery times may vary based on your location, weather conditions, and order volume.'
        },
        {
          key: 'order-4',
          question: 'Can I track my order?',
          answer: 'Yes! Once your order is confirmed, you\'ll receive a tracking link via SMS and email. You can monitor your order in real-time from preparation to delivery.'
        }
      ]
    },
    {
      title: "Payment & Pricing",
      icon: "pi pi-credit-card",
      color: '#3b82f6',
      bgColor: '#eff6ff',
      questions: [
        {
          key: 'payment-1',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit/debit cards (Visa, MasterCard, RuPay), UPI payments, net banking, digital wallets (Paytm, PhonePe, Google Pay), and cash on delivery for eligible orders.'
        },
        {
          key: 'payment-2',
          question: 'Are there any delivery charges?',
          answer: 'Delivery is free for orders above ₹299. For orders below ₹299, a delivery fee of ₹29 applies. Express delivery has an additional charge of ₹49.'
        },
        {
          key: 'payment-3',
          question: 'Do you offer any discounts or coupons?',
          answer: 'Yes! We regularly offer discounts for first-time users, loyalty rewards, festival specials, and bulk orders. Check our app or website for current offers and promo codes.'
        },
        {
          key: 'payment-4',
          question: 'Can I get a refund if I cancel my order?',
          answer: 'Orders can be cancelled within 2 minutes of placing for a full refund. After preparation begins, cancellation may incur charges. Refunds are processed within 3-5 business days.'
        }
      ]
    },
    {
      title: "Food & Menu",
      icon: "pi pi-heart",
      color: '#f97316',
      bgColor: '#fff7ed',
      questions: [
        {
          key: 'food-1',
          question: 'Do you have vegetarian and vegan options?',
          answer: 'Absolutely! We have extensive vegetarian and vegan menus clearly marked with symbols. Our kitchen maintains separate preparation areas to avoid cross-contamination.'
        },
        {
          key: 'food-2',
          question: 'Can I customize my order?',
          answer: 'Yes, most items can be customized. You can adjust spice levels, remove ingredients, add extras, or make substitutions. Custom options are available during the ordering process.'
        },
        {
          key: 'food-3',
          question: 'Do you provide nutritional information?',
          answer: 'Yes, nutritional information including calories, allergens, and ingredients is available for all menu items. You can find this information on each product page.'
        },
        {
          key: 'food-4',
          question: 'How do you ensure food quality and freshness?',
          answer: 'We source ingredients daily from trusted suppliers, follow strict hygiene protocols, and prepare food fresh for each order. Our delivery partners use insulated bags to maintain temperature.'
        }
      ]
    },
    {
      title: "Account & Support",
      icon: "pi pi-comments",
      color: '#ec4899',
      bgColor: '#fdf2f8',
      questions: [
        {
          key: 'account-1',
          question: 'How do I create an account?',
          answer: 'Click "Sign Up" on our website or app, enter your mobile number or email, verify with OTP, and complete your profile. You can also sign up using Google or Facebook for faster registration.'
        },
        {
          key: 'account-2',
          question: 'I forgot my password. How can I reset it?',
          answer: 'Click "Forgot Password" on the login page, enter your registered email or phone number, and follow the reset instructions sent to you via SMS or email.'
        },
        {
          key: 'account-3',
          question: 'How can I contact customer support?',
          answer: 'You can reach us through multiple channels: in-app chat support (24/7), email (support@TastyHub.com), phone (+91 99887 76655), or visit our help center for instant answers.'
        },
        {
          key: 'account-4',
          question: 'Can I save my favorite orders?',
          answer: 'Yes! You can save frequently ordered items to "Favorites," create custom meal combinations, and reorder previous purchases with just one click.'
        }
      ]
    }
  ];

  const breadcrumbItems = [
    { 
      template: () => (
        <Link to="/faq" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#22c55e', fontWeight: 600 }}>
          <i className="pi pi-question-circle" />
          <span>FAQ</span>
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
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading FAQ...</span>
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
            <i className="pi pi-question-circle" style={{ fontSize: '40px' }} />
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 800, color: '#1f2937' }}>
              Frequently Asked Questions
            </h1>
          </div>
          <p style={{ fontSize: '16px', margin: '8px 0 0 52px', color: '#6b7280' }}>
            Find quick answers to common questions about our services
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
              <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>Quick Help Available</strong>
              <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Can\'t find your answer? Our 24/7 customer support team is here to help! Use the contact information at the bottom of this page.
              </span>
            </div>
          </div>

          {/* FAQ Categories Accordions */}
          {faqCategories.map((category, categoryIndex) => (
            <Card
              key={categoryIndex}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    color: category.color,
                    fontSize: '20px',
                    backgroundColor: category.bgColor,
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px'
                  }}>
                    <i className={category.icon} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: category.color }}>
                    {category.title}
                  </h3>
                </div>
              }
              style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
            >
              <Accordion multiple style={{ marginTop: '12px' }}>
                {category.questions.map((faq) => (
                  <AccordionTab 
                    key={faq.key}
                    header={
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                        {faq.question}
                      </span>
                    }
                  >
                    <div style={{
                      backgroundColor: '#f9fafb',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #f3f4f6',
                      color: '#4b5563',
                      fontSize: '15px',
                      lineHeight: '1.6'
                    }}>
                      {faq.answer}
                    </div>
                  </AccordionTab>
                ))}
              </Accordion>
            </Card>
          ))}

          {/* Popular Questions Section */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="pi pi-star" style={{ color: '#22c55e', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                  Popular Questions
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
              <div style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                padding: '16px',
                borderLeft: '4px solid #22c55e',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#1f2937' }}>
                  <i className="pi pi-bolt" style={{ color: '#22c55e' }} />
                  <span>Express Delivery</span>
                </div>
                <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                  Get your food delivered in 15-25 minutes with our express service
                </span>
              </div>

              <div style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                padding: '16px',
                borderLeft: '4px solid #3b82f6',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#1f2937' }}>
                  <i className="pi pi-gift" style={{ color: '#3b82f6' }} />
                  <span>Loyalty Rewards</span>
                </div>
                <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                  Earn points with every order and redeem for exclusive discounts
                </span>
              </div>

              <div style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                padding: '16px',
                borderLeft: '4px solid #f97316',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#1f2937' }}>
                  <i className="pi pi-shield" style={{ color: '#f97316' }} />
                  <span>Food Safety</span>
                </div>
                <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                  All our food is prepared following strict hygiene protocols
                </span>
              </div>

              <div style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                padding: '16px',
                borderLeft: '4px solid #ec4899',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#1f2937' }}>
                  <i className="pi pi-money-bill" style={{ color: '#ec4899' }} />
                  <span>Best Prices</span>
                </div>
                <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                  Competitive pricing with regular offers and discounts
                </span>
              </div>
            </div>
          </Card>

          {/* Footer Last Updated */}
          <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e5e7eb', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
              <i className="pi pi-check-circle" />
              <span>Last Updated: {FormattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;