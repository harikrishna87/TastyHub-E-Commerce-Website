import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { formatDate } from '../../utils/dateFormatter';

interface Owner {
  _id: string;
  name: string;
  email: string;
}

interface GiftCard {
  _id: string;
  code: string;
  originalValue: number;
  balance: number;
  owner: Owner | string;
  recipientEmail?: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  redeemedToWallet?: boolean;
}

const GiftCardsManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const toast = useRef<Toast>(null);

  // States
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [giftCardDialogVisible, setGiftCardDialogVisible] = useState<boolean>(false);
  const [redeemingCode, setRedeemingCode] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState<number>(0);

  const fetchGiftCards = async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        withCredentials: true
      };
      // Fetch all gift cards in the system
      const response = await axios.get(`${backendUrl}/api/promo/giftcards/all`, config);
      if (response.data.success) {
        setGiftCards(response.data.giftCards);
      }
    } catch (err) {
      console.error('Error fetching gift cards:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchGiftCards();
      setLoading(false);
    };
    init();
  }, [auth?.token]);

  const handleGenerateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;

    if (amount <= 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please enter a valid gift card amount greater than zero.'
      });
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
        `${backendUrl}/api/promo/giftcards`,
        {
          amount,
        },
        config
      );

      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Gift Card generated successfully! Code: ' + response.data.giftCard.code
        });
        setAmount(0);
        setGiftCardDialogVisible(false);
        fetchGiftCards();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Failed',
          detail: response.data.message || 'Failed to generate gift card.'
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to generate gift card.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminRedeem = async (code: string) => {
    if (!auth?.token) return;
    try {
      setRedeemingCode(code);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const res = await axios.post(
        `${backendUrl}/api/promo/giftcards/admin-redeem`,
        { code },
        config
      );

      if (res.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Redeemed',
          detail: res.data.message || "Gift card successfully redeemed to user's wallet."
        });
        fetchGiftCards();
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Redeem Failed',
        detail: err.response?.data?.message || 'Failed to redeem gift card.'
      });
    } finally {
      setRedeemingCode(null);
    }
  };

  // --- RENDERING TEMPLATES ---
  const ownerTemplate = (row: GiftCard) => {
    if (typeof row.owner === 'object' && row.owner !== null) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{row.owner.name}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.owner.email}</span>
        </div>
      );
    }
    return <span style={{ color: '#64748b', fontStyle: 'italic' }}>System Purchased</span>;
  };



  const statusTemplate = (row: GiftCard) => {
    const isExpired = row.expiryDate && new Date() > new Date(row.expiryDate);
    const redeemed = row.balance <= 0 || !row.isActive;

    if (redeemed) {
      if (row.redeemedToWallet) {
        return <Tag value="Redeemed to Wallet" severity="info" style={{ borderRadius: '6px' }} />;
      } else {
        return <Tag value="Used at Checkout" severity="warning" style={{ borderRadius: '6px' }} />;
      }
    }
    if (isExpired) {
      return <Tag value="Expired" severity="danger" style={{ borderRadius: '6px' }} />;
    }
    return <Tag value="Active" severity="success" style={{ borderRadius: '6px' }} />;
  };

  const codeTemplate = (row: GiftCard) => {
    return (
      <div style={styles.codeCell}>
        <i className="pi pi-gift" style={{ color: '#eab308' }} />
        <span style={styles.codeText}>{row.code}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Prepaid Gift Cards...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Toast ref={toast} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={styles.title}>Prepaid Gift Cards Management</h1>
          <p style={styles.sub}>Generate new gift card codes and audit balances or redemptions across all users</p>
        </div>
        <Button
          label="Generate Gift Card"
          icon="pi pi-plus"
          severity="warning"
          onClick={() => setGiftCardDialogVisible(true)}
          style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#eab308', border: 'none' }}
        />
      </div>

      {/* Audit Cards list */}
      <div style={styles.tablePanel}>
        <h2 style={{ ...styles.cardTitle, marginBottom: '1.5rem' }}>
          <i className="pi pi-list" style={styles.cardIcon('#eab308')} />
          <span>Issued Gift Cards Audit</span>
        </h2>
        <DataTable
          value={giftCards}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10]}
          className="p-datatable-striped"
          responsiveLayout="scroll"
          tableStyle={{ minWidth: '60rem' }}
          emptyMessage={() => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
              <i className="pi pi-gift" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No gift cards issued yet.</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Issued prepaid codes or buyer history will display here.</div>
            </div>
          )}
        >
          <Column header="GIFT CARD CODE" body={codeTemplate} style={{ fontWeight: 600 }} sortable />
          <Column header="PURCHASER (OWNER)" body={ownerTemplate} />
          <Column field="originalValue" header="ORIGINAL VALUE" body={(r) => `₹${r.originalValue.toFixed(2)}`} sortable />
          <Column field="expiryDate" header="EXPIRY DATE" body={(r) => r.expiryDate ? formatDate(r.expiryDate) : 'N/A'} sortable />
          <Column header="STATUS" body={statusTemplate} />
          <Column 
            header="ACTIONS" 
            body={(r: GiftCard) => {
              const isExpired = r.expiryDate && new Date() > new Date(r.expiryDate);
              const redeemed = r.balance <= 0 || !r.isActive;
              
              if (!redeemed && !isExpired) {
                return (
                  <Button
                    label="Redeem to Wallet"
                    severity="warning"
                    loading={redeemingCode === r.code}
                    onClick={() => handleAdminRedeem(r.code)}
                    style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '4px 8px' }}
                  />
                );
              }
              return <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>N/A</span>;
            }} 
            style={{ width: '160px' }}
          />
        </DataTable>
      </div>

      {/* Generate Gift Card Dialog */}
      <Dialog
        header="Generate Prepaid Gift Card"
        visible={giftCardDialogVisible}
        onHide={() => setGiftCardDialogVisible(false)}
        style={{ width: '480px', maxWidth: '95vw', borderRadius: '12px' }}
        modal
      >
        <form onSubmit={handleGenerateGiftCard} style={{ ...styles.form, marginTop: '1rem' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Gift Card Amount (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 500, 1000, 5000"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={styles.input}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              onClick={() => setGiftCardDialogVisible(false)}
            />
            <Button
              type="submit"
              label="Issue Gift Card Code"
              style={{ backgroundColor: '#eab308', border: 'none', color: '#ffffff' }}
              loading={submitting}
            />
          </div>
        </form>
      </Dialog>
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
  codeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: 700,
    color: '#1e293b',
    fontSize: '0.95rem',
    letterSpacing: '0.5px',
  },
};

export default GiftCardsManagement;
