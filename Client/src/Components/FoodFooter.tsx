import React, { useState } from 'react';
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

const PinterestIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.63 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.36-.72-.36-1.77c0-1.66.96-2.9 2.18-2.9 1.02 0 1.52.77 1.52 1.7 0 1.03-.66 2.57-1 4a1.72 1.72 0 001.67 2.1c2 0 3.54-2.1 3.54-5.14 0-2.68-1.93-4.56-4.68-4.56-3.2 0-5.07 2.4-5.07 4.87 0 .97.37 2 1 2.4l.3.73c-.08.35-.2.83-.26 1.08-.1.4-.3.48-.68.3-2.54-1.18-4.13-4.9-4.13-7.92 0-6.45 4.68-12.38 13.5-12.38 7.1 0 12.6 5.06 12.6 11.8 0 7.05-4.45 12.72-10.63 12.72-2.08 0-4.03-1.08-4.7-2.36l-1.28 4.88c-.46 1.77-1.7 4-2.54 5.35A12 12 0 1012 0z"/>
  </svg>
);

const customFooterStyles = `
.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 10fr 3fr 3fr 8fr;
  }
}
.footer-bottom-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .footer-bottom-grid {
    grid-template-columns: 1fr 1fr;
  }
}
`;

const Footer: React.FC<FooterProps> = ({
  companyName = "TastyHub",
  companyLogo = "/logo.png"
}) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  const messageApi = {
    info: (opts: any) => (window as any).showToast?.('info', 'Info', typeof opts === 'string' ? opts : opts.content || ''),
    success: (opts: any) => (window as any).showToast?.('success', 'Success', typeof opts === 'string' ? opts : opts.content || ''),
    error: (opts: any) => (window as any).showToast?.('error', 'Error', typeof opts === 'string' ? opts : opts.content || ''),
    warning: (opts: any) => (window as any).showToast?.('warn', 'Warning', typeof opts === 'string' ? opts : opts.content || ''),
  };

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customFooterStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      messageApi.info({
        content: "This feature is under development. Please check back later.",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
      setEmail('');
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
        width: '100%',
        margin: 0,
        padding: '0 30px',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="footer-grid" style={{ marginBottom: '32px' }}>
          <div>
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
                  <i className="pi pi-facebook" />
                </Link>
                <Link
                  to="#"
                  style={{ marginRight: '24px', color: '#52c41a', fontSize: '18px' }}
                  aria-label="Instagram"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="pi pi-instagram" />
                </Link>
                <Link
                  to="#"
                  style={{ marginRight: '24px', color: '#52c41a', fontSize: '18px' }}
                  aria-label="Twitter"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="pi pi-twitter" />
                </Link>
                <Link
                  to="#"
                  style={{ marginRight: '24px', color: '#52c41a', fontSize: '18px' }}
                  aria-label="Pinterest"
                  onClick={(e) => e.preventDefault()}
                >
                  <PinterestIcon />
                </Link>
                <Link
                  to="#"
                  style={{ color: '#52c41a', fontSize: '18px' }}
                  aria-label="YouTube"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="pi pi-youtube" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
              Shop
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                to="/user/menu-items"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/menu-items')}
              >
                All Products
              </Link>
              <Link
                to="/user/newarrivals"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/newarrivals')}
              >
                New Arrivals
              </Link>
              <Link
                to="/user/dealsdiscount"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/dealsdiscount')}
              >
                Deals & Discounts
              </Link>
              <Link
                to="/user/giftcards"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/giftcards')}
              >
                Gift Cards
              </Link>
              <Link
                to="/user/combodeals"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/combodeals')}
              >
                Combo Deals
              </Link>
            </div>
          </div>

          <div>
            <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
              Support
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                to="/user/contact"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/contact')}
              >
                Contact Us
              </Link>
              <Link
                to="/user/faq"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation("/user/faq")}
              >
                FAQ
              </Link>
              <Link
                to="/user/shoppinginfo"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/shoppinginfo')}
              >
                Shipping Info
              </Link>
              <Link
                to="/user/returnexchanges"
                style={{
                  color: '#212529',
                  textDecoration: 'none',
                  padding: '4px 0',
                  marginBottom: '4px'
                }}
                onClick={handleNavigation('/user/returnexchanges')}
              >
                Returns & Exchanges
              </Link>
            </div>
          </div>

          <div>
            <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
              Stay Updated
            </h5>
            <p style={{ color: '#212529', marginBottom: '16px' }}>
              Subscribe to our newsletter for exclusive offers and updates on new products.
            </p>

            <form
              onSubmit={handleSubscribeSubmit}
              style={{ marginBottom: '24px' }}
            >
              <div style={{ display: 'flex', marginBottom: '24px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  style={{
                    flex: 1,
                    marginRight: '8px',
                    borderColor: '#28a745',
                    borderRadius: '6px 0 0 6px',
                    border: '1px solid #28a745',
                    padding: '8px 12px',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#212529'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    border: '1px solid #28a745',
                    borderRadius: '0 6px 6px 0',
                    color: 'white',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Subscribe
                </button>
              </div>
            </form>
            <div style={{ marginTop: '32px' }}>
              <h5 style={{ marginBottom: '24px', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
                Contact Info
              </h5>
              <address style={{ marginBottom: 0, color: '#212529', fontStyle: 'normal' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-map-marker" style={{ marginRight: '8px', color: '#52c41a' }} />
                  1-23 Gourmet Street, Nellore
                </div>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-phone" style={{ marginRight: '8px', color: '#52c41a' }} />
                  (+91) 99887 76655
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-envelope" style={{ marginRight: '8px', color: '#52c41a' }} />
                  support@TastyHub.com
                </div>
              </address>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: '#52c41a', margin: '32px 0' }} />

        <div className="footer-bottom-grid">
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Link
                to="/user/privacy"
                style={{
                  color: '#212529',
                  padding: '4px 16px',
                  borderRight: '1px solid #28a745',
                  textDecoration: 'none'
                }}
                onClick={handleNavigation('/user/privacy')}
              >
                Privacy Policy
              </Link>
              <Link
                to="/user/terms"
                style={{
                  color: '#212529',
                  padding: '4px 16px',
                  textDecoration: 'none'
                }}
                onClick={handleNavigation('/user/terms')}
              >
                Terms of Service
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{
              marginBottom: 0,
              color: '#6c757d',
              fontSize: '14px'
            }}>
              &copy; {currentYear} {companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
