import React, { useState } from 'react';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    text: string;
    avatar: string;
    rating: number;
}

const testimonials1: Testimonial[] = [
    {
        id: 1,
        name: "Haarini",
        role: "Regular Customer",
        text: "The quality of products is exceptional. I've been shopping here for years!",
        avatar: "https://images.unsplash.com/photo-1663893364107-a6ecd06cf615?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 5
    },
    {
        id: 2,
        name: "Srikanth",
        role: "Food Blogger",
        text: "The flavors are authentic and the service is always exceptional!",
        avatar: "https://images.unsplash.com/photo-1641288883869-c463bc6c2a58?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 4.5
    },
    {
        id: 3,
        name: "Mahitha",
        role: "Food Critic",
        text: "Their selection never fails to impress. A must-visit for food enthusiasts.",
        avatar: "https://plus.unsplash.com/premium_photo-1691784781482-9af9bce05096?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 4.5
    },
    {
        id: 4,
        name: "Revanth",
        role: "Nutritionist",
        text: "I recommend these products to all my clients. Premium quality and great value.",
        avatar: "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 4
    },
    {
        id: 5,
        name: "Indu Priya",
        role: "Chef",
        text: "The freshness and variety of products have transformed my cooking experience.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        rating: 5
    }
];

const testimonials2: Testimonial[] = [
    {
        id: 6,
        name: "Ramesh",
        role: "Restaurant Owner",
        text: "Outstanding quality and perfect for my restaurant's needs. Highly recommended!",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        rating: 5
    },
    {
        id: 7,
        name: "Kavya",
        role: "Home Cook",
        text: "These ingredients make every meal special. My family loves the difference!",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 4.5
    },
    {
        id: 8,
        name: "Vikram",
        role: "Catering Manager",
        text: "Reliable delivery and consistent quality. Perfect for large-scale events.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        rating: 4
    },
    {
        id: 9,
        name: "Deepika",
        role: "Food Enthusiast",
        text: "Amazing variety and freshness. This has become my go-to place for quality ingredients.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        rating: 5
    },
    {
        id: 10,
        name: "Arjun",
        role: "Dietitian",
        text: "Excellent nutritional value and organic options. Perfect for health-conscious clients.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        rating: 4.5
    }
];

const testimonials3: Testimonial[] = [
    {
        id: 11,
        name: "Priya",
        role: "Wellness Coach",
        text: "The organic selection is incredible. My clients always ask where I source these ingredients!",
        avatar: "https://images.unsplash.com/photo-1557296387-5358ad7997bb?w=150&h=150&fit=crop&crop=face",
        rating: 5
    },
    {
        id: 12,
        name: "Rajesh",
        role: "Food Scientist",
        text: "The preservation methods maintain nutritional integrity perfectly. Impressive quality control.",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        rating: 4.5
    },
    {
        id: 13,
        name: "Anita",
        role: "Culinary Student",
        text: "Learning to cook with these premium ingredients has elevated my skills tremendously.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
        rating: 4.5
    },
    {
        id: 14,
        name: "Suresh",
        role: "Grocery Store Owner",
        text: "My customers keep coming back for these products. Exceptional quality and competitive pricing.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
        rating: 4
    },
    {
        id: 15,
        name: "Lakshmi",
        role: "Traditional Cook",
        text: "These ingredients remind me of the authentic flavors from my grandmother's kitchen.",
        avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
        rating: 5
    }
];

interface StarRatingProps {
    rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} style={{ color: '#faad14', fontSize: '20px', marginRight: '2px' }}>★</span>
            ))}
            {hasHalfStar && (
                <span style={{ color: '#faad14', fontSize: '16px', marginRight: '2px' }}>☆</span>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <span key={`empty-${i}`} style={{ color: '#d9d9d9', fontSize: '16px', marginRight: '2px' }}>☆</span>
            ))}
            <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>
                ({rating})
            </span>
        </div>
    );
};

interface TestimonialStackProps {
    testimonials: Testimonial[];
    onExpand: () => void;
}

