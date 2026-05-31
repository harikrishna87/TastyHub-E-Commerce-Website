import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';

interface Product {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  isAnnouncement: boolean;
  expiryDate: string;
  isActive: boolean;
}

interface Discount {
  _id: string;
  name: string;
  targetType: 'product' | 'category';
  targetValue: string;
  discountPercentage: number;
  isActive: boolean;
}

const CouponsManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Coupon form state
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [isAnnounce, setIsAnnounce] = useState(true);
  const [expiryDate, setExpiryDate] = useState('');
  
  // Discount form state
  const [discName, setDiscName] = useState('');
  const [targetType, setTargetType] = useState<'product' | 'category'>('category');
  const [targetVal, setTargetVal] = useState('');
  const [discPercent, setDiscPercent] = useState(0);

  // Lists & Loading states
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);

  // Fetch Products & Categories
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
      let fetchedProducts: Product[] = [];
      if (Array.isArray(response.data)) {
        fetchedProducts = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const resData = response.data as any;
        fetchedProducts = resData.products || resData.data || resData.result || resData.items || [];
      }
      setProducts(fetchedProducts);

      // Extract unique categories
      const cats = Array.from(new Set(fetchedProducts.map(p => p.category))).filter(Boolean);
      setUniqueCategories(cats);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [backendUrl]);

  // Fetch Added Coupons
  const fetchCoupons = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true
      };
      const response = await axios.get(`${backendUrl}/api/promo/coupons`, config);
      if (response.data.success) {
        setCoupons(response.data.coupons || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  }, [auth?.token, backendUrl]);

  // Fetch Active Catalog Discounts
  const fetchDiscounts = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true
      };
      const response = await axios.get(`${backendUrl}/api/promo/discounts`, config);
      if (response.data.success) {
        setDiscounts(response.data.discounts || []);
      }
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  }, [auth?.token, backendUrl]);

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      setLoadingLists(true);
      await fetchProducts();
      if (auth?.token) {
        await Promise.all([fetchCoupons(), fetchDiscounts()]);
      }
      setLoadingLists(false);
    };
    init();
  }, [auth?.token, fetchProducts, fetchCoupons, fetchDiscounts]);

  // Reset target value when target type changes
  useEffect(() => {
    setTargetVal('');
  }, [targetType]);

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!auth?.token) return;
    if (!window.confirm('Are you sure you want to delete this coupon code?')) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true
      };
      const response = await axios.delete(`${backendUrl}/api/promo/coupons/${id}`, config);
      if (response.data.success) {
        setCoupons(prev => prev.filter(c => c._id !== id));
      } else {
        alert(response.data.message || 'Failed to delete coupon.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete coupon.');
    }
  };

  // Delete Discount
  const handleDeleteDiscount = async (id: string) => {
    if (!auth?.token) return;
    if (!window.confirm('Are you sure you want to delete this catalog discount?')) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true
      };
      const response = await axios.delete(`${backendUrl}/api/promo/discounts/${id}`, config);
      if (response.data.success) {
        setDiscounts(prev => prev.filter(d => d._id !== id));
      } else {
        alert(response.data.message || 'Failed to delete discount.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete discount.');
    }
  };

  // Form submission: Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;

    if (!couponCode || discountValue <= 0 || !expiryDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoadingCoupon(true);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await axios.post(
        `${backendUrl}/api/promo/coupons`,
        {
          code: couponCode.toUpperCase(),
          discountType,
          discountValue,
          minOrderAmount: minOrder,
          isAnnouncement: isAnnounce,
          expiryDate: new Date(expiryDate)
        },
        config
      );

      if (response.data.success) {
        alert('Coupon created successfully!');
        setCouponCode('');
        setDiscountValue(0);
        setMinOrder(0);
        setExpiryDate('');
        fetchCoupons();
      } else {
        alert(response.data.message || 'Failed to create coupon.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setLoadingCoupon(false);
    }
  };

  // Form submission: Discount
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;

    if (!discName || !targetVal || discPercent <= 0 || discPercent > 100) {
      alert('Please fill in all required fields. Percentage must be between 1 and 100.');
      return;
    }

    try {
      setLoadingDiscount(true);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await axios.post(
        `${backendUrl}/api/promo/discounts`,
        {
          name: discName,
          targetType,
          targetValue: targetVal,
          discountPercentage: discPercent
        },
        config
      );

      if (response.data.success) {
        alert('Direct Catalog Discount created successfully!');
        setDiscName('');
        setTargetVal('');
        setDiscPercent(0);
        fetchDiscounts();
      } else {
        alert(response.data.message || 'Failed to create discount.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create discount.');
    } finally {
      setLoadingDiscount(false);
    }
  };

  // --- RENDERING TEMPLATES ---
  
  const couponTypeTemplate = (row: Coupon) => (
    <Tag 
      value={row.discountType === 'percentage' ? 'Percentage (%)' : 'Fixed Flat (₹)'}
      severity={row.discountType === 'percentage' ? 'info' : 'warning'}
      style={{ borderRadius: '6px' }}
    />
  );

  const couponValueTemplate = (row: Coupon) => (
    <strong style={{ color: '#0f172a' }}>
      {row.discountType === 'percentage' ? `${row.discountValue}%` : `₹${row.discountValue}`}
    </strong>
  );

  const couponAnnouncementTemplate = (row: Coupon) => (
    <Tag 
      value={row.isAnnouncement ? 'Home Banner' : 'Code Only'}
      severity={row.isAnnouncement ? 'success' : 'secondary'}
      style={{ borderRadius: '6px' }}
    />
  );

  const expiryTemplate = (row: Coupon) => {
    const expired = new Date() > new Date(row.expiryDate);
    return (
      <span style={{ color: expired ? '#ef4444' : '#475569', fontWeight: expired ? 600 : 400 }}>
        {new Date(row.expiryDate).toLocaleDateString('en-IN')}
      </span>
    );
  };

  const discountTargetTemplate = (row: Discount) => (
    <Tag 
      value={row.targetType === 'category' ? 'Category-wide' : 'Specific Product'}
      severity={row.targetType === 'category' ? 'success' : 'info'}
      style={{ borderRadius: '6px' }}
    />
  );

  if (loadingLists) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Promotion Catalogs...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Coupons & Catalog Discounts</h1>
        <p style={styles.sub}>Create checkout promotions, announcement bars, and direct category markdown rules</p>
      </div>

      <div style={styles.splitGrid}>
        {/* Coupon creation card */}
        <div style={styles.cardPanel}>
          <h2 style={styles.cardTitle}>
            <i className="pi pi-ticket" style={styles.cardIcon('#3b82f6')} />
            <span>Create Coupon Code</span>
          </h2>
          <p style={styles.cardSub}>Generate checkout codes or home screen session announcements</p>

          <form onSubmit={handleCreateCoupon} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. WELCOME20, FLATSAVE50"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Discount Type *</label>
                <Dropdown
                  value={discountType}
                  options={[
                    { label: 'Percentage (%)', value: 'percentage' },
                    { label: 'Fixed Flat Amount (₹)', value: 'fixed' }
                  ]}
                  onChange={(e) => setDiscountType(e.value as any)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Discount Value *</label>
                <input
                  type="number"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={minOrder || ''}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date *</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="isAnnounce"
                checked={isAnnounce}
                onChange={(e) => setIsAnnounce(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="isAnnounce" style={styles.checkboxLabel}>
                Show Coupon as Announcement modal on website Home screen
              </label>
            </div>

            <Button
              type="submit"
              label="Generate Coupon"
              icon="pi pi-check"
              className="p-button-success"
              style={{ width: '100%', marginTop: '1rem', borderRadius: '12px', padding: '0.75rem' }}
              loading={loadingCoupon}
            />
          </form>
        </div>

        {/* Dynamic discount rule card */}
        <div style={styles.cardPanel}>
          <h2 style={styles.cardTitle}>
            <i className="pi pi-percentage" style={styles.cardIcon('#22c55e')} />
            <span>Create Direct Markdown Discount</span>
          </h2>
          <p style={styles.cardSub}>Apply direct catalog percentage discounts on matching products automatically</p>

          <form onSubmit={handleCreateDiscount} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Discount Rule Name *</label>
              <input
                type="text"
                placeholder="e.g. Summer Biryani Bonanza, Appetizers Deal"
                value={discName}
                onChange={(e) => setDiscName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Type *</label>
                <Dropdown
                  value={targetType}
                  options={[
                    { label: 'Category-wide', value: 'category' },
                    { label: 'Specific Product Title', value: 'product' }
                  ]}
                  onChange={(e) => setTargetType(e.value as any)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Discount Percentage (%) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={discPercent || ''}
                  onChange={(e) => setDiscPercent(Number(e.target.value))}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Target {targetType === 'category' ? 'Category' : 'Product'} Value *
              </label>
              {loadingProducts ? (
                <div style={{ padding: '0.65rem', color: '#64748b', fontSize: '0.85rem' }}>Loading selections...</div>
              ) : targetType === 'category' ? (
                <Dropdown
                  value={targetVal}
                  options={uniqueCategories.map(cat => ({ label: cat, value: cat }))}
                  onChange={(e) => setTargetVal(e.value)}
                  placeholder="Select Category"
                  style={{ width: '100%' }}
                />
              ) : (
                <Dropdown
                  value={targetVal}
                  options={products.map(prod => ({ label: prod.title, value: prod.title }))}
                  onChange={(e) => setTargetVal(e.value)}
                  placeholder="Select Product"
                  style={{ width: '100%' }}
                />
              )}
            </div>

            <Button
              type="submit"
              label="Activate Discount Rule"
              icon="pi pi-check"
              className="p-button-success"
              style={{ width: '100%', marginTop: '1.2rem', borderRadius: '12px', padding: '0.75rem' }}
              loading={loadingDiscount}
            />
          </form>
        </div>
      </div>

      {/* Stacked Tables Display Section */}
      <div style={styles.tablesBlock}>
        {/* Active Coupons List */}
        <div style={styles.tablePanel}>
          <h2 style={{ ...styles.cardTitle, marginBottom: '1rem' }}>
            <i className="pi pi-list" style={styles.cardIcon('#3b82f6')} />
            <span>Active Promotion Coupons</span>
          </h2>
          <DataTable
            value={coupons}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10]}
            className="p-datatable-striped"
            responsiveLayout="scroll"
            emptyMessage={() => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                <i className="pi pi-ticket" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No promotion coupons found.</div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Generate coupon codes to allow checkout discounts.</div>
              </div>
            )}
          >
            <Column field="code" header="COUPON CODE" style={{ fontWeight: 700 }} sortable />
            <Column header="DISCOUNT TYPE" body={couponTypeTemplate} />
            <Column header="VALUE" body={couponValueTemplate} />
            <Column field="minOrderAmount" header="MIN ORDER" body={(r)=><span>₹{r.minOrderAmount}</span>} sortable />
            <Column header="EXPIRY" body={expiryTemplate} sortable />
            <Column header="DISTRIBUTION" body={couponAnnouncementTemplate} />
            <Column 
              header="ACTIONS" 
              body={(row: Coupon) => (
                <Button 
                  icon="pi pi-trash" 
                  className="p-button-text p-button-plain p-button-sm"
                  style={{ color: '#ef4444', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
                  onClick={() => handleDeleteCoupon(row._id)}
                  tooltip="Delete Coupon"
                />
              )} 
              style={{ width: '80px' }} 
            />
          </DataTable>
        </div>

        {/* Active Catalog Discounts List */}
        <div style={styles.tablePanel}>
          <h2 style={{ ...styles.cardTitle, marginBottom: '1rem' }}>
            <i className="pi pi-percentage" style={styles.cardIcon('#22c55e')} />
            <span>Catalog Discount Rules</span>
          </h2>
          <DataTable
            value={discounts}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10]}
            className="p-datatable-striped"
            responsiveLayout="scroll"
            emptyMessage={() => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                <i className="pi pi-percentage" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No markdown discount rules active.</div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Create category or product direct markdowns.</div>
              </div>
            )}
          >
            <Column field="name" header="RULE NAME" style={{ fontWeight: 600 }} sortable />
            <Column header="TARGET AREA" body={discountTargetTemplate} />
            <Column field="targetValue" header="TARGET ITEM/CAT" style={{ fontWeight: 600, color: '#475569' }} sortable />
            <Column field="discountPercentage" header="MARKDOWN %" body={(r)=><strong>{r.discountPercentage}% OFF</strong>} sortable />
            <Column 
              header="ACTIONS" 
              body={(row: Discount) => (
                <Button 
                  icon="pi pi-trash" 
                  className="p-button-text p-button-plain p-button-sm"
                  style={{ color: '#ef4444', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
                  onClick={() => handleDeleteDiscount(row._id)}
                  tooltip="Delete Discount"
                />
              )} 
              style={{ width: '80px' }} 
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  sub: {
    fontSize: '0.88rem',
    color: '#64748b',
    margin: '0.2rem 0 0 0',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '1.5rem',
  },
  cardPanel: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  cardIcon: (color: string) => ({
    color,
    fontSize: '1.4rem',
  }),
  cardSub: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0.35rem 0 1.5rem 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#475569',
  },
  input: {
    padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    outline: 'none',
    width: '100%',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#22c55e',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.82rem',
    color: '#475569',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  tablesBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
    marginTop: '1rem'
  },
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  }
};

export default CouponsManagement;
