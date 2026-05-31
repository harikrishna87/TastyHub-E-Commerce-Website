import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

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
}

const GiftCardsManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // States
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [amount, setAmount] = useState<number>(0);
  const [recipientEmail, setRecipientEmail] = useState<string>('');

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
      alert('Please enter a valid gift card amount greater than zero.');
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
          recipientEmail: recipientEmail || undefined
        },
        config
      );

      if (response.data.success) {
        alert('Gift Card generated successfully! Code: ' + response.data.giftCard.code);
        setAmount(0);
        setRecipientEmail('');
        fetchGiftCards();
      } else {
        alert(response.data.message || 'Failed to generate gift card.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to generate gift card.');
    } finally {
      setSubmitting(false);
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

  const recipientTemplate = (row: GiftCard) => {
    if (row.recipientEmail) {
      return <span>{row.recipientEmail}</span>;
    }
    return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Self Redeemed / Unassigned</span>;
  };

  const statusTemplate = (row: GiftCard) => {
    const isExpired = row.expiryDate && new Date() > new Date(row.expiryDate);
    const redeemed = row.balance <= 0 || !row.isActive;

    if (redeemed) {
      return <Tag value="Redeemed" severity="secondary" style={{ borderRadius: '6px' }} />;
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
      <div style={styles.header}>
        <h1 style={styles.title}>Prepaid Gift Cards Management</h1>
        <p style={styles.sub}>Generate new gift card codes and audit balances or redemptions across all users</p>
      </div>

      <div style={styles.splitGrid}>
        {/* Generate Card Card */}
        <div style={styles.cardPanel}>
          <h2 style={styles.cardTitle}>
            <i className="pi pi-gift" style={styles.cardIcon('#eab308')} />
            <span>Generate Prepaid Gift Card</span>
          </h2>
          <p style={styles.cardSub}>Issue a secure gift card and send details directly via Brevo email services</p>

          <form onSubmit={handleGenerateGiftCard} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Gift Card Amount (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 500, 1000, 5000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Recipient Email Address (Optional)</label>
              <input
                type="email"
                placeholder="e.g. customer@gmail.com (defaults to buyer email)"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                style={styles.input}
              />
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                If provided, the gift card code will be emailed directly to this recipient.
              </p>
            </div>

            <Button
              type="submit"
              label="Issue Gift Card Code"
              icon="pi pi-check"
              className="p-button-warning"
              style={{ width: '100%', marginTop: '0.5rem', borderRadius: '12px', padding: '0.75rem', backgroundColor: '#eab308', border: 'none', color: '#ffffff' }}
              loading={submitting}
            />
          </form>
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
            <Column header="RECIPIENT EMAIL" body={recipientTemplate} />
            <Column field="originalValue" header="ORIGINAL VALUE" body={(r) => `₹${r.originalValue.toFixed(2)}`} sortable />
            <Column field="balance" header="REMAINING BALANCE" body={(r) => `₹${r.balance.toFixed(2)}`} sortable />
            <Column field="expiryDate" header="EXPIRY DATE" body={(r) => r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : 'N/A'} sortable />
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
