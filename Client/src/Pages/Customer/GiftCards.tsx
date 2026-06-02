import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface IGiftCard {
  _id: string;
  code: string;
  originalValue: number;
  balance: number;
  recipientEmail?: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

const GiftCards: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [myGiftCards, setMyGiftCards] = useState<IGiftCard[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [redeeming, setRedeeming] = useState<boolean>(false);

  // Buy Gift Card fields
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');

  // Redeem Card dialog state
  const [redeemModalOpen, setRedeemModalOpen] = useState<boolean>(false);
  const [redeemCode, setRedeemCode] = useState<string>('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch My Gift Cards
  const fetchMyGiftCards = useCallback(async () => {
    if (!auth?.token) {
      setLoadingCards(false);
      return;
    }

    try {
      setLoadingCards(true);
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.get(`${backendUrl}/api/promo/giftcards/my`, config);
      if (res.data.success) {
        setMyGiftCards(res.data.giftCards || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to load gift cards history'
      });
    } finally {
      setLoadingCards(false);
    }
  }, [auth?.token, backendUrl]);

  // Load Razorpay Script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    fetchMyGiftCards();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [fetchMyGiftCards]);

  // Get active purchase amount
  const getPurchaseAmount = () => {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedPresetAmount;
  };

  // Buy Gift Card using Razorpay payment
  const handlePurchaseGiftCard = async () => {
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }
    const amount = getPurchaseAmount();
    if (amount <= 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Invalid Amount',
        detail: 'Please select or enter a valid gift card purchase amount'
      });
      return;
    }

    try {
      setPurchasing(true);

      // 1. Fetch Razorpay API key
      const keyRes = await axios.get<{ key: string }>(`${backendUrl}/razorpay/getkey`);
      const razorpayKey = keyRes.data.key;

      // 2. Initialize payment process on backend to get Razorpay order object
      const processRes = await axios.post(
        `${backendUrl}/razorpay/payment/process`,
        { amount },
        { withCredentials: true }
      );

      if (!processRes.data.success) {
        throw new Error('Razorpay order process failed');
      }

      const rzpOrder = processRes.data.order;

      // 3. Configure Razorpay checkout options
      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'TastyHub Gift Cards',
        description: `Purchase ₹${amount} Gift Card`,
        order_id: rzpOrder.id,
        prefill: {
          name: auth?.user?.name || '',
          email: auth?.user?.email || '',
        },
        theme: { color: '#15803d' },
        handler: async function (response: any) {
          if (response.razorpay_payment_id) {
            try {
              // 4. Hit Promo giftcard creation endpoint after successful payment validation
              const res = await axios.post(
                `${backendUrl}/api/promo/giftcards`,
                {
                  amount,
                  recipientEmail: recipientEmail || undefined,
                  paymentId: response.razorpay_payment_id
                },
                {
                  headers: { Authorization: `Bearer ${auth?.token}` },
                  withCredentials: true
                }
              );

              if (res.data.success) {
                toast.current?.show({
                  severity: 'success',
                  summary: 'Success',
                  detail: res.data.message || 'Gift card purchased successfully!'
                });
                
                // Reset form fields
                setCustomAmount('');
                setRecipientEmail('');
                
                // Refresh list
                fetchMyGiftCards();
              }
            } catch (err: any) {
              console.error(err);
              toast.current?.show({
                severity: 'error',
                summary: 'Activation Error',
                detail: err.response?.data?.message || 'Failed to record purchased gift card'
              });
            }
          }
        },
        modal: {
          ondismiss: function () {
            setPurchasing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Payment Error',
        detail: err.response?.data?.message || 'Razorpay checkout initialization failed'
      });
      setPurchasing(false);
    }
  };

  // Redeem Gift Card
  const handleRedeemGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }
    if (!redeemCode.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Required',
        detail: 'Please enter a Gift Card code'
      });
      return;
    }

    try {
      setRedeeming(true);
      const config = {
        headers: { Authorization: `Bearer ${auth?.token}` },
        withCredentials: true,
      };
      const res = await axios.post(`${backendUrl}/api/promo/giftcards/redeem`, {
        code: redeemCode.trim()
      }, config);

      if (res.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Redeemed',
          detail: res.data.message || 'Wallet balance updated successfully!'
        });
        
        // Update user context wallet balance if supported
        if (auth?.login && auth.user && auth.token && res.data.walletBalance !== undefined) {
          auth.login({ ...auth.user, walletBalance: res.data.walletBalance } as any, auth.token);
        }

        setRedeemModalOpen(false);
        setRedeemCode('');
        fetchMyGiftCards();
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Failed',
        detail: err.response?.data?.message || 'Invalid or expired Gift Card code'
      });
    } finally {
      setRedeeming(false);
    }
  };

  // Helper copy code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.current?.show({
      severity: 'info',
      summary: 'Copied',
      detail: 'Gift Card code copied to clipboard'
    });
  };

  // Preset button styling helper
  const presetButtonStyle = (amount: number) => ({
    padding: '0.85rem 1.5rem',
    borderRadius: '10px',
    border: `2px solid ${selectedPresetAmount === amount && !customAmount ? '#15803d' : '#e5e7eb'}`,
    backgroundColor: selectedPresetAmount === amount && !customAmount ? '#dcfce7' : '#ffffff',
    color: selectedPresetAmount === amount && !customAmount ? '#15803d' : '#374151',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    flex: 1,
    textAlign: 'center' as const
  });

  return (
    <div style={{ padding: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
      <Toast ref={toast} className="custom-toast" />

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            <i className="pi pi-gift" style={{ color: '#15803d', marginRight: '0.5rem' }}></i> TastyHub Gift Cards
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            Buy dining credits for friends or redeem received gift cards into your wallet instantly.
          </p>
        </div>
        <Button
          label="Redeem Gift Card"
          icon="pi pi-wallet"
          severity="success"
          onClick={() => {
            if (!auth?.isAuthenticated) {
              navigate('/user/auth');
            } else {
              setRedeemModalOpen(true);
            }
          }}
          style={{ borderRadius: '8px', padding: '0.6rem 1.2rem', fontSize: '0.88rem', fontWeight: 600 }}
        />
      </div>

      {/* Side-by-side purchase and promo settings */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: '2.5rem' }}>
        
        {/* Left Buy Gift Card configuration */}
        <div style={{
          flex: '1 1 450px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '2rem',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
              Purchase Gift Card
            </h3>
            
            {/* Presets Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Select Denomination</label>
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                <button type="button" onClick={() => { setSelectedPresetAmount(500); setCustomAmount(''); }} style={presetButtonStyle(500)}>₹500</button>
                <button type="button" onClick={() => { setSelectedPresetAmount(1000); setCustomAmount(''); }} style={presetButtonStyle(1000)}>₹1,000</button>
                <button type="button" onClick={() => { setSelectedPresetAmount(2000); setCustomAmount(''); }} style={presetButtonStyle(2000)}>₹2,000</button>
                <button type="button" onClick={() => { setSelectedPresetAmount(5000); setCustomAmount(''); }} style={presetButtonStyle(5000)}>₹5,000</button>
              </div>
            </div>

            {/* Custom Amount */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Or Custom Amount (₹)</label>
              <InputText
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom value in Rupees"
                style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem' }}
              />
            </div>

            {/* Optional Recipient Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Recipient Email</label>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>Optional (Sends code directly)</span>
              </div>
              <InputText
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. friend@example.com"
                style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 600 }}>Total Purchase Payable:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>₹{getPurchaseAmount().toLocaleString()}</span>
            </div>
            
            <Button
              label={purchasing ? "Processing Secure Payment..." : "Buy Gift Card with Razorpay"}
              icon="pi pi-credit-card"
              severity="success"
              loading={purchasing}
              onClick={handlePurchaseGiftCard}
              style={{ width: '100%', borderRadius: '8px', padding: '0.75rem', fontWeight: 700, fontSize: '0.92rem' }}
            />
          </div>
        </div>

        {/* Right Info Section / How it works */}
        <div style={{
          flex: '1 1 350px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '2rem',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
              How it works
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#1f2937' }}>Choose Amount</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.4' }}>Select a preset credit value or input your own. Set a recipient email if buying as a surprise gift!</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#1f2937' }}>Complete Secure Payment</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.4' }}>Razorpay processes standard Indian cards, UPI, Wallets, and NetBanking securely in one window.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#1f2937' }}>Code Delivery</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.4' }}>The system creates a unique code starting with <code>GIFT-</code>. We send code receipt instructions to your inbox.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem 1rem', marginTop: '1.5rem', color: '#15803d', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="pi pi-info-circle" style={{ fontSize: '1rem' }}></i>
            <span>All purchased gift cards carry a 1-year validity from their purchase timestamp.</span>
          </div>
        </div>
      </div>

      {/* Bottom Gift Card History table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)', padding: '1.5rem', overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#1f2937' }}>
          My Gift Cards History
        </h3>

        <DataTable
          value={myGiftCards}
          loading={loadingCards}
          paginator
          rows={5}
          responsiveLayout="scroll"
          style={{ fontSize: '0.88rem' }}
          emptyMessage={() => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
              <i className="pi pi-gift" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>No gift cards found</div>
              <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.25rem' }}>You haven't purchased or received any gift cards yet.</div>
            </div>
          )}
        >
          <Column
            header="GIFT CARD CODE"
            body={(rowData: IGiftCard) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#111827' }}>{rowData.code}</code>
                <Button
                  icon="pi pi-copy"
                  className="p-button-text p-button-success p-button-sm"
                  onClick={() => handleCopyCode(rowData.code)}
                  style={{ padding: '0.25rem', width: '1.5rem', height: '1.5rem' }}
                  tooltip="Copy Code"
                />
              </div>
            )}
            style={{ fontWeight: 'bold' }}
          />
          <Column
            header="ORIGINAL VALUE"
            body={(rowData: IGiftCard) => <span>₹{rowData.originalValue.toFixed(2)}</span>}
          />
          <Column
            header="REMAINING BALANCE"
            body={(rowData: IGiftCard) => <span style={{ fontWeight: 700, color: '#15803d' }}>₹{rowData.balance.toFixed(2)}</span>}
          />
          <Column
            header="RECIPIENT EMAIL"
            body={(rowData: IGiftCard) => <span>{rowData.recipientEmail || 'Self (Bought for me)'}</span>}
          />
          <Column
            header="EXPIRY"
            body={(rowData: IGiftCard) => <span>{new Date(rowData.expiryDate).toLocaleDateString()}</span>}
          />
          <Column
            header="STATUS"
            body={(rowData: IGiftCard) => {
              const isExpired = new Date() > new Date(rowData.expiryDate);
              const isConsumed = rowData.balance <= 0;

              let sev: 'success' | 'warning' | 'danger' = 'success';
              let val = 'Active';

              if (isConsumed) {
                sev = 'danger';
                val = 'Fully Consumed';
              } else if (isExpired) {
                sev = 'warning';
                val = 'Expired';
              }

              return <Tag severity={sev} value={val} style={{ fontSize: '0.75rem' }} />;
            }}
          />
        </DataTable>
      </div>

      {/* Redeem Card Dialog Modal */}
      <Dialog
        visible={redeemModalOpen}
        onHide={() => setRedeemModalOpen(false)}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}>
            <i className="pi pi-wallet" style={{ color: '#15803d', fontSize: '1.2rem' }}></i>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937' }}>Redeem Gift Card to Wallet</span>
          </div>
        }
        style={{ width: '400px', maxWidth: '95vw', borderRadius: '12px' }}
        modal
      >
        <form onSubmit={handleRedeemGiftCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Enter Gift Card Code *</label>
            <InputText
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              required
              style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem' }}
              placeholder="e.g. GIFT-XXXX-YYYY"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              onClick={() => setRedeemModalOpen(false)}
              style={{ borderRadius: '8px', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            />
            <Button
              type="submit"
              label="Redeem Now"
              severity="success"
              loading={redeeming}
              style={{ borderRadius: '8px', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            />
          </div>
        </form>
      </Dialog>

    </div>
  );
};

export default GiftCards;