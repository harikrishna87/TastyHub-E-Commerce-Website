import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export default function DeliveryLandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/delivery/auth');
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      color: '#0f172a',
      background: '#f8fafc',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* Premium Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '6rem 2rem 8rem 2rem',
        position: 'relative',
        textAlign: 'center',
        borderBottomRightRadius: '80px'
      }}>
        {/* Soft floating glow elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '300px',
          height: '300px',
          background: 'rgba(34, 197, 94, 0.15)',
          filter: 'blur(100px)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: 'rgba(56, 189, 248, 0.1)',
          filter: 'blur(80px)',
          borderRadius: '50%'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '2rem',
            letterSpacing: '0.5px'
          }}>
            🚀 WE ARE HIRING FOR 2026
          </div>
          
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            letterSpacing: '-1.5px',
            background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Become a TastyHub <span style={{ color: '#22c55e' }}>Delivery Hero</span>
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            marginBottom: '3rem',
            lineHeight: 1.6,
            maxWidth: '650px',
            margin: '0 auto 3rem auto'
          }}>
            Deliver smiles, enjoy flat premium commissions, choose your own hours, and ride with the fastest-growing food network in town.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button 
              label="Join Our Fleet Now" 
              icon="pi pi-user-plus" 
              className="p-button-lg p-button-success"
              style={{
                borderRadius: '50px',
                fontWeight: 700,
                padding: '1rem 2.5rem',
                backgroundColor: '#22c55e',
                borderColor: '#22c55e',
                boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.4)'
              }}
              onClick={handleGetStarted}
            />
            <Button 
              label="Partner Login" 
              icon="pi pi-sign-in" 
              className="p-button-lg p-button-outlined p-button-secondary"
              style={{
                borderRadius: '50px',
                fontWeight: 700,
                padding: '1rem 2.5rem',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                background: 'transparent'
              }}
              onClick={handleGetStarted}
            />
          </div>
        </div>
      </div>

      {/* Modern Wave Divider Overlay */}
      <div style={{
        marginTop: '-50px',
        position: 'relative',
        zIndex: 3,
        padding: '0 2rem'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
          padding: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#22c55e', marginBottom: '0.25rem' }}>₹30</div>
            <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>Flat Commission / Delivery</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>No dynamic cuts. Earn what you deserve.</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.25rem' }}>100%</div>
            <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>Flexible Schedules</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Choose your own hours. Work when you want.</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '0.25rem' }}>Instant</div>
            <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>Weekly Settlements</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Earnings transferred directly to your bank.</div>
          </div>
        </div>
      </div>

      {/* Main Core Benefits Section */}
      <div style={{ maxWidth: '1200px', margin: '6rem auto 4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', letterSpacing: '-0.75px' }}>
            Why Ride with TastyHub?
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '550px', margin: '0 auto' }}>
            TastyHub delivers top-tier food experience. To do that, we empower our delivery fleet with best-in-class benefits.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem'
        }}>
          {/* Card 1 */}
          <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }} className="p-3">
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <i className="pi pi-wallet" style={{ fontSize: '1.5rem', color: '#15803d' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Flat ₹30 Scheme</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Earn a robust flat commission of ₹30 for every single successfully completed delivery order. No complicated tiers, no hidden cuts. More runs, more cash.
            </p>
          </Card>

          {/* Card 2 */}
          <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }} className="p-3">
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <i className="pi pi-calendar" style={{ fontSize: '1.5rem', color: '#1d4ed8' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Flexible Shifts</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Choose your shifts as you please. Work full-time or pick up brief weekend runs to supplement your main source of income. You are your own boss.
            </p>
          </Card>

          {/* Card 3 */}
          <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }} className="p-3">
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <i className="pi pi-map-marker" style={{ fontSize: '1.5rem', color: '#7e22ce' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Clean Localized Routes</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Get assigned deliveries within compact localized circles. Enjoy optimized clean routing that saves you fuel, time, and wear-and-tear on your vehicle.
            </p>
          </Card>
        </div>
      </div>

      {/* Ride Steps Timeline */}
      <div style={{
        background: '#f1f5f9',
        padding: '5rem 2rem',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', textAlign: 'center', marginBottom: '3.5rem', letterSpacing: '-0.75px' }}>
            Get Riding in 3 Easy Steps
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>1</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Register Online</h4>
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>Click on Join Our Fleet, enter your details and upload your driver's license/vehicle registration card.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>2</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Brief Verification Check</h4>
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>Our team will verify your documents within 24 hours. You'll receive a notification and a quick onboarding guide.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>3</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Start Delivering!</h4>
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>Log in to your executive dashboard, go online, accept incoming orders, and start making flat commissions instantly!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Footer Area */}
      <div style={{
        textAlign: 'center',
        padding: '6rem 2rem',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', letterSpacing: '-0.75px' }}>
          Ready to Earn with TastyHub?
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>
          Create an account as a delivery executive or sign in to your dashboard to hit the road today.
        </p>
        <Button 
          label="Become a Delivery Partner Today" 
          icon="pi pi-chevron-right" 
          className="p-button-lg p-button-success"
          style={{
            borderRadius: '50px',
            fontWeight: 700,
            padding: '1rem 3rem',
            backgroundColor: '#22c55e',
            borderColor: '#22c55e',
            boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.4)'
          }}
          onClick={handleGetStarted}
        />
      </div>

      {/* Tiny clean footer */}
      <div style={{
        borderTop: '1px solid #e2e8f0',
        padding: '2rem',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.85rem'
      }}>
        © 2026 TastyHub Logistics Private Limited. All rights reserved.
      </div>
    </div>
  );
}
