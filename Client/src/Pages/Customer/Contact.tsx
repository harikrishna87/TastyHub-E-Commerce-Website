import React, { useState } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Accordion, AccordionTab } from 'primereact/accordion';

const customStyles = `
  .contact-card {
    background: #ffffff !important;
    border: 1px solid #dcfce7 !important;
    border-radius: 20px !important;
    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.08) !important;
    transition: all 0.3s ease;
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
    width: 100%;
    transition: all 0.3s ease;
  }
  .contact-input::placeholder {
    color: #94a3b8 !important;
  }
  .contact-input:focus, .contact-input:hover {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
    outline: none !important;
  }
  .contact-select {
    width: 100%;
  }
  .contact-select .p-dropdown {
    background: #ffffff !important;
    border: 1.5px solid #d1d5db !important;
    color: #0f172a !important;
    border-radius: 10px !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    transition: all 0.3s ease;
  }
  .contact-select .p-dropdown:not(.p-disabled).p-focus,
  .contact-select .p-dropdown:not(.p-disabled):hover {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
  }
  .contact-select .p-placeholder {
    color: #94a3b8 !important;
  }
  .faq-accordion .p-accordion-header .p-accordion-header-link {
    background: #f9fffa !important;
    border: 1px solid #dcfce7 !important;
    border-radius: 12px !important;
    color: #166534 !important;
    font-weight: 600 !important;
    padding: 16px !important;
    display: flex !important;
    flex-direction: row-reverse !important;
    justify-content: space-between !important;
    align-items: center !important;
    text-decoration: none !important;
  }
  .faq-accordion .p-accordion-content {
    background: #f9fffa !important;
    border: 1px solid #dcfce7 !important;
    border-top: none !important;
    border-radius: 0 0 12px 12px !important;
    color: #475569 !important;
    padding: 16px !important;
  }
  .faq-accordion .p-accordion-tab {
    margin-bottom: 12px !important;
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
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  .premium-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  .premium-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Contact: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    preferredDish: '',
    dietaryRestrictions: 'none',
    orderType: 'booking', // default to Table Booking
    guestCount: 2,
    eventDate: '',
    message: ''
  });

  const messageApi = {
    success: (content: string) => (window as any).showToast?.('success', 'Success', content),
    error: (content: string) => (window as any).showToast?.('error', 'Error', content),
  };

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullname || !formData.email || !formData.phone || !formData.preferredDish || !formData.message) {
      messageApi.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    axios.post(`${backendUrl}/api/inquiries`, formData)
      .then(() => {
        messageApi.success('Your enquiry sent to TastyHub successfully! A confirmation email has been dispatched.');
        setFormData({
          fullname: '',
          email: '',
          phone: '',
          preferredDish: '',
          dietaryRestrictions: 'none',
          orderType: 'booking',
          guestCount: 2,
          eventDate: '',
          message: ''
        });
      })
      .catch((error: any) => {
        messageApi.error('Submission failed. Please try again later.');
        console.error('Inquiry Submission Error:', error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ color: '#0f172a', minHeight: '100vh', padding: '0.5rem 0 3rem', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ display: 'inline-block', fontSize: '0.85rem', padding: '0.3rem 1rem', borderRadius: '100px', fontWeight: 700, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', marginBottom: '1rem', border: 'none' }}>
            CONNECT WITH TASTYHUB
          </span>
          <h1 style={{ color: '#166534', fontWeight: 900, fontSize: '3rem', margin: '0 0 1rem 0' }}>
            Table Bookings & Inquiries
          </h1>
          <p style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Submit a reservation request, coordinate a catering event, or ask about private dining bookings. Our team will review and confirm your request.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
          {/* Left Column */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card className="contact-card" style={{ padding: '2rem' }}>
              <h3 style={{ color: '#166534', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 2rem 0' }}>Corporate Directory</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div className="glowing-icon"><i className="pi pi-map-marker" /></div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Headquarters</span>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>123 Gourmet Plaza, Gachibowli, Hyderabad, India</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div className="glowing-icon"><i className="pi pi-phone" /></div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Support Hotline</span>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>+91 1800-456-9999</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div className="glowing-icon"><i className="pi pi-envelope" /></div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Email Desk</span>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>support@tastyhub.com</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="contact-card" style={{ padding: '2rem' }}>
              <h3 style={{ color: '#166534', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-question-circle" style={{ color: '#22c55e', fontSize: '1.3rem' }} />
                <span>Booking FAQs</span>
              </h3>

              <Accordion className="faq-accordion" expandIcon="pi pi-chevron-right" collapseIcon="pi pi-chevron-down">
                <AccordionTab header="How long in advance should I book?">
                  <span style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, display: 'block' }}>
                    We recommend requesting table reservations at least 24 hours in advance and catering bookings at least 7 days ahead.
                  </span>
                </AccordionTab>
                <AccordionTab header="Is there a minimum group size?">
                  <span style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, display: 'block' }}>
                    For standard tables, there is no minimum. For private dining events and custom catering services, we cater for groups of 10 or more.
                  </span>
                </AccordionTab>
                <AccordionTab header="How do I receive confirmation?">
                  <span style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, display: 'block' }}>
                    You will receive an automated confirmation email immediately. Once an admin approves the booking, a confirmation reply will be emailed to you.
                  </span>
                </AccordionTab>
              </Accordion>
            </Card>
          </div>

          {/* Right Column (Form) */}
          <div style={{ flex: '2 2 500px' }}>
            <Card className="contact-card" style={{ height: '100%', padding: '3rem' }}>
              <h3 style={{ color: '#166534', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>Enquiry & Reservation Form</h3>
              <p style={{ color: '#64748b', margin: '0 0 2.5rem 0' }}>Provide event details below to submit your corporate, dining, or table booking request.</p>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Full Name *</label>
                    <InputText
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      className="contact-input"
                      placeholder="Hari Krishna"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Email Address *</label>
                    <InputText
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="contact-input"
                      placeholder="hari@example.com"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Phone Number *</label>
                    <InputText
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="contact-input"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Preferred Dish/Menu Selection *</label>
                    <InputText
                      value={formData.preferredDish}
                      onChange={(e) => setFormData({ ...formData, preferredDish: e.target.value })}
                      className="contact-input"
                      placeholder="e.g. Chicken Biryani / Multi-cuisine Buffet"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Inquiry Type *</label>
                    <Dropdown
                      value={formData.orderType}
                      options={[
                        { label: 'Table Reservation', value: 'Table Booking' },
                        { label: 'Private Dining Event', value: 'Private Event' },
                        { label: 'Catering Request', value: 'Catering Service' },
                        { label: 'General Feedback', value: 'General Feedback' }
                      ]}
                      onChange={(e) => setFormData({ ...formData, orderType: e.value })}
                      placeholder="Select category"
                      className="contact-select"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Dietary Choices *</label>
                    <Dropdown
                      value={formData.dietaryRestrictions}
                      options={[
                        { label: 'None', value: 'none' },
                        { label: 'Pure Vegetarian', value: 'vegetarian' },
                        { label: 'Non-Vegetarian', value: 'non-vegetarian' },
                        { label: 'Vegan', value: 'vegan' },
                        { label: 'Gluten-Free', value: 'gluten-free' }
                      ]}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.value })}
                      placeholder="Select choice"
                      className="contact-select"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Booking/Event Date</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="contact-input"
                      style={{ height: '48px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#166534', fontWeight: 600 }}>Estimated Guest Count</label>
                    <Dropdown
                      value={formData.guestCount}
                      options={[
                        { label: '1 - 2 Guests', value: 2 },
                        { label: '3 - 4 Guests', value: 4 },
                        { label: '5 - 10 Guests', value: 10 },
                        { label: '11 - 25 Guests', value: 25 },
                        { label: '25+ Guests (Catering/Event)', value: 100 }
                      ]}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.value })}
                      placeholder="Select number of guests"
                      className="contact-select"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
                  <label style={{ color: '#166534', fontWeight: 600 }}>Message & Special Instructions *</label>
                  <InputTextarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="contact-input"
                    placeholder="Tell us about special food choices, seating preferences, or decorations..."
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="premium-btn">
                  {loading ? 'Sending Request...' : <><i className="pi pi-send" /> Submit Enquiry</>}
                </button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