const TestimonialStack: React.FC<TestimonialStackProps> = ({ testimonials, onExpand }) => {
    return (
        <div
            style={{
                position: 'relative',
                height: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
            }}
        >
            {testimonials.map((testimonial, index) => {
                const zIndex = testimonials.length - index;
                const rotation = (index - 2) * 3;
                const yOffset = index * 8;

                return (
                    <div
                        key={testimonial.id}
                        style={{
                            position: 'absolute',
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: '12px',
                            boxShadow: `0 ${4 + index * 2}px ${12 + index * 4}px rgba(0, 0, 0, 0.1)`,
                            border: '1px solid #f0f0f0',
                            width: '100%',
                            maxWidth: '450px',
                            transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                            zIndex: zIndex,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onClick={onExpand}
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.transform = `rotate(0deg) translateY(-10px) scale(1.02)`;
                            target.style.zIndex = '100';
                            target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.style.transform = `rotate(${rotation}deg) translateY(${yOffset}px) scale(1)`;
                            target.style.zIndex = zIndex.toString();
                            target.style.boxShadow = `0 ${4 + index * 2}px ${12 + index * 4}px rgba(0, 0, 0, 0.1)`;
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                        }}>
                            <div style={{ marginRight: '16px', position: 'relative' }}>
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '8px',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        const fallback = img.nextElementSibling as HTMLElement;
                                        if (fallback) {
                                            img.style.display = 'none';
                                            fallback.style.display = 'flex';
                                        }
                                    }}
                                />
                                <div
                                    style={{
                                        display: 'none',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '8px',
                                        backgroundColor: '#52c41a',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        color: 'white',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0
                                    }}
                                >
                                    {testimonial.name.charAt(0)}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h5 style={{
                                    marginBottom: '4px',
                                    marginTop: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333'
                                }}>
                                    {testimonial.name}
                                </h5>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    margin: '0'
                                }}>
                                    {testimonial.role}
                                </p>
                            </div>
                        </div>
                        <StarRating rating={testimonial.rating} />
                        <p style={{
                            fontStyle: 'italic',
                            lineHeight: '1.5',
                            color: '#555',
                            margin: '0',
                            fontSize: '13px'
                        }}>
                            "{testimonial.text}"
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

const Testimonials: React.FC = () => {
    const [expandedStack, setExpandedStack] = useState<number | null>(null);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <style>
                {`
                    body {
                        overflow-x: hidden;
                    }
                    
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(30px) scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    
                    @media (max-width: 1024px) {
                        .testimonials-grid {
                            flex-direction: column !important;
                            gap: 20px !important;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .testimonials-grid {
                            flex-direction: column !important;
                            gap: 20px !important;
                        }
                        
                        .modal-content {
                            grid-template-columns: 1fr !important;
                            padding: 20px !important;
                        }
                        
                        .modal-close {
                            top: 15px !important;
                            right: 15px !important;
                            width: 40px !important;
                            height: 40px !important;
                            font-size: 20px !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .testimonial-card {
                            padding: 16px !important;
                        }
                        
                        .testimonial-avatar {
                            width: 50px !important;
                            height: 50px !important;
                        }
                        
                        .testimonial-name {
                            font-size: 14px !important;
                        }
                        
                        .testimonial-text {
                            font-size: 12px !important;
                        }
                    }
                `}
            </style>

            <h2 style={{
                fontSize: '35px',
                fontWeight: '600',
                color: '#333',
            }}
                className='section-title'
            >
                Testimonials
            </h2>

            {expandedStack !== null && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px'
                    }}
                    onClick={() => setExpandedStack(null)}
                >
                    <div
                        className="modal-content"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '24px',
                            maxWidth: '1200px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(expandedStack === 1 ? testimonials1 : expandedStack === 2 ? testimonials2 : testimonials3).map((testimonial, index) => (
                            <div
                                key={testimonial.id}
                                style={{
                                    backgroundColor: '#fff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                    border: '1px solid #f0f0f0',
                                    animation: `slideIn 0.4s ease-out ${index * 0.15}s both`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minWidth: '0',
                                    width: '100%'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ marginRight: '16px', position: 'relative', flexShrink: 0 }}>
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="testimonial-avatar"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '8px',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                const img = e.currentTarget;
                                                const fallback = img.nextElementSibling as HTMLElement;
                                                if (fallback) {
                                                    img.style.display = 'none';
                                                    fallback.style.display = 'flex';
                                                }
                                            }}
                                        />
                                        <div
                                            style={{
                                                display: 'none',
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '8px',
                                                backgroundColor: '#52c41a',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px',
                                                fontWeight: '600',
                                                color: 'white',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0
                                            }}
                                        >
                                            {testimonial.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '0' }}>
                                        <h5 className="testimonial-name" style={{
                                            marginBottom: '4px',
                                            marginTop: '10px',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333'
                                        }}>
                                            {testimonial.name}
                                        </h5>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            margin: '0'
                                        }}>
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                                <StarRating rating={testimonial.rating} />
                                <p className="testimonial-text" style={{
                                    fontStyle: 'italic',
                                    lineHeight: '1.6',
                                    color: '#555',
                                    margin: '0',
                                    fontSize: '17px',
                                    wordWrap: 'break-word'
                                }}>
                                    "{testimonial.text}"
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        className="modal-close"
                        style={{
                            position: 'fixed',
                            top: '30px',
                            right: '30px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            fontSize: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
                            fontWeight: 'bold',
                            color: '#333',
                            zIndex: 1001
                        }}
                        onClick={() => setExpandedStack(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            <div
                className="testimonials-grid"
                style={{
                    display: 'flex',
                    gap: '40px',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <TestimonialStack
                    testimonials={testimonials1}
                    onExpand={() => setExpandedStack(1)}
                />
                <TestimonialStack
                    testimonials={testimonials2}
                    onExpand={() => setExpandedStack(2)}
                />
                <TestimonialStack
                    testimonials={testimonials3}
                    onExpand={() => setExpandedStack(3)}
                />
            </div>
        </div>
    );
};

export default Testimonials;