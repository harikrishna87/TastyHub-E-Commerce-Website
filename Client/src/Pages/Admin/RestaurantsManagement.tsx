import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';

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

interface OfferBanner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  linkCategory: string;
  discountText: string;
  isActive: boolean;
}

const RestaurantsManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const toastRef = useRef<Toast>(null);

  // Lists and loading
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Restaurant Dialog & Form States
  const [restDialog, setRestDialog] = useState<boolean>(false);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);
  const [restName, setRestName] = useState<string>('');
  const [restCat, setRestCat] = useState<string>('');
  const [restImg, setRestImg] = useState<string>('');
  const [restCuisines, setRestCuisines] = useState<string>('');
  const [restRating, setRestRating] = useState<number>(4.5);
  const [restReviews, setRestReviews] = useState<string>('100+');
  const [restDelivery, setRestDelivery] = useState<string>('20-30 min');
  const [restCost, setRestCost] = useState<string>('₹300 for two');
  const [restOffer, setRestOffer] = useState<string>('');
  const [restPopular, setRestPopular] = useState<string>('');
  const [restIsVeg, setRestIsVeg] = useState<boolean>(true);

  // Banner Dialog & Form States
  const [bannerDialog, setBannerDialog] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<OfferBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState<string>('');
  const [bannerSubtitle, setBannerSubtitle] = useState<string>('');
  const [bannerImg, setBannerImg] = useState<string>('');
  const [bannerLinkCat, setBannerLinkCat] = useState<string>('');
  const [bannerDiscText, setBannerDiscText] = useState<string>('');
  const [bannerIsActive, setBannerIsActive] = useState<boolean>(true);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [restRes, bannerRes, prodRes] = await Promise.all([
        axios.get(`${backendUrl}/api/restaurants`),
        axios.get(`${backendUrl}/api/offers`),
        axios.get(`${backendUrl}/api/products/getallproducts`)
      ]);

      if (restRes.data.success) setRestaurants(restRes.data.data || []);
      if (bannerRes.data.success) setBanners(bannerRes.data.data || []);
      
      // Extract unique categories from products to pre-populate dropdown
      const prodData = prodRes.data.data || [];
      const uniqueCats = [...new Set(prodData.map((p: any) => p.category))] as string[];
      setCategories(uniqueCats.filter(Boolean));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load panel lists.' });
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Restaurant Form for Add
  const openNewRest = () => {
    setEditingRest(null);
    setRestName('');
    setRestCat('');
    setRestImg('');
    setRestCuisines('');
    setRestRating(4.5);
    setRestReviews('100+');
    setRestDelivery('20-30 min');
    setRestCost('₹300 for two');
    setRestOffer('');
    setRestPopular('');
    setRestIsVeg(true);
    setRestDialog(true);
  };

  // Open Restaurant Form for Edit
  const editRest = (rest: Restaurant) => {
    setEditingRest(rest);
    setRestName(rest.name);
    setRestCat(rest.category);
    setRestImg(rest.image);
    setRestCuisines(rest.cuisines.join(', '));
    setRestRating(rest.rating);
    setRestReviews(rest.reviewsCount);
    setRestDelivery(rest.deliveryTime);
    setRestCost(rest.costForTwo);
    setRestOffer(rest.offer || '');
    setRestPopular(rest.popularDish || '');
    setRestIsVeg(rest.isVeg);
    setRestDialog(true);
  };

  // Save Restaurant (Add or Update)
  const saveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restName || !restCat || !restImg || !restDelivery || !restCost) {
      toastRef.current?.show({ severity: 'warn', summary: 'Missing Fields', detail: 'Please fill in all required fields.' });
      return;
    }

    const payload = {
      name: restName,
      category: restCat,
      image: restImg,
      cuisines: restCuisines.split(',').map(s => s.trim()).filter(Boolean),
      rating: restRating,
      reviewsCount: restReviews,
      deliveryTime: restDelivery,
      costForTwo: restCost,
      offer: restOffer,
      popularDish: restPopular,
      isVeg: restIsVeg
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${auth?.token}` },
        withCredentials: true
      };

      if (editingRest) {
        // Update
        const res = await axios.put(`${backendUrl}/api/restaurants/${editingRest._id}`, payload, config);
        if (res.data.success) {
          toastRef.current?.show({ severity: 'success', summary: 'Success', detail: 'Restaurant updated successfully.' });
          setRestDialog(false);
          fetchData();
        }
      } else {
        // Create
        const res = await axios.post(`${backendUrl}/api/restaurants`, payload, config);
        if (res.data.success) {
          toastRef.current?.show({ severity: 'success', summary: 'Success', detail: 'Restaurant created successfully.' });
          setRestDialog(false);
          fetchData();
        }
      }
    } catch (err: any) {
      console.error(err);
      toastRef.current?.show({ severity: 'error', summary: 'Save Failed', detail: err.response?.data?.message || 'Failed to save restaurant.' });
    }
  };

  // Delete Restaurant
  const deleteRest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this restaurant profile?')) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${auth?.token}` },
        withCredentials: true
      };
      const res = await axios.delete(`${backendUrl}/api/restaurants/${id}`, config);
      if (res.data.success) {
        toastRef.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Restaurant profile deleted.' });
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      toastRef.current?.show({ severity: 'error', summary: 'Delete Failed', detail: err.response?.data?.message || 'Failed to delete.' });
    }
  };

  // Open Banner Form for Add
  const openNewBanner = () => {
    setEditingBanner(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImg('');
    setBannerLinkCat('');
    setBannerDiscText('');
    setBannerIsActive(true);
    setBannerDialog(true);
  };

  // Open Banner Form for Edit
  const editBanner = (banner: OfferBanner) => {
    setEditingBanner(banner);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle);
    setBannerImg(banner.image);
    setBannerLinkCat(banner.linkCategory);
    setBannerDiscText(banner.discountText);
    setBannerIsActive(banner.isActive);
    setBannerDialog(true);
  };

  // Save Banner (Add or Update)
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerSubtitle || !bannerImg || !bannerLinkCat || !bannerDiscText) {
      toastRef.current?.show({ severity: 'warn', summary: 'Missing Fields', detail: 'Please fill in all required banner fields.' });
      return;
    }

    const payload = {
      title: bannerTitle,
      subtitle: bannerSubtitle,
      image: bannerImg,
      linkCategory: bannerLinkCat,
      discountText: bannerDiscText,
      isActive: bannerIsActive
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${auth?.token}` },
        withCredentials: true
      };

      if (editingBanner) {
        // Update
        const res = await axios.put(`${backendUrl}/api/offers/${editingBanner._id}`, payload, config);
        if (res.data.success) {
          toastRef.current?.show({ severity: 'success', summary: 'Success', detail: 'Offer banner updated.' });
          setBannerDialog(false);
          fetchData();
        }
      } else {
        // Create
        const res = await axios.post(`${backendUrl}/api/offers`, payload, config);
        if (res.data.success) {
          toastRef.current?.show({ severity: 'success', summary: 'Success', detail: 'Offer banner created.' });
          setBannerDialog(false);
          fetchData();
        }
      }
    } catch (err: any) {
      console.error(err);
      toastRef.current?.show({ severity: 'error', summary: 'Save Failed', detail: err.response?.data?.message || 'Failed to save offer banner.' });
    }
  };

  // Delete Banner
  const deleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${auth?.token}` },
        withCredentials: true
      };
      const res = await axios.delete(`${backendUrl}/api/offers/${id}`, config);
      if (res.data.success) {
        toastRef.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Banner slide removed.' });
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      toastRef.current?.show({ severity: 'error', summary: 'Delete Failed', detail: err.response?.data?.message || 'Failed to delete.' });
    }
  };

  // Table Column Templates
  const imageTemplate = (rowData: any) => (
    <img 
      src={rowData.image} 
      alt={rowData.name || rowData.title} 
      style={{ width: '60px', height: '45px', borderRadius: '6px', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
    />
  );

  const vegTemplate = (rowData: Restaurant) => (
    <Tag 
      value={rowData.isVeg ? 'VEG🟢' : 'NON-VEG🔴'} 
      severity={rowData.isVeg ? 'success' : 'danger'} 
      style={{ fontSize: '11px', padding: '4px 8px' }}
    />
  );

  const activeTemplate = (rowData: OfferBanner) => (
    <Tag 
      value={rowData.isActive ? 'Active' : 'Disabled'} 
      severity={rowData.isActive ? 'success' : 'secondary'}
    />
  );

  const restActionTemplate = (rowData: Restaurant) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button 
        icon="pi pi-pencil" 
        className="p-button-text p-button-sm" 
        style={{ color: '#15803d', padding: 0 }} 
        onClick={() => editRest(rowData)} 
      />
      <Button 
        icon="pi pi-trash" 
        className="p-button-text p-button-sm" 
        style={{ color: '#ef4444', padding: 0 }} 
        onClick={() => deleteRest(rowData._id)} 
      />
    </div>
  );

  const bannerActionTemplate = (rowData: OfferBanner) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button 
        icon="pi pi-pencil" 
        className="p-button-text p-button-sm" 
        style={{ color: '#15803d', padding: 0 }} 
        onClick={() => editBanner(rowData)} 
      />
      <Button 
        icon="pi pi-trash" 
        className="p-button-text p-button-sm" 
        style={{ color: '#ef4444', padding: 0 }} 
        onClick={() => deleteBanner(rowData._id)} 
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Toast ref={toastRef} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Gourmet Restaurants & Banners Management</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Configure dynamic culinary brands and homepage deal banners</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            label="Add Restaurant" 
            icon="pi pi-plus" 
            className="p-button-success" 
            style={{ borderRadius: '8px', background: '#15803d', borderColor: '#15803d' }} 
            onClick={openNewRest} 
          />
          <Button 
            label="Add Banner" 
            icon="pi pi-image" 
            className="p-button-outlined" 
            style={{ borderRadius: '8px', color: '#15803d', borderColor: '#15803d' }} 
            onClick={openNewBanner} 
          />
        </div>
      </div>

      {/* Restaurants Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0' }}>
          <i className="pi pi-shop" style={{ color: '#15803d' }} /> Active Dining Restaurants
        </h2>
        <DataTable value={restaurants} loading={loading} paginator rows={5} className="p-datatable-striped" responsiveLayout="scroll">
          <Column header="IMAGE" body={imageTemplate} style={{ width: '80px' }} />
          <Column field="name" header="RESTAURANT NAME" style={{ fontWeight: 700 }} sortable />
          <Column field="category" header="CATEGORY FILTER" sortable />
          <Column field="deliveryTime" header="DELIVERY" />
          <Column field="costForTwo" header="COST FOR TWO" />
          <Column field="rating" header="RATING" body={(r)=><span>★ {r.rating} ({r.reviewsCount})</span>} sortable />
          <Column header="VEG TYPE" body={vegTemplate} />
          <Column field="offer" header="BANNER OFFER" style={{ color: '#dc2626', fontWeight: 600 }} />
          <Column header="ACTIONS" body={restActionTemplate} style={{ width: '80px' }} />
        </DataTable>
      </div>

      {/* Banners Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0' }}>
          <i className="pi pi-images" style={{ color: '#15803d' }} /> Main Screen Promotion Banners
        </h2>
        <DataTable value={banners} loading={loading} paginator rows={5} className="p-datatable-striped" responsiveLayout="scroll">
          <Column header="SLIDE IMAGE" body={imageTemplate} style={{ width: '80px' }} />
          <Column field="title" header="PROMO TITLE" style={{ fontWeight: 600 }} />
          <Column field="subtitle" header="SUBTITLE DESCR." />
          <Column field="linkCategory" header="CLICK REDIRECT CAT." />
          <Column field="discountText" header="COUPON TEXT" style={{ fontWeight: 700 }} />
          <Column header="STATUS" body={activeTemplate} />
          <Column header="ACTIONS" body={bannerActionTemplate} style={{ width: '80px' }} />
        </DataTable>
      </div>

      {/* Restaurant Dialog Dialog */}
      <Dialog 
        header={editingRest ? "Modify Restaurant Profile" : "Register New Gourmet Restaurant"} 
        visible={restDialog} 
        style={{ width: '550px' }} 
        modal 
        onHide={() => setRestDialog(false)}
      >
        <form onSubmit={saveRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Restaurant Name *</label>
            <InputText value={restName} onChange={(e) => setRestName(e.target.value)} required placeholder="e.g. Burger Bistro" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category Map *</label>
              <Dropdown 
                value={restCat} 
                options={categories.map(c => ({ label: c, value: c }))} 
                onChange={(e) => setRestCat(e.value)} 
                required 
                placeholder="Select Category" 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Delivery Duration *</label>
              <InputText value={restDelivery} onChange={(e) => setRestDelivery(e.target.value)} required placeholder="e.g. 15-20 min" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Image URL *</label>
            <InputText value={restImg} onChange={(e) => setRestImg(e.target.value)} required placeholder="https://images.unsplash.com/..." />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cuisines (Comma Separated)</label>
            <InputText value={restCuisines} onChange={(e) => setRestCuisines(e.target.value)} placeholder="e.g. Smash Burgers, American, Craft Fries" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Cost For Two *</label>
              <InputText value={restCost} onChange={(e) => setRestCost(e.target.value)} required placeholder="e.g. ₹300 for two" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rating Score (0 to 5)</label>
              <InputNumber value={restRating} onValueChange={(e) => setRestRating(e.value || 0)} min={0} max={5} maxFractionDigits={1} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Promo Tagline Offer</label>
              <InputText value={restOffer} onChange={(e) => setRestOffer(e.target.value)} placeholder="e.g. FLAT 20% OFF, FREE DELIVERY" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Featured Specialty Dish</label>
              <InputText value={restPopular} onChange={(e) => setRestPopular(e.target.value)} placeholder="e.g. Special Bacon Cheeseburger" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <Checkbox inputId="restIsVeg" checked={restIsVeg} onChange={(e) => setRestIsVeg(e.checked || false)} />
            <label htmlFor="restIsVeg" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Is Pure Vegetarian Kitchen? 🟢</label>
          </div>

          <Button type="submit" label="Save Restaurant Profile" icon="pi pi-check" className="p-button-success" style={{ width: '100%', marginTop: '10px', background: '#15803d', border: 'none', padding: '0.75rem', borderRadius: '8px' }} />
        </form>
      </Dialog>

      {/* Banner Dialog Dialog */}
      <Dialog 
        header={editingBanner ? "Modify Promotion Slide" : "Upload New Promotion Banner"} 
        visible={bannerDialog} 
        style={{ width: '500px' }} 
        modal 
        onHide={() => setBannerDialog(false)}
      >
        <form onSubmit={saveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Promo Title *</label>
            <InputText value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} required placeholder="e.g. Flat 50% Off First Order" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Description Subtitle *</label>
            <InputText value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} required placeholder="e.g. Delicious gourmet meals delivered hot & fresh to you" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Banner Image URL *</label>
            <InputText value={bannerImg} onChange={(e) => setBannerImg(e.target.value)} required placeholder="https://images.unsplash.com/..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click Redirect Category *</label>
              <Dropdown 
                value={bannerLinkCat} 
                options={categories.map(c => ({ label: c, value: c }))} 
                onChange={(e) => setBannerLinkCat(e.value)} 
                required 
                placeholder="Select Category" 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Coupon Discount Text *</label>
              <InputText value={bannerDiscText} onChange={(e) => setBannerDiscText(e.target.value)} required placeholder="e.g. WELCOME50" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <Checkbox inputId="bannerIsActive" checked={bannerIsActive} onChange={(e) => setBannerIsActive(e.checked || false)} />
            <label htmlFor="bannerIsActive" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Active Banner (Enable Display) 🟢</label>
          </div>

          <Button type="submit" label="Save Promo Banner Slide" icon="pi pi-check" className="p-button-success" style={{ width: '100%', marginTop: '10px', background: '#15803d', border: 'none', padding: '0.75rem', borderRadius: '8px' }} />
        </form>
      </Dialog>
    </div>
  );
};

export default RestaurantsManagement;
