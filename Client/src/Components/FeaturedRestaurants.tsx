import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

interface Restaurant {
  _id: string;
  name: string;
  category: string;
  image: string;
  cuisines: string[];
  rating: number;
  reviewsCount: string;
  deliveryTime: string;
  costForTwo: string;
  offer: string;
  popularDish: string;
  isVeg: boolean;
}

interface FeaturedRestaurantsProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
}

const FeaturedRestaurants: React.FC<FeaturedRestaurantsProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all'); // all, veg, nonveg, highly-rated

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/restaurants`);
        if (res.data.success) {
          setRestaurants(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch restaurants from API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [backendUrl]);

  const handleRestaurantClick = (category: string) => {
    onSelectCategory(category);
    const targetElement = document.getElementById('our-selection-section');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredRestaurants = restaurants.filter(rest => {
    // Search match
    const matchesSearch = rest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rest.cuisines.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rest.popularDish && rest.popularDish.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter match
    if (filterType === 'veg') {
      return matchesSearch && rest.isVeg;
    } else if (filterType === 'nonveg') {
      return matchesSearch && !rest.isVeg;
    } else if (filterType === 'highly-rated') {
      return matchesSearch && rest.rating >= 4.7;
    }
    return matchesSearch;
  });

  const filterOptions = [
    { label: 'All Cuisines', value: 'all' },
    { label: 'Pure Veg 🟢', value: 'veg' },
    { label: 'Non-Veg 🔴', value: 'nonveg' },
    { label: '★ 4.7+ Highly-Rated', value: 'highly-rated' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem', color: '#52c41a' }} />
        <span style={{ color: '#52c41a', fontWeight: 600 }}>Discovering top kitchens...</span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '3.5rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="section-title" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>
              Explore Local Restaurants
            </h2>
            <span style={{ fontSize: '14px', display: 'block', marginTop: '4px', color: '#64748b' }}>
              Fresh, fast, and authentic dishes delivered from dynamic admin-curated gourmet kitchens
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Dropdown 
              value={filterType} 
              options={filterOptions} 
              onChange={(e) => setFilterType(e.value)} 
              placeholder="Filter Kitchens"
              style={{ borderRadius: '20px', width: '200px' }} 
            />
          </div>
        </div>

        <div className="p-inputgroup" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <span className="p-inputgroup-addon" style={{ background: '#ffffff', borderRight: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
            <i className="pi pi-search" style={{ color: '#bfbfbf' }} />
          </span>
          <InputText 
            placeholder="Search by restaurant name, cuisines, or popular dishes..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{
              borderLeft: 'none',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              outline: 'none',
              padding: '8px 12px'
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {filteredRestaurants.map((restaurant) => {
          const cardHeader = (
            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
              <img
                alt={restaurant.name}
                src={restaurant.image}
                className="restaurant-card-image"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease'
                }}
              />
              {restaurant.offer && (
                <div className="restaurant-offer-badge">
                  {restaurant.offer}
                </div>
              )}
              
              {selectedCategory === restaurant.category && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: '#52c41a',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  zIndex: 3,
                  boxShadow: '0 4px 8px rgba(82, 196, 26, 0.3)'
                }}>
                  ACTIVE
                </div>
              )}

              <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                <Tag 
                  value={restaurant.isVeg ? 'Veg 🟢' : 'Non-Veg 🔴'} 
                  severity={restaurant.isVeg ? 'success' : 'danger'} 
                  style={{ fontWeight: 600 }}
                />
              </div>
            </div>
          );

          return (
            <Card
              key={restaurant._id}
              header={cardHeader}
              className="restaurant-card"
              onClick={() => handleRestaurantClick(restaurant.category)}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: '17px 13px', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                    {restaurant.name}
                  </h3>
                  <div className={`restaurant-rating-badge ${restaurant.rating < 4.6 ? 'rating-low' : ''}`}>
                    <i className="pi pi-star-fill" style={{ fontSize: '11px', color: 'white', marginRight: '4px' }} />
                    {restaurant.rating.toFixed(1)}
                  </div>
                </div>

                <p style={{ 
                  fontSize: '13px', 
                  marginBottom: '12px',
                  color: '#64748b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: '0 0 12px 0'
                }}>
                  {restaurant.cuisines.join(', ')}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '1px dashed #f0f0f0',
                  paddingTop: '10px',
                  marginTop: 'auto',
                  fontSize: '12px',
                  color: '#475569'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="pi pi-clock" style={{ color: '#94a3b8' }} />
                    <strong>{restaurant.deliveryTime}</strong>
                  </span>
                  <strong>{restaurant.costForTwo}</strong>
                </div>

                {restaurant.popularDish && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <i className="pi pi-gift" style={{ color: '#15803d', fontSize: '12px' }} />
                    <span style={{ fontSize: '11px', color: '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Popular: <strong style={{ color: '#166534' }}>{restaurant.popularDish}</strong>
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedRestaurants;
