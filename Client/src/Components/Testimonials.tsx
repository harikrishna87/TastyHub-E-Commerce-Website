import React from 'react';
import { Carousel } from 'primereact/carousel';
import { Card } from 'primereact/card';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
}

const testimonialsList: Testimonial[] = [
  {
    id: 1,
    name: "Haarini",
    role: "Regular Customer",
    text: "The quality of food items and speedy delivery is exceptional. I've been ordering my meals here for years and the taste never fails!",
    avatar: "https://images.unsplash.com/photo-1663893364107-a6ecd06cf615?q=80&w=150&h=150&auto=format&fit=crop",
    rating: 5
  },
  {
    id: 2,
    name: "Srikanth",
    role: "Food Blogger",
    text: "Outstanding kitchen standards. The flavors are highly authentic and the food packaging is airtight and leak-proof. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1641288883869-c463bc6c2a58?q=80&w=150&h=150&auto=format&fit=crop",
    rating: 5
  },
  {
    id: 3,
    name: "Mahitha",
    role: "Culinary Critic",
    text: "TastyHub offers a remarkably diverse list of cuisines. From hot spicy biryanis to craft burgers, their culinary execution is top notch.",
    avatar: "https://plus.unsplash.com/premium_photo-1691784781482-9af9bce05096?q=80&w=150&h=150&auto=format&fit=crop",
    rating: 4.5
  },
  {
    id: 4,
    name: "Ramesh",
    role: "Gourmet Chef",
    text: "Outstanding chef-grade quality items. The veggies are fresh, meats are tender, and seasonings are perfect. My go-to food delivery app.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 5
  },
  {
    id: 5,
    name: "Kavya",
    role: "Home Cook",
    text: "TastyHub thalis remind me of authentic home-cooked meals. Perfectly balanced spices, clean execution, and incredibly satisfying portions.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop",
    rating: 4.5
  },
  {
    id: 6,
    name: "Deepika",
    role: "Food Enthusiast",
    text: "The delivery is lightning fast! The pizza is still bubbling hot when it arrives. Incredibly easy checkout and super friendly delivery agents.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  const responsiveOptions = [
    {
      breakpoint: '1300px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  const testimonialTemplate = (t: Testimonial) => {
    const fullStars = Math.floor(t.rating);
    const hasHalfStar = t.rating % 1 !== 0;

    return (
      <div style={{ padding: '12px' }}>
        <Card
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
          className="testimonial-card-neat"
        >
          <i className="pi pi-quote-right" style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '1.8rem',
            color: '#f8fafc',
            pointerEvents: 'none'
          }} />

          <div>
            <div style={{ display: 'flex', gap: '2px', color: '#faad14', marginBottom: '12px' }}>
              {Array.from({ length: fullStars }, (_, i) => (
                <i key={`f-${i}`} className="pi pi-star-fill" />
              ))}
              {hasHalfStar && <i className="pi pi-star-fill" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
              {Array.from({ length: 5 - Math.ceil(t.rating) }, (_, i) => (
                <i key={`e-${i}`} className="pi pi-star" style={{ color: '#e2e8f0' }} />
              ))}
            </div>

            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#475569',
              fontStyle: 'italic',
              margin: '0 0 16px 0',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              "{t.text}"
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #f8fafc', paddingTop: '12px', marginTop: 'auto' }}>
            <img
              src={t.avatar}
              alt={t.name}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #f1f5f9'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
              }}
            />
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
                {t.name}
              </h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {t.role}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
      <style>
        {`
          .testimonial-carousel .p-carousel-indicators {
            padding: 0;
            margin-top: 1.5rem;
            display: none !important;
          }
          .testimonial-carousel .p-carousel-indicator.p-highlight button {
            background-color: #52c41a !important;
          }
          .testimonial-carousel .p-link:focus {
            box-shadow: none !important;
          }
        `}
      </style>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Loved By Foodies
        </h2>
        <span style={{ fontSize: '14px', color: '#64748b', display: 'block', marginTop: '6px' }}>
          Hear what our regular clients and food critics say about their dining experiences
        </span>
      </div>

      <Carousel
        value={testimonialsList}
        itemTemplate={testimonialTemplate}
        numVisible={4}
        numScroll={1}
        responsiveOptions={responsiveOptions}
        circular
        autoplayInterval={4000}
        showNavigators={false}
        showIndicators={false}
        className="testimonial-carousel"
        style={{ marginTop: '1rem' }}
      />
    </div>
  );
};

export default Testimonials;