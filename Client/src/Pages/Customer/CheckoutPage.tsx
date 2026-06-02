import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import confetti from 'canvas-confetti';

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CartItem {
  _id: string;
  name: string;
  image: string;
  discount_price: number;
  original_price: number;
  quantity: number;
  category: string;
}

interface ComboProduct {
  _id: string;
  title: string;
  price: number;
}

interface ComboDeal {
  _id: string;
  name: string;
  comboPrice: number;
  products: ComboProduct[];
  totalLimit: number;
  timesAccessed: number;
  accessedUsers: string[];
  endTime: string;
  isActive: boolean;
}

const CheckoutPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toastRef = useRef<Toast>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const comboId = searchParams.get('comboId');
  const deliveryCharge = 30;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [comboDeal, setComboDeal] = useState<ComboDeal | null>(null);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [giftCardInput, setGiftCardInput] = useState<string>('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);
  const [giftCardError, setGiftCardError] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'razorpay'>('cod');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWallet, setUseWallet] = useState<boolean>(false);

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3500 });
  };

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    fetchCartAndUser();
    if (comboId) {
      fetchComboDeal(comboId);
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [auth?.isAuthenticated, comboId]);

  const fetchComboDeal = async (id: string) => {
    try {
      const res = await axios.get(`${backendUrl}/api/promo/combos`);
      const matchedCombo = (res.data.combos || []).find((combo: ComboDeal) => combo._id === id);
      if (matchedCombo) {
        setComboDeal(matchedCombo);
      } else {
        showToast('warn', 'Combo Unavailable', 'This combo deal is no longer active.');
      }
    } catch (error) {
      console.error('Failed to load combo deal:', error);
      showToast('error', 'Combo Error', 'Failed to load combo deal details.');
    }
  };

  const fetchCartAndUser = async () => {
    if (!auth?.token) return;

    try {
      setLoading(true);

      const cartRes = await fetch(`${backendUrl}/api/cart/get_cart_items`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (cartRes.status === 401) {
        auth.logout?.();
        navigate('/');
        return;
      }

      const cartData = await cartRes.json();
      if (cartData && cartData.Cart_Items) {
        setCartItems(cartData.Cart_Items);
        if (cartData.Cart_Items.length === 0) {
          showToast('info', 'Cart Empty', 'Your cart is empty. Add items before checking out.');
          navigate('/user/menu-items');
          return;
        }
      }

      const userRes = await fetch(`${backendUrl}/api/auth/getme`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (userRes.status === 401) {
        auth.logout?.();
        navigate('/');
        return;
      }

      const userData = await userRes.json();
      if (userData?.success && userData.user) {
        setWalletBalance(userData.user.walletBalance || 0);
        if (userData.user.shippingAddress) {
          const addr = userData.user.shippingAddress;
          setShippingAddress({
            fullName: addr.fullName || '',
            phone: addr.phone || '',
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            country: addr.country || 'India',
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Load Failed', 'Unable to load checkout details right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !auth?.token) return;

    try {
      setCouponError('');
      const res = await fetch(`${backendUrl}/api/promo/coupons/check/${couponInput.trim().toUpperCase()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        showToast('success', 'Coupon Applied', `Coupon ${data.coupon.code} applied successfully.`);
      } else {
        setCouponError(data.message || 'Invalid Coupon Code');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Failed to validate coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardInput.trim() || !auth?.token) return;

    try {
      setGiftCardError('');
      const res = await fetch(`${backendUrl}/api/promo/giftcards/check/${giftCardInput.trim().toUpperCase()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        setAppliedGiftCard(data.giftCard);
        showToast('success', 'Gift Card Loaded', `Balance available: ₹${Number(data.giftCard.balance || 0).toFixed(2)}`);
      } else {
        setGiftCardError(data.message || 'Invalid Gift Card Code');
        setAppliedGiftCard(null);
      }
    } catch {
      setGiftCardError('Failed to validate gift card.');
      setAppliedGiftCard(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    showToast('info', 'Coupon Removed', 'Promo coupon code has been removed.');
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardInput('');
    setGiftCardError('');
    showToast('info', 'Gift Card Removed', 'Gift card deduction has been removed.');
  };

  const getTotals = () => {
    const cartSubtotal = cartItems.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
    const subtotal = comboDeal ? comboDeal.comboPrice : cartSubtotal;
    const delivery = comboDeal ? 0 : subtotal >= 200 ? 0 : deliveryCharge;
    const originalTotal = subtotal + delivery;

    let couponDiscount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
      couponDiscount =
        appliedCoupon.discountType === 'percentage'
          ? (subtotal * appliedCoupon.discountValue) / 100
          : appliedCoupon.discountValue;
    }

    const totalAfterCoupon = Math.max(0, originalTotal - couponDiscount);

    let giftCardDeduction = 0;
    let finalPayable = totalAfterCoupon;
    if (appliedGiftCard) {
      giftCardDeduction = Math.min(appliedGiftCard.balance, totalAfterCoupon);
      finalPayable = Number((totalAfterCoupon - giftCardDeduction).toFixed(2));
    }

    let walletDeduction = 0;
    if (useWallet && finalPayable > 0 && walletBalance > 0) {
      walletDeduction = Math.min(walletBalance, finalPayable);
      finalPayable = Number((finalPayable - walletDeduction).toFixed(2));
    }

    return {
      subtotal,
      delivery,
      couponDiscount,
      giftCardDeduction,
      walletDeduction,
      finalPayable,
    };
  };

  const saveAddressToProfile = async () => {
    if (!auth?.token) return;

    try {
      await fetch(`${backendUrl}/api/auth/updateprofile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ shippingAddress }),
      });
    } catch {
      console.warn('Failed to update default address on profile');
    }
  };

  const triggerConfetti = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1060 };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: Math.random() - 0.2 } });
    }, 250);
  };

  const clearCartAndRedirect = async (orderId: string, successMessage: string) => {
    if (!auth?.token) return;

    await fetch(`${backendUrl}/api/cart/clear_cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` },
      credentials: 'include',
    });

    if ((window as any).updateCartCount) {
      (window as any).updateCartCount();
    }

    triggerConfetti();

    showToast('success', 'Order Confirmed', successMessage);
    setTimeout(() => navigate(`/user/ordersuccess/${orderId}`), 2200);
  };

  const createOrder = async (paymentMethod: string, paymentId?: string) => {
    if (!auth?.token) return null;

    const res = await axios.post(
      `${backendUrl}/api/orders`,
      {
        shippingAddress,
        paymentMethod,
        paymentId,
        couponCode: appliedCoupon?.code,
        giftCardCode: appliedGiftCard?.code,
        useWallet,
        comboId: comboDeal?._id,
      },
      {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      }
    );

    return res.data;
  };

  const handlePlaceOrder = async () => {
    const { finalPayable, walletDeduction } = getTotals();

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city) {
      showToast('warn', 'Address Required', 'Please fill out all required shipping address fields.');
      return;
    }

    if (!auth?.token) {
      navigate('/');
      return;
    }

    await saveAddressToProfile();

    if (finalPayable === 0) {
      try {
        setPlacingOrder(true);
        const data = await createOrder(useWallet && walletDeduction > 0 ? 'wallet' : 'gift_card');
        if (data?.success) {
          await clearCartAndRedirect(data.order._id, data.message || 'Your order has been placed successfully.');
        }
      } catch (err: any) {
        showToast('error', 'Order Failed', err.response?.data?.message || 'Failed to place order.');
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    if (selectedPayment === 'cod') {
      try {
        setPlacingOrder(true);
        const data = await createOrder('cod');
        if (data?.success) {
          await clearCartAndRedirect(data.order._id, 'Order placed successfully via Cash on Delivery.');
        }
      } catch (err: any) {
        showToast('error', 'Order Failed', err.response?.data?.message || 'Failed to place order.');
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    try {
      setPlacingOrder(true);
      const keyRes = await axios.get<{ key: string }>(`${backendUrl}/razorpay/getkey`);
      const razorpayKey = keyRes.data.key;

      const processRes = await axios.post(`${backendUrl}/razorpay/payment/process`, { amount: finalPayable }, { withCredentials: true });
      const rzpOrder = processRes.data.order;

      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'TastyHub',
        description: comboDeal ? `${comboDeal.name} Combo Checkout` : 'Secure Food Purchase Payment',
        order_id: rzpOrder.id,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
          email: auth.user?.email || '',
        },
        theme: { color: '#22c55e' },
        handler: async (response: any) => {
          if (!response.razorpay_payment_id) return;

          try {
            const data = await createOrder('online', response.razorpay_payment_id);
            if (data?.success) {
              await clearCartAndRedirect(data.order._id, 'Payment successful! Your order is confirmed.');
            }
          } catch (createErr: any) {
            console.error(createErr);
            showToast('error', 'Order Registration Failed', 'Payment was captured, but order registration failed. Please contact support.');
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
            showToast('info', 'Payment Cancelled', 'Payment process was cancelled by the user.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Payment Failed', err.response?.data?.message || 'Razorpay initialization failed.');
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Checkout Details...</span>
      </div>
    );
  }

  const { subtotal, delivery, couponDiscount, giftCardDeduction, walletDeduction, finalPayable } = getTotals();

  return (
    <div style={styles.container}>
      <Toast ref={toastRef} />

      <div style={styles.header}>
        <h1 style={styles.title}>Secure Checkout</h1>
        <p style={styles.sub}>Review address details, apply live offers, and complete your order with confidence.</p>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.detailsColumn}>
          {comboDeal && (
            <div style={{ ...styles.cardPanel, background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', border: '1px solid #bbf7d0' }}>
              <h2 style={styles.cardTitle}>
                <i className="pi pi-gift" style={{ color: '#22c55e' }} />
                <span>Combo Deal Applied</span>
              </h2>
              <p style={styles.cardSub}>{comboDeal.name} is active on this checkout. Special combo pricing is locked for this order.</p>
            </div>
          )}

          <div style={styles.cardPanel}>
            <h2 style={styles.cardTitle}>
              <i className="pi pi-map-marker" style={{ color: '#22c55e' }} />
              <span>Shipping Address</span>
            </h2>
            <p style={styles.cardSub}>Provide complete delivery coordinates for our executives.</p>

            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Recipient Full Name *</label>
                <input type="text" value={shippingAddress.fullName} onChange={(e) => setShippingAddress((prev) => ({ ...prev, fullName: e.target.value }))} style={styles.input} />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Phone *</label>
                  <input type="text" value={shippingAddress.phone} onChange={(e) => setShippingAddress((prev) => ({ ...prev, phone: e.target.value }))} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zip/Postal Code *</label>
                  <input type="text" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress((prev) => ({ ...prev, postalCode: e.target.value }))} style={styles.input} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address Line 1 *</label>
                <input type="text" value={shippingAddress.addressLine1} onChange={(e) => setShippingAddress((prev) => ({ ...prev, addressLine1: e.target.value }))} style={styles.input} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address Line 2</label>
                <input type="text" value={shippingAddress.addressLine2} onChange={(e) => setShippingAddress((prev) => ({ ...prev, addressLine2: e.target.value }))} style={styles.input} />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>City *</label>
                  <input type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>State *</label>
                  <input type="text" value={shippingAddress.state} onChange={(e) => setShippingAddress((prev) => ({ ...prev, state: e.target.value }))} style={styles.input} />
                </div>
              </div>
            </div>
          </div>

        </div>

        <div style={styles.summaryColumn}>
          {finalPayable > 0 && (
            <div style={{ ...styles.cardPanel, padding: '1.5rem', marginBottom: '0' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                <i className="pi pi-credit-card" style={{ color: '#22c55e', marginRight: '6px' }} />
                <span>Select Payment Method</span>
              </h3>
              <p style={{ ...styles.cardSub, margin: '0 0 1rem 0' }}>Choose your preferred payment experience.</p>

              <div style={styles.paymentSelectorGrid}>
                <div onClick={() => setSelectedPayment('cod')} style={selectedPayment === 'cod' ? styles.activePaymentOption : styles.paymentOption}>
                  <i className="pi pi-wallet" style={{ fontSize: '1.5rem', color: selectedPayment === 'cod' ? '#22c55e' : '#64748b' }} />
                  <div style={styles.paymentMeta}>
                    <div style={styles.paymentTitle}>Cash on Delivery</div>
                    <div style={styles.paymentDesc}>Pay with cash or UPI at your doorstep.</div>
                  </div>
                  {selectedPayment === 'cod' && <i className="pi pi-check-circle" style={styles.checkIcon} />}
                </div>

                <div onClick={() => setSelectedPayment('razorpay')} style={selectedPayment === 'razorpay' ? styles.activePaymentOption : styles.paymentOption}>
                  <i className="pi pi-globe" style={{ fontSize: '1.5rem', color: selectedPayment === 'razorpay' ? '#22c55e' : '#64748b' }} />
                  <div style={styles.paymentMeta}>
                    <div style={styles.paymentTitle}>Online Razorpay</div>
                    <div style={styles.paymentDesc}>Cards, Netbanking, Wallets, and UPI.</div>
                  </div>
                  {selectedPayment === 'razorpay' && <i className="pi pi-check-circle" style={styles.checkIcon} />}
                </div>
              </div>
            </div>
          )}

          <div style={styles.promoCard}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
              <i className="pi pi-tags" style={{ color: '#22c55e', marginRight: '6px' }} />
              <span>Promo Codes & Gift Cards</span>
            </h3>

            <div style={styles.promoGroup}>
              <div style={styles.inlineForm}>
                <InputText 
                  placeholder="ENTER COUPON CODE" 
                  value={appliedCoupon ? appliedCoupon.code : couponInput} 
                  onChange={(e) => setCouponInput(e.target.value)} 
                  disabled={!!appliedCoupon} 
                  style={styles.inlineInput} 
                />
                {appliedCoupon ? (
                  <Button 
                    label="Remove" 
                    onClick={handleRemoveCoupon} 
                    className="p-button-danger" 
                    style={{ ...styles.inlineBtn, backgroundColor: '#dc3545', borderColor: '#dc3545' }} 
                  />
                ) : (
                  <Button 
                    label="Apply" 
                    onClick={handleApplyCoupon} 
                    disabled={!couponInput.trim()} 
                    className="p-button-success" 
                    style={styles.inlineBtn} 
                  />
                )}
              </div>
              {couponError && <span style={styles.errorText}>{couponError}</span>}
            </div>

            <div style={{ ...styles.promoGroup, marginTop: '1rem' }}>
              <div style={styles.inlineForm}>
                <InputText 
                  placeholder="ENTER GIFT CARD CODE" 
                  value={appliedGiftCard ? appliedGiftCard.code : giftCardInput} 
                  onChange={(e) => setGiftCardInput(e.target.value)} 
                  disabled={!!appliedGiftCard} 
                  style={styles.inlineInput} 
                />
                {appliedGiftCard ? (
                  <Button 
                    label="Remove" 
                    onClick={handleRemoveGiftCard} 
                    className="p-button-danger" 
                    style={{ ...styles.inlineBtn, backgroundColor: '#dc3545', borderColor: '#dc3545' }} 
                  />
                ) : (
                  <Button 
                    label="Apply" 
                    onClick={handleApplyGiftCard} 
                    disabled={!giftCardInput.trim()} 
                    className="p-button-success" 
                    style={styles.inlineBtn} 
                  />
                )}
              </div>
              {giftCardError && <span style={styles.errorText}>{giftCardError}</span>}
            </div>
          </div>

          {walletBalance > 0 && (
            <div style={{ ...styles.promoCard, marginTop: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                <i className="pi pi-wallet" style={{ color: '#22c55e', marginRight: '6px' }} />
                <span>Wallet Balance</span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', backgroundColor: '#f0fdf4', border: '1px dashed #22c55e', padding: '1rem', borderRadius: '10px' }} onClick={() => setUseWallet(!useWallet)}>
                <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }} onClick={(e) => e.stopPropagation()} />
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534', cursor: 'pointer', display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Pay using Wallet Balance</span>
                  <strong>Available: ₹{walletBalance.toFixed(2)}</strong>
                </label>
              </div>
            </div>
          )}

          <div style={styles.billingCard}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
              <i className="pi pi-receipt" style={{ color: '#22c55e', marginRight: '6px' }} />
              <span>Bill Calculation</span>
            </h3>

            <div style={styles.billRow}>
              <span>{comboDeal ? 'Combo Subtotal' : 'Items Subtotal'}</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div style={styles.billRow}>
              <span>Delivery Fee</span>
              {delivery === 0 ? <span style={{ color: '#22c55e', fontWeight: 600 }}>Free Delivery</span> : <span>₹{delivery.toFixed(2)}</span>}
            </div>

            {couponDiscount > 0 && (
              <div style={{ ...styles.billRow, color: '#22c55e' }}>
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            {giftCardDeduction > 0 && (
              <div style={{ ...styles.billRow, color: '#eab308' }}>
                <span>Gift Card Paid</span>
                <span>-₹{giftCardDeduction.toFixed(2)}</span>
              </div>
            )}

            {walletDeduction > 0 && (
              <div style={{ ...styles.billRow, color: '#22c55e' }}>
                <span>Wallet Balance Paid</span>
                <span>-₹{walletDeduction.toFixed(2)}</span>
              </div>
            )}

            <hr style={styles.hr} />

            <div style={styles.totalPayableRow}>
              <span>Amount Payable</span>
              <span style={styles.totalVal}>₹{finalPayable.toFixed(2)}</span>
            </div>

            <Button
              label={finalPayable === 0 ? 'Complete Order' : `Place Order (₹${finalPayable.toFixed(2)})`}
              icon="pi pi-check"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              loading={placingOrder}
              className="p-button-success"
              style={{ width: '100%', marginTop: '1.5rem', borderRadius: '12px', padding: '0.85rem', fontWeight: 600 }}
            />
            <div style={{ marginTop: '1.25rem', backgroundColor: '#f0fdf4', border: '1px dashed #22c55e', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <i className="pi pi-clock" style={{ color: '#166534', fontSize: '1.1rem' }} />
              <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>Estimated Delivery Time: <strong>25-30 Mins</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    padding: '2rem 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  sub: {
    fontSize: '0.95rem',
    color: '#64748b',
    margin: '0.35rem 0 0 0',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    alignItems: 'start',
  },
  detailsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    flex: 2,
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
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
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
    flexWrap: 'wrap' as const,
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
  paymentSelectorGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.85rem',
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative' as const,
  },
  activePaymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative' as const,
  },
  paymentMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
  },
  paymentTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#1e293b',
  },
  paymentDesc: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '0.1rem',
  },
  checkIcon: {
    fontSize: '1.25rem',
    color: '#22c55e',
    position: 'absolute' as const,
    right: '1rem',
  },
  summaryColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    flex: 1,
  },
  promoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  },
  promoGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
  },
  inlineForm: {
    display: 'flex',
    gap: '0.5rem',
  },
  inlineInput: {
    flex: 1,
    borderRadius: '10px',
    fontSize: '0.85rem',
    padding: '0.5rem 0.75rem',
  },
  inlineBtn: {
    borderRadius: '10px',
    padding: '0.5rem 1rem',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
    fontWeight: 600,
    marginTop: '0.1rem',
  },
  billingCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#475569',
    marginBottom: '0.75rem',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '1rem 0',
  },
  totalPayableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#0f172a',
  },
  totalVal: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#22c55e',
  },
};

export default CheckoutPage;
