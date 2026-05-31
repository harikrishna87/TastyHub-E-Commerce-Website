import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

interface Product {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface ComboDeal {
  _id: string;
  name: string;
  products: Product[];
  comboPrice: number;
  totalLimit: number;
  timesAccessed: number;
  endTime: string;
  isActive: boolean;
}

const ComboDealsManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // State
  const [combos, setCombos] = useState<ComboDeal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [comboPrice, setComboPrice] = useState<number>(0);
  const [totalLimit, setTotalLimit] = useState<number>(100);
  const [endTime, setEndTime] = useState('');

  const fetchCombos = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/promo/combos`);
      if (response.data.success) {
        setCombos(response.data.combos);
      }
    } catch (err) {
      console.error('Error fetching combos:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
      let fetchedProducts: Product[] = [];
      if (Array.isArray(response.data)) {
        fetchedProducts = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const resData = response.data as any;
        fetchedProducts = resData.products || resData.data || resData.result || resData.items || [];
      }
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCombos(), fetchProducts()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleProductToggle = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedProductIds(prev => [...prev, id]);
    }
  };

  const handleCreateCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;

    if (!name || selectedProductIds.length === 0 || comboPrice <= 0 || !totalLimit || !endTime) {
      alert('Please fill in all required fields and select at least one product.');
      return;
    }

    try {
      setSubmitting(true);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await axios.post(
        `${backendUrl}/api/promo/combos`,
        {
          name,
          products: selectedProductIds,
          comboPrice,
          totalLimit,
          endTime: new Date(endTime)
        },
        config
      );

      if (response.data.success) {
        alert('Combo deal created successfully!');
        setName('');
        setSelectedProductIds([]);
        setComboPrice(0);
        setTotalLimit(100);
        setEndTime('');
        fetchCombos();
      } else {
        alert(response.data.message || 'Failed to create combo deal.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create combo deal.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- DATATABLE RENDERING TEMPLATES ---
  const productsTemplate = (row: ComboDeal) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {row.products && row.products.map(p => (
          <div key={p._id} style={styles.prodTag}>
            <img src={p.image} alt={p.title} style={styles.prodTagImg} onError={(e)=>{(e.target as any).src='https://primefaces.org/cdn/primereact/images/logo.png'}} />
            <span style={styles.prodTagText}>{p.title}</span>
          </div>
        ))}
      </div>
    );
  };

  const limitTemplate = (row: ComboDeal) => {
    const isExceeded = row.timesAccessed >= row.totalLimit;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>{row.timesAccessed}</span>
        <span style={{ color: '#94a3b8' }}>/</span>
        <span>{row.totalLimit} claims</span>
        {isExceeded && <Tag value="Sold Out" severity="danger" style={{ fontSize: '0.65rem', borderRadius: '4px' }} />}
      </div>
    );
  };

  const expiryTemplate = (row: ComboDeal) => {
    const now = new Date();
    const exp = new Date(row.endTime);
    const isExpired = now > exp;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{exp.toLocaleDateString()}</span>
        <span style={{ fontSize: '0.75rem', color: isExpired ? '#ef4444' : '#64748b', fontWeight: isExpired ? 600 : 400 }}>
          {isExpired ? 'Expired' : exp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  };

  const statusTemplate = (row: ComboDeal) => {
    const isExpired = new Date() > new Date(row.endTime);
    const active = row.isActive && !isExpired && row.timesAccessed < row.totalLimit;
    return (
      <Tag
        value={active ? 'Active' : 'Ended'}
        severity={active ? 'success' : 'secondary'}
        style={{ borderRadius: '6px' }}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Combo Deals...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Combo Deals Management</h1>
        <p style={styles.sub}>Bundle products together for promotional discount prices and usage limits</p>
      </div>

      <div style={styles.splitGrid}>
        {/* Combo deal creation card */}
        <div style={styles.cardPanel}>
          <h2 style={styles.cardTitle}>
            <i className="pi pi-briefcase" style={styles.cardIcon('#22c55e')} />
            <span>Create Combo Bundle</span>
          </h2>
          <p style={styles.cardSub}>Select items and set a promotional bundle pricing structure</p>

          <form onSubmit={handleCreateCombo} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Combo Name *</label>
              <input
                type="text"
                placeholder="e.g. Weekend Biryani Feasts"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Promo Price (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 499"
                  value={comboPrice || ''}
                  onChange={(e) => setComboPrice(Number(e.target.value))}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Max Usage Limit (Claims) *</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={totalLimit}
                  onChange={(e) => setTotalLimit(Number(e.target.value))}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Expiration Date & Time *</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Product selection multi checkbox */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Bundled Products * (Choose multiple)</label>
              <div style={styles.productSelectionBox}>
                {products.map(prod => {
                  const isChecked = selectedProductIds.includes(prod._id);
                  return (
                    <div
                      key={prod._id}
                      onClick={() => handleProductToggle(prod._id)}
                      style={isChecked ? styles.selectedProductCard : styles.productCard}
                    >
                      <img src={prod.image} alt={prod.title} style={styles.prodImg} onError={(e)=>{(e.target as any).src='https://primefaces.org/cdn/primereact/images/logo.png'}} />
                      <div style={styles.prodMeta}>
                        <div style={styles.prodTitle}>{prod.title}</div>
                        <div style={styles.prodPrice}>₹{prod.price.toFixed(2)}</div>
                      </div>
                      <div style={isChecked ? styles.checkCircleActive : styles.checkCircle}>
                        {isChecked && <i className="pi pi-check" style={{ color: '#ffffff', fontSize: '0.75rem' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              label="Activate Combo Bundle"
              icon="pi pi-check"
              className="p-button-success"
              style={{ width: '100%', marginTop: '0.5rem', borderRadius: '12px', padding: '0.75rem' }}
              loading={submitting}
            />
          </form>
        </div>

        {/* Combos list */}
        <div style={styles.tablePanel}>
          <h2 style={{ ...styles.cardTitle, marginBottom: '1.5rem' }}>
            <i className="pi pi-list" style={styles.cardIcon('#22c55e')} />
            <span>Active Combo Bundles</span>
          </h2>
          <DataTable
            value={combos}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10]}
            className="p-datatable-striped"
            responsiveLayout="scroll"
            emptyMessage={() => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
                <i className="pi pi-briefcase" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No combo deals created yet.</div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Create bundles to showcase direct discount offers.</div>
              </div>
            )}
          >
            <Column field="name" header="BUNDLE NAME" style={{ fontWeight: 600 }} sortable />
            <Column header="INCLUDED PRODUCTS" body={productsTemplate} style={{ minWidth: '220px' }} />
            <Column field="comboPrice" header="BUNDLE PRICE" body={(r) => `₹${r.comboPrice.toFixed(2)}`} sortable />
            <Column header="TIMES CLAIMED" body={limitTemplate} sortable />
            <Column header="EXPIRY DATE" body={expiryTemplate} sortable />
            <Column header="STATUS" body={statusTemplate} />
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
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
  },
  cardPanel: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  },
  tablePanel: {
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
  productSelectionBox: {
    maxHeight: '260px',
    overflowY: 'auto' as const,
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.75rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'all 0.2s ease',
  },
  selectedProductCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    backgroundColor: '#f0fdf4',
    border: '1.5px solid #22c55e',
    borderRadius: '8px',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'all 0.2s ease',
  },
  prodImg: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
  },
  prodMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    overflow: 'hidden',
  },
  prodTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  prodPrice: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  checkCircle: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '1.5px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    border: '1.5px solid #22c55e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    padding: '0.25rem 0.5rem',
    border: '1px solid #e2e8f0',
  },
  prodTagImg: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    objectFit: 'cover' as const,
  },
  prodTagText: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#475569',
  },
};

export default ComboDealsManagement;
