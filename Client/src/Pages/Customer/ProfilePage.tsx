import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Tag as PrimeTag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Rating } from 'primereact/rating';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';
import { OrderDeliveryStatus } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'delivery_executive';
  image?: string;
  shippingAddress?: ShippingAddress;
  deliveryStatus?: 'Pending' | 'Approved' | 'Rejected';
  isAvailable?: boolean;
  walletBalance?: number;
  createdAt?: string;
}

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

// interface ITransaction {
//   _id: string;
//   type: 'Credit' | 'Debit';
//   amount: number;
//   description: string;
//   createdAt: string;
// }

interface ICoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
}

interface OrderStatusTrackerProps {
  currentStatus: OrderDeliveryStatus;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Accepted': return 1;
      case 'Preparing': return 2;
      case 'Pickup': return 3;
      case 'Out for Delivery':
      case 'Shipped':
        return 4;
      case 'Delivered': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  const steps = [
    { key: 'Pending', title: 'Ordered', sub: 'Placed with success', icon: 'pi pi-clock' },
    { key: 'Accepted', title: 'Accepted', sub: 'Kitchen confirmed', icon: 'pi pi-check-circle' },
    { key: 'Preparing', title: 'Cooking', sub: 'Chef is preparing', icon: 'pi pi-spinner' },
    { key: 'Pickup', title: 'Picked Up', sub: 'Partner received', icon: 'pi pi-shopping-cart' },
    { key: 'Out for Delivery', title: 'In Transit', sub: 'Partner on the way', icon: 'pi pi-truck' },
    { key: 'Delivered', title: 'Delivered', sub: 'Delivered at door', icon: 'pi pi-gift' }
  ];

  return (
    <div style={{ padding: '28px 20px', backgroundColor: '#f0fdf4', borderRadius: '16px', margin: '8px 0', border: '1px solid #bbf7d0', boxShadow: 'inset 0 2px 8px rgba(34, 197, 94, 0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', width: '100%', maxWidth: '780px', margin: '0 auto', paddingBottom: '16px' }}>
        <div style={{ position: 'absolute', top: '22px', left: '8.33%', right: '8.33%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '4px', zIndex: 1 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', borderRadius: '4px', width: `${(currentIndex / 5) * 100}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)' }} />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          
          let iconClass = step.icon;
          if (isCompleted) {
            iconClass = 'pi pi-check';
          } else if (isActive && step.key === 'Preparing') {
            iconClass = 'pi pi-spin pi-spinner';
          } else if (isActive && (step.key === 'Out for Delivery' || step.key === 'Shipped')) {
            iconClass = 'pi pi-spin pi-spinner';
          }
          
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, flex: 1 }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: isCompleted ? '#22c55e' : isActive ? '#ffffff' : '#ffffff',
                border: isCompleted 
                  ? '3px solid #22c55e' 
                  : isActive 
                  ? '3px solid #16a34a' 
                  : '3px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCompleted ? 'white' : isActive ? '#16a34a' : '#9ca3af', 
                fontSize: '15px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease', 
                boxShadow: isActive ? '0 0 12px rgba(34, 197, 94, 0.35)' : 'none',
                cursor: 'default'
              }}>
                <i className={iconClass} style={{ fontSize: isCompleted ? '14px' : '15px' }} />
              </div>
              <span style={{ marginTop: '12px', fontSize: '13px', fontWeight: '800', color: isActive ? '#15803d' : isCompleted ? '#166534' : '#9ca3af', textAlign: 'center' }}>
                {step.title}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '600', color: isCompleted ? '#4b5563' : isActive ? '#16a34a' : '#a3a3a3', textAlign: 'center', marginTop: '3px', maxWidth: '90px', display: 'block', lineHeight: 1.2 }}>
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '24px', padding: '12px 16px', backgroundColor: 'white', borderRadius: '10px', border: '1.5px dashed #bbf7d0', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
        <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '14.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <i className={currentIndex < 5 ? "pi pi-spin pi-cog" : "pi pi-check-circle"} />
          {currentStatus === 'Pending' && 'Your order has been placed and is being prepared with love'}
          {currentStatus === 'Accepted' && 'Your order has been accepted by our chef'}
          {currentStatus === 'Preparing' && 'Our kitchen team is cooking your fresh food'}
          {currentStatus === 'Pickup' && 'The delivery partner has picked up your hot food'}
          {(currentStatus === 'Out for Delivery' || currentStatus === 'Shipped') && 'Your order is out for delivery'}
          {currentStatus === 'Delivered' && 'Your order has been successfully delivered! Enjoy your meal'}
        </span>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useRef<Toast>(null);
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [_, setImageUploading] = useState<boolean>(false);

  // Tab State
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Modal visibilities
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Form states - Address
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Form states - Delete password verification
  const [deletePassword, setDeletePassword] = useState<string>('');

  // Admin operational settings states
  const [storeName, setStoreName] = useState('TastyHub');
  const [storeStatus, setStoreStatus] = useState<'Open' | 'Closed'>('Open');
  const [freeDeliveryMin, setFreeDeliveryMin] = useState(500);
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [supportEmail, setSupportEmail] = useState('support@tastyhub.com');
  const [supportPhone, setSupportPhone] = useState('+91 9876543210');
  const [savingSettings, setSavingSettings] = useState(false);

  // Unified Lists States
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [myGiftCards, setMyGiftCards] = useState<IGiftCard[]>([]);
  const totalGiftCardBalance = myGiftCards.reduce((acc, gc) => acc + (gc.balance || 0), 0);
  const [loadingGiftCards, setLoadingGiftCards] = useState<boolean>(false);
  // const [transactions, setTransactions] = useState<ITransaction[]>([]);
  // const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState<boolean>(false);

  // Buy/Redeem Gift Card fields
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [giftCardRecipientEmail, setGiftCardRecipientEmail] = useState<string>('');
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState<boolean>(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState<boolean>(false);
  const [redeemCode, setRedeemCode] = useState<string>('');
  const [redeeming, setRedeeming] = useState<boolean>(false);

  // Order Details Modal states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<any>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptContentRef = useRef<HTMLDivElement>(null);

  // Review Modals states
  const [isProductReviewVisible, setIsProductReviewVisible] = useState<boolean>(false);
  const [isDeliveryReviewVisible, setIsDeliveryReviewVisible] = useState<boolean>(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
  const [productReviews, setProductReviews] = useState<{ [productId: string]: { rating: number; review: string; name: string; image: string } }>({});
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [deliveryFeedback, setDeliveryFeedback] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const resolvedProfileImage =
    imageUrl ||
    profileData?.image ||
    authContext?.user?.image ||
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Admin settings
  const fetchSettings = async () => {
    try {
      const token = authContext?.token || localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/auth/settings`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (response.data.success && response.data.settings) {
        const s = response.data.settings;
        setStoreName(s.storeName || 'TastyHub');
        setStoreStatus(s.storeStatus || 'Open');
        setFreeDeliveryMin(s.freeDeliveryMinAmount ?? 500);
        setDeliveryFee(s.flatDeliveryFee ?? 40);
        setSupportEmail(s.supportEmail || 'support@tastyhub.com');
        setSupportPhone(s.supportPhone || '+91 9876543210');
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const token = authContext?.token || localStorage.getItem('token');
      const response = await axios.put(`${backendUrl}/api/auth/settings`, {
        storeName,
        storeStatus,
        freeDeliveryMinAmount: freeDeliveryMin,
        flatDeliveryFee: deliveryFee,
        supportEmail,
        supportPhone
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Settings Saved',
          detail: 'Store and delivery configurations updated successfully!'
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to update store settings'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Fetch User profile details
  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      if (!token) {
        setFetchLoading(false);
        return;
      }

      const response = await axios.get(`${backendUrl}/api/auth/getme`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (response.data.success) {
        const user = response.data.user;
        setProfileData(user);
        setImageUrl(user.image || '');
        if (user.shippingAddress) {
          setAddressForm({
            fullName: user.shippingAddress.fullName || '',
            phone: user.shippingAddress.phone || '',
            addressLine1: user.shippingAddress.addressLine1 || '',
            addressLine2: user.shippingAddress.addressLine2 || '',
            city: user.shippingAddress.city || '',
            state: user.shippingAddress.state || '',
            postalCode: user.shippingAddress.postalCode || '',
            country: user.shippingAddress.country || ''
          });
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  // Lists fetchers for Customer Unified view
  const fetchOrdersList = async () => {
    const token = authContext?.token || localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingOrders(true);
      const res = await axios.get(`${backendUrl}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchGiftCardsList = async () => {
    const token = authContext?.token || localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingGiftCards(true);
      const res = await axios.get(`${backendUrl}/api/promo/giftcards/my`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (res.data.success) {
        setMyGiftCards(res.data.giftCards || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGiftCards(false);
    }
  };

  const fetchTransactionsList = async () => {
    const token = authContext?.token || localStorage.getItem('token');
    if (!token) return;
    try {
      // setLoadingTransactions(true);
      const res = await axios.get(`${backendUrl}/api/promo/transactions/my`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (res.data.success) {
        // setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // setLoadingTransactions(false);
    }
  };

  const fetchCouponsList = async () => {
    const token = authContext?.token || localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingCoupons(true);
      const res = await axios.get(`${backendUrl}/api/promo/coupons/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (res.data.success) {
        setCoupons(res.data.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [authContext?.token]);

  useEffect(() => {
    const activeTabParam = searchParams.get('tab');
    if (activeTabParam === 'orders') {
      setActiveIndex(1);
    } else if (activeTabParam === 'giftcards') {
      setActiveIndex(2);
    } else if (activeTabParam === 'coupons') {
      setActiveIndex(3);
    } else {
      setActiveIndex(0);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authContext?.user?.image) {
      setImageUrl(authContext.user.image);
    }
  }, [authContext?.user?.image]);

  useEffect(() => {
    if (profileData?.role === 'admin') {
      fetchSettings();
    }
    if (profileData?.role === 'user') {
      fetchOrdersList();
      fetchGiftCardsList();
      fetchTransactionsList();
      fetchCouponsList();

      // Load Razorpay Script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [profileData?.role]);

  // Image Upload Logic
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = authContext?.token || localStorage.getItem('token');
      const response = await axios.post(`${backendUrl}/api/auth/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        setImageUrl(response.data.image);
        setProfileData(response.data.user);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Profile picture updated successfully' });

        if (authContext?.login && token) {
          authContext.login(response.data.user, token);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Upload Failed', detail: err.response?.data?.message || 'Failed to upload photo' });
    } finally {
      setImageUploading(false);
    }
  };

  // Submit Shipping Address
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      const response = await axios.put(`${backendUrl}/api/auth/updateprofile`, {
        shippingAddress: addressForm
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (response.data.success) {
        setProfileData(response.data.user);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Shipping address updated successfully' });
        setShowAddressModal(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to update shipping address' });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'New password and confirm password do not match' });
      return;
    }

    try {
      setActionLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      const response = await axios.put(`${backendUrl}/api/auth/update-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (response.data.success) {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Password changed successfully' });
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Delete Account
  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Please enter your password to confirm account deletion' });
      return;
    }

    try {
      setActionLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      const response = await axios.delete(`${backendUrl}/api/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword },
        withCredentials: true
      });

      if (response.data.success) {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Your TastyHub account has been deleted.' });
        setShowDeleteModal(false);
        if (authContext?.logout) {
          await authContext.logout();
        }
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to delete account' });
    } finally {
      setActionLoading(false);
    }
  };

  // Dynamic Gift Cards purchasing
  const getPurchaseAmount = () => {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedPresetAmount;
  };

  const handlePurchaseGiftCard = async () => {
    const amount = getPurchaseAmount();
    if (amount <= 0) {
      toast.current?.show({ severity: 'warn', summary: 'Invalid Amount', detail: 'Please select or enter a valid gift card purchase amount' });
      return;
    }

    try {
      setPurchasing(true);
      const keyRes = await axios.get<{ key: string }>(`${backendUrl}/razorpay/getkey`);
      const razorpayKey = keyRes.data.key;

      const processRes = await axios.post(`${backendUrl}/razorpay/payment/process`, { amount }, { withCredentials: true });
      if (!processRes.data.success) {
        throw new Error('Razorpay process failed');
      }

      const rzpOrder = processRes.data.order;

      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'TastyHub Gift Cards',
        description: `Purchase ₹${amount} Gift Card`,
        order_id: rzpOrder.id,
        prefill: {
          name: profileData?.name || '',
          email: profileData?.email || '',
        },
        theme: { color: '#15803d' },
        handler: async function (response: any) {
          if (response.razorpay_payment_id) {
            try {
              const res = await axios.post(`${backendUrl}/api/promo/giftcards`, {
                amount,
                recipientEmail: giftCardRecipientEmail || undefined,
                paymentId: response.razorpay_payment_id
              }, {
                headers: { Authorization: `Bearer ${authContext?.token}` },
                withCredentials: true
              });

              if (res.data.success) {
                toast.current?.show({ severity: 'success', summary: 'Success', detail: res.data.message || 'Gift card purchased!' });
                setCustomAmount('');
                setGiftCardRecipientEmail('');
                setPurchaseModalOpen(false);
                fetchGiftCardsList();
              }
            } catch (err: any) {
              toast.current?.show({ severity: 'error', summary: 'Activation Error', detail: err.response?.data?.message || 'Failed to record gift card' });
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
      toast.current?.show({ severity: 'error', summary: 'Payment Error', detail: 'Razorpay checkout initialization failed' });
      setPurchasing(false);
    }
  };

  const handleRedeemGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    try {
      setRedeeming(true);
      const config = { headers: { Authorization: `Bearer ${authContext?.token}` }, withCredentials: true };
      const res = await axios.post(`${backendUrl}/api/promo/giftcards/redeem`, { code: redeemCode.trim() }, config);

      if (res.data.success) {
        toast.current?.show({ severity: 'success', summary: 'Redeemed', detail: res.data.message || 'Wallet balance updated!' });
        if (authContext?.login && authContext.user && authContext.token && res.data.walletBalance !== undefined) {
          authContext.login({ ...authContext.user, walletBalance: res.data.walletBalance } as any, authContext.token);
          setProfileData(prev => prev ? { ...prev, walletBalance: res.data.walletBalance } : null);
        }
        setRedeemModalOpen(false);
        setRedeemCode('');
        fetchGiftCardsList();
        fetchTransactionsList();
      }
    } catch (err: any) {
      toast.current?.show({ severity: 'error', summary: 'Failed', detail: err.response?.data?.message || 'Invalid or expired Gift Card' });
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.current?.show({ severity: 'info', summary: 'Copied', detail: 'Code copied to clipboard' });
  };

  // Orders table view operations
  const showModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const showStatusModal = (order: any) => {
    setSelectedOrderForStatus(order);
    setIsStatusModalVisible(true);
  };

  const openProductReviewModal = async (order: any) => {
    setSelectedOrderForReview(order);
    setSubmittingReview(true);
    try {
      const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
      if (response.data.success) {
        const allProducts = response.data.data;
        const initialReviews: { [productId: string]: { rating: number; review: string; name: string; image: string } } = {};
        
        order.items?.forEach((item: any) => {
          const matchingProduct = allProducts.find(
            (p: any) => (p.title || p.name || '').toLowerCase() === (item.name || '').toLowerCase()
          );
          if (matchingProduct) {
            initialReviews[matchingProduct._id] = {
              rating: 5,
              review: '',
              name: item.name,
              image: item.image
            };
          }
        });
        
        setProductReviews(initialReviews);
        setIsProductReviewVisible(true);
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to retrieve product details for reviews' });
      }
    } catch (err) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load product details' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitProductReviews = async () => {
    const productIds = Object.keys(productReviews);
    if (productIds.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'No products found to rate' });
      return;
    }

    setSubmittingReview(true);
    try {
      const token = authContext?.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      };

      const promises = productIds.map(productId => {
        const { rating, review } = (productReviews as any)[productId];
        return axios.post(
          `${backendUrl}/api/reviews/products/${productId}`,
          {
            rating,
            review: review.trim() || 'Excellent food and taste!',
            orderId: selectedOrderForReview._id
          },
          config
        );
      });

      await Promise.all(promises);

      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Thank you! Product reviews submitted successfully.' });
      setIsProductReviewVisible(false);
      setSelectedOrderForReview(null);
      fetchOrdersList();
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Failed',
        detail: err.response?.data?.message || 'Failed to submit product reviews'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const openDeliveryReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    setDeliveryRating(5);
    setDeliveryFeedback('');
    setIsDeliveryReviewVisible(true);
  };

  const submitDeliveryReview = async () => {
    if (!selectedOrderForReview?.deliveryExecutive) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No delivery partner assigned to this order' });
      return;
    }

    setSubmittingReview(true);
    try {
      const token = authContext?.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      };

      const executiveId = typeof selectedOrderForReview.deliveryExecutive === 'object'
        ? selectedOrderForReview.deliveryExecutive._id
        : selectedOrderForReview.deliveryExecutive;

      const response = await axios.post(
        `${backendUrl}/api/reviews/delivery/${executiveId}`,
        {
          rating: deliveryRating,
          feedback: deliveryFeedback.trim() || 'Great delivery service!',
          orderId: selectedOrderForReview._id
        },
        config
      );

      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Feedback Submitted',
          detail: response.data.message || 'Thank you for rating your delivery partner!'
        });
        setIsDeliveryReviewVisible(false);
        setSelectedOrderForReview(null);
        fetchOrdersList();
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Failed',
        detail: err.response?.data?.message || 'Failed to submit delivery feedback'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!receiptContentRef.current || !selectedOrder) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Content not found' });
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptContentRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Receipt-Order-${selectedOrder._id}.pdf`);
      toast.current?.show({ severity: 'success', summary: 'Downloaded', detail: 'Receipt PDF generated successfully!' });
    } catch (err) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Failed to download receipt' });
    } finally {
      setIsDownloading(false);
    }
  };

  // Style helper
  const presetButtonStyle = (amount: number) => ({
    padding: '0.85rem 1.5rem',
    borderRadius: '10px',
    border: `2px solid ${selectedPresetAmount === amount && !customAmount ? '#15803d' : '#e5e7eb'}`,
    backgroundColor: selectedPresetAmount === amount && !customAmount ? '#dcfce7' : '#ffffff',
    color: selectedPresetAmount === amount && !customAmount ? '#15803d' : '#374151',
    fontWeight: 700,
    cursor: 'pointer',
    flex: 1,
    textAlign: 'center' as const
  });

  if (fetchLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#15803d' }} />
        <span style={{ color: '#15803d', fontWeight: 600 }}>Loading unified profile dashboard...</span>
      </div>
    );
  }

  const hasAddress = profileData?.shippingAddress && Object.values(profileData.shippingAddress).some(Boolean);

  return (
    <div style={{ padding: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
      <Toast ref={toast} className="custom-toast" />

      {/* Header Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
        borderRadius: '16px',
        padding: '2.5rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px rgba(21, 128, 61, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={triggerFileSelect}>
            <img
              src={resolvedProfileImage}
              alt={profileData?.name || 'Profile'}
              referrerPolicy="no-referrer"
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.18)' }}
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
              }}
            />
            <div style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#ffffff', color: '#15803d', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '1px solid #15803d' }}>
              <i className="pi pi-camera" style={{ fontSize: '0.75rem' }}></i>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Welcome Back, {profileData?.name}!</h2>
            <p style={{ fontSize: '0.9rem', color: '#dcfce7', margin: '0.25rem 0' }}>{profileData?.email}</p>
            <PrimeTag value={profileData?.role?.toUpperCase()} severity={profileData?.role === 'admin' ? 'success' : 'info'} style={{ fontSize: '0.75rem', fontWeight: 700 }} />
          </div>
        </div>

        {profileData?.role === 'user' && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '1.25rem 2rem', backdropFilter: 'blur(10px)', textAlign: 'center', minWidth: '220px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#dcfce7', display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Gift Card Balance</span>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>₹{totalGiftCardBalance.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modern Profile and Tab Panel unifying all parts */}
      <div style={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)', overflow: 'hidden', backgroundColor: '#ffffff', padding: '1.5rem' }}>
        {profileData?.role === 'admin' ? (
          /* REDESIGNED ADMIN CONFIGURATION AND METADATA PANEL */
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Left Column: Store Configuration */}
            <div style={{ flex: '2 1 500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f0fdf4', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="pi pi-cog" style={{ color: '#15803d', fontSize: '1.4rem' }}></i>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Store & Delivery Configuration</h3>
                </div>
                <PrimeTag value={storeStatus === 'Open' ? 'ACCEPTING ORDERS' : 'PAUSED'} severity={storeStatus === 'Open' ? 'success' : 'danger'} style={{ borderRadius: '6px', padding: '4px 10px' }} />
              </div>
              <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b5563' }}>Store Brand Name *</label>
                  <InputText value={storeName} onChange={(e) => setStoreName(e.target.value)} required style={styles.formInput} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b5563' }}>Restaurant Status *</label>
                  <Dropdown value={storeStatus} options={[{ label: 'Open (Accept Orders)', value: 'Open' }, { label: 'Closed (Pause Orders)', value: 'Closed' }]} onChange={(e) => setStoreStatus(e.value as any)} style={{ width: '100%', borderRadius: '10px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b5563' }}>Free Delivery Min amount (₹) *</label>
                  <InputText type="number" value={String(freeDeliveryMin)} onChange={(e) => setFreeDeliveryMin(Number(e.target.value))} required style={styles.formInput} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b5563' }}>Flat Delivery Fee (₹) *</label>
                  <InputText type="number" value={String(deliveryFee)} onChange={(e) => setDeliveryFee(Number(e.target.value))} required style={styles.formInput} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b5563' }}>Catering Support Email *</label>
                  <InputText type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required style={styles.formInput} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b5563' }}>Support Contact Phone *</label>
                  <InputText value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} required style={styles.formInput} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <Button type="submit" label="Save Settings" icon="pi pi-check" severity="success" loading={savingSettings} style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold' }} />
                </div>
              </form>
            </div>

            {/* Right Column: Security & Metadata */}
            <div style={{ flex: '1 1 320px', borderLeft: '1px solid #e5e7eb', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #f0fdf4', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <i className="pi pi-user-edit" style={{ color: '#15803d', fontSize: '1.4rem' }}></i>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Admin Identity</h3>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Display Name</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', display: 'block' }}>{profileData?.name}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Email Address</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', display: 'block' }}>{profileData?.email}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Authority Role</span>
                    <PrimeTag value={profileData?.role?.toUpperCase()} severity="success" style={{ fontSize: '0.7rem', fontWeight: 'bold', marginTop: '4px' }} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #f0fdf4', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                  <i className="pi pi-shield" style={{ color: '#15803d', fontSize: '1.2rem' }}></i>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Security Actions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Button label="Change Admin Password" icon="pi pi-key" severity="success" outlined onClick={() => setShowPasswordModal(true)} style={{ borderRadius: '8px', width: '100%', fontWeight: 'bold' }} />
                  <Button label="Deactivate Admin Account" icon="pi pi-trash" severity="danger" text onClick={() => setShowDeleteModal(true)} style={{ borderRadius: '8px', width: '100%', fontWeight: 'bold' }} />
                </div>
              </div>
            </div>
          </div>
        ) : profileData?.role === 'delivery_executive' ? (
          /* REDESIGNED DELIVERY EXECUTIVE SINGLE PANEL */
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 450px' }}>
              <div style={{ borderBottom: '1.5px solid #f0fdf4', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Delivery Partner Service Center</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={styles.addressItem}>
                  <span style={styles.addressLabel}>Approval Status</span>
                  <span style={{ fontWeight: 'bold', color: profileData?.deliveryStatus === 'Approved' ? '#16a34a' : '#ea580c', marginTop: '4px' }}>{profileData?.deliveryStatus?.toUpperCase()}</span>
                </div>
                <div style={styles.addressItem}>
                  <span style={styles.addressLabel}>Availability status</span>
                  <Dropdown
                    value={profileData?.isAvailable ? 'available' : 'offline'}
                    options={[{ label: 'Online / Available for Duty', value: 'available' }, { label: 'Offline / Duty ended', value: 'offline' }]}
                    onChange={(e) => {
                      const val = e.value === 'available';
                      const token = authContext?.token || localStorage.getItem('token');
                      axios.put(`${backendUrl}/api/auth/updateprofile`, { isAvailable: val }, { headers: { Authorization: `Bearer ${token}` } }).then(res => {
                        if (res.data.success) {
                          setProfileData(prev => prev ? { ...prev, isAvailable: val } : null);
                          toast.current?.show({ severity: 'success', summary: 'Status Updated', detail: `Availability set to ${val ? 'Online' : 'Offline'}` });
                        }
                      });
                    }}
                    style={{ marginTop: '4px', width: '100%', borderRadius: '10px' }}
                  />
                </div>
              </div>
            </div>
            {/* Right Security actions panel */}
            <div className="profile-security-sidebar" style={{ flex: '1 1 300px', borderLeft: '1px solid #f3f4f6', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>Security & Account</h3>
              <Button label="Change Password" icon="pi pi-key" severity="success" outlined onClick={() => setShowPasswordModal(true)} style={{ borderRadius: '8px', width: '100%' }} />
              <Button label="Delete Account" icon="pi pi-trash" severity="danger" text onClick={() => setShowDeleteModal(true)} style={{ borderRadius: '8px', width: '100%' }} />
            </div>
          </div>
        ) : (
          /* CUSTOMER PROFILE WITH HORIZONTAL BUTTON TABS */
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              {[
                { label: 'Account Details', icon: 'pi pi-user', index: 0 },
                { label: 'Order History', icon: 'pi pi-shopping-cart', index: 1 },
                { label: 'Gift Cards', icon: 'pi pi-gift', index: 2 },
                { label: 'Dynamic Coupons', icon: 'pi pi-bell', index: 3 }
              ].map((tab) => {
                const isActive = activeIndex === tab.index;
                return (
                  <button
                    key={tab.index}
                    type="button"
                    onClick={() => setActiveIndex(tab.index)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      border: isActive ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: isActive ? '#15803d' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      boxShadow: isActive ? '0 4px 12px rgba(21, 128, 61, 0.2)' : 'none',
                      transition: 'all 0.2s ease',
                      width: 'fit-content'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#94a3b8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                  >
                    <i className={tab.icon} style={{ fontSize: '0.9rem' }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              {/* Panel 0: Account Details */}
              {activeIndex === 0 && (
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {/* Left Address panel */}
                  <div style={{ flex: '2 1 450px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="pi pi-map-marker" style={{ color: '#15803d', fontSize: '1.25rem' }}></i>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>Shipping Details</h3>
                      </div>
                      {hasAddress && (
                        <Button label="Edit Address" icon="pi pi-pencil" severity="success" text onClick={() => setShowAddressModal(true)} style={{ fontSize: '0.82rem', fontWeight: 600 }} />
                      )}
                    </div>

                    {!hasAddress ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', border: '2px dashed #bbf7d0', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#15803d', gap: '1rem', textAlign: 'center' }}>
                        <i className="pi pi-map" style={{ fontSize: '3rem', color: '#86efac' }}></i>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#166534' }}>No shipping address set yet</h4>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#15803d' }}>Add your coordinates now for rapid food delivery!</p>
                        </div>
                        <Button label="Add Shipping Address" icon="pi pi-plus" severity="success" onClick={() => setShowAddressModal(true)} style={{ borderRadius: '8px' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                        <div style={styles.addressItem}>
                          <span style={styles.addressLabel}>Recipient Name</span>
                          <span style={styles.addressValue}>{profileData?.shippingAddress?.fullName}</span>
                        </div>
                        <div style={styles.addressItem}>
                          <span style={styles.addressLabel}>Contact Phone</span>
                          <span style={styles.addressValue}>{profileData?.shippingAddress?.phone}</span>
                        </div>
                        <div style={{ ...styles.addressItem, gridColumn: 'span 2' }}>
                          <span style={styles.addressLabel}>Address Details</span>
                          <span style={styles.addressValue}>{profileData?.shippingAddress?.addressLine1} {profileData?.shippingAddress?.addressLine2 && `, ${profileData.shippingAddress.addressLine2}`}</span>
                        </div>
                        <div style={styles.addressItem}>
                          <span style={styles.addressLabel}>City</span>
                          <span style={styles.addressValue}>{profileData?.shippingAddress?.city}</span>
                        </div>
                        <div style={styles.addressItem}>
                          <span style={styles.addressLabel}>State</span>
                          <span style={styles.addressValue}>{profileData?.shippingAddress?.state}</span>
                        </div>
                        <div style={styles.addressItem}>
                          <span style={styles.addressLabel}>ZIP / Postal Code</span>
                          <span style={styles.addressValue}>{profileData?.shippingAddress?.postalCode}</span>
                        </div>
                        <div style={styles.addressItem}>
                          <span style={styles.addressLabel}>Country</span>
                          <span style={styles.addressValue}>{profileData?.shippingAddress?.country}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Security actions panel */}
                  <div className="profile-security-sidebar" style={{ flex: '1 1 300px', borderLeft: '1px solid #f3f4f6', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>Security & Account</h3>
                    <Button label="Change Password" icon="pi pi-key" severity="success" outlined onClick={() => setShowPasswordModal(true)} style={{ borderRadius: '8px', width: '100%' }} />
                    <Button label="Delete Account" icon="pi pi-trash" severity="danger" text onClick={() => setShowDeleteModal(true)} style={{ borderRadius: '8px', width: '100%' }} />
                  </div>
                </div>
              )}

              {/* Panel 1: Order History */}
              {activeIndex === 1 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                      <i className="pi pi-shopping-cart" style={{ marginRight: '8px', color: '#15803d' }} /> Personal dining Orders
                    </div>

                    {orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <i className="pi pi-shopping-cart" style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '12px' }} />
                        <h4 style={{ color: '#475569', margin: 0, fontWeight: 700 }}>No orders placed yet</h4>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Your orders will appear here once you purchase gourmet dining credits.</p>
                      </div>
                    ) : (
                      <DataTable value={orders} loading={loadingOrders} paginator rows={5} rowsPerPageOptions={[5, 10, 20]} className="p-datatable-striped" responsiveLayout="scroll" style={{ fontSize: '13.5px' }}>
                        <Column header="ORDER ID" body={(rowData) => (
                          <PrimeTag 
                            value={`${rowData._id.substring(0, 8)}...`} 
                            severity="secondary" 
                            style={{ borderRadius: '6px', border: '1px solid #d1d5db', padding: '4px 8px', fontWeight: 600, color: '#374151', backgroundColor: '#f3f4f6' }} 
                          />
                        )} style={{ width: '120px' }} />
                        
                        <Column header="AMOUNT" body={(rowData) => (
                          <span style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '15px' }}>₹{rowData.totalAmount.toFixed(2)}</span>
                        )} style={{ width: '120px' }} />
                        
                        <Column header="PAYMENT" body={(rowData) => (
                          <PrimeTag 
                            value={rowData.paymentMethod ? rowData.paymentMethod.toUpperCase() : 'COD'} 
                            severity="warning" 
                            style={{ borderRadius: '6px', border: '1px dashed #f59e0b', padding: '4px 8px', fontWeight: 600 }} 
                          />
                        )} style={{ width: '120px' }} />
                        
                        <Column header="STATUS" body={(rowData) => {
                          const statusColors: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
                            'Pending': 'warning',
                            'Accepted': 'info',
                            'Preparing': 'info',
                            'Pickup': 'info',
                            'Out for Delivery': 'success',
                            'Shipped': 'success',
                            'Delivered': 'success',
                            'Cancelled': 'danger'
                          };
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <PrimeTag 
                                value={rowData.deliveryStatus} 
                                severity={statusColors[rowData.deliveryStatus] || 'secondary'} 
                                style={{ borderRadius: '6px', padding: '4px 8px', fontWeight: 600 }} 
                              />
                            </div>
                          );
                        }} style={{ width: '120px' }} />

                        <Column header="TRACK ORDER" body={(rowData) => {
                          if (rowData.deliveryStatus === 'Cancelled') return <span style={{ color: '#9ca3af' }}>-</span>;
                          return (
                            <Button 
                              icon="pi pi-map-marker" 
                              label="Track"
                              className="p-button-text p-button-success p-button-sm" 
                              style={{ padding: '4px 8px', height: 'auto', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }} 
                              tooltip="Track Order"
                              tooltipOptions={{ position: 'top' }}
                              onClick={() => showStatusModal(rowData)} 
                            />
                          );
                        }} style={{ width: '130px' }} />

                        <Column header="RATE PRODUCTS" body={(rowData) => {
                          if (rowData.deliveryStatus !== 'Delivered') return <span style={{ color: '#9ca3af' }}>-</span>;
                          if (rowData.isProductRated) {
                            return (
                              <Button 
                                icon="pi pi-check-circle" 
                                label="Rated"
                                className="p-button-text p-button-sm" 
                                disabled
                                style={{ padding: '4px 8px', height: 'auto', minWidth: 'auto', color: '#9ca3af', opacity: 0.6 }} 
                              />
                            );
                          }
                          return (
                            <Button 
                              icon="pi pi-star" 
                              label="Rate"
                              className="p-button-text p-button-warning p-button-sm" 
                              style={{ padding: '4px 8px', height: 'auto', minWidth: 'auto', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }} 
                              tooltip="Rate Products"
                              tooltipOptions={{ position: 'top' }}
                              onClick={() => openProductReviewModal(rowData)} 
                            />
                          );
                        }} style={{ width: '120px' }} />

                        <Column header="RATE DELIVERY" body={(rowData) => {
                          if (rowData.deliveryStatus !== 'Delivered') return <span style={{ color: '#9ca3af' }}>-</span>;
                          if (!rowData.deliveryExecutive) return <span style={{ color: '#9ca3af' }}>N/A</span>;
                          if (rowData.isDeliveryRated) {
                            return (
                              <Button 
                                icon="pi pi-check-circle" 
                                label="Rated"
                                className="p-button-text p-button-sm" 
                                disabled
                                style={{ padding: '4px 8px', height: 'auto', minWidth: 'auto', color: '#9ca3af', opacity: 0.6 }} 
                              />
                            );
                          }
                          return (
                            <Button 
                              icon="pi pi-truck" 
                              label="Rate"
                              className="p-button-text p-button-info p-button-sm" 
                              style={{ padding: '4px 8px', height: 'auto', minWidth: 'auto', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '4px' }} 
                              tooltip="Rate Delivery Partner"
                              tooltipOptions={{ position: 'top' }}
                              onClick={() => openDeliveryReviewModal(rowData)} 
                            />
                          );
                        }} style={{ width: '120px' }} />
                        
                        <Column header="ORDER DATE" body={(rowData) => (
                          <span style={{ color: '#4b5563', fontSize: '13px', fontWeight: 500 }}>{formatDate(rowData.createdAt)}</span>
                        )} style={{ width: '120px' }} />
                        
                        <Column header="ITEMS" body={(rowData) => (
                          <Button 
                            label={`View (${rowData.items?.length || 0})`}
                            icon="pi pi-eye" 
                            className="p-button-outlined p-button-success p-button-sm" 
                            style={{ borderRadius: '6px', fontWeight: 600, padding: '4px 12px' }} 
                            onClick={() => showModal(rowData)} 
                          />
                        )} style={{ width: '140px' }} />
                      </DataTable>
                    )}
                  </div>
                </div>
              )}

              {/* Panel 2: Gift Cards */}
              {activeIndex === 2 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Top Row: Actions */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Purchase Action Card */}
                    <div style={{ flex: '1 1 350px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#1f2937' }}>Prepaid Dining Gift Cards</h3>
                      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>Buy dining Gift Cards for yourself or send them directly to a friend's email address as a premium gift.</p>
                      <Button label="Buy Gift Card" icon="pi pi-credit-card" severity="success" onClick={() => setPurchaseModalOpen(true)} style={{ borderRadius: '8px' }} />
                    </div>

                    {/* Redeem Action Card */}
                    <div style={{ flex: '1 1 350px', border: '1px solid #b7eb8f', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#f0fdf4', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#166534' }}>Have a gift card code?</h3>
                      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#15803d', lineHeight: 1.4 }}>Redeem received gift card credentials instantly to top up your personal dining wallet balance.</p>
                      <Button label="Redeem Gift Card to Wallet" icon="pi pi-wallet" severity="success" onClick={() => setRedeemModalOpen(true)} style={{ borderRadius: '8px' }} />
                    </div>
                  </div>

                  {/* Bottom Row: Logs Table */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Personal Gift Cards Log</h4>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>
                        Total Balance: ₹{totalGiftCardBalance.toFixed(2)}
                      </div>
                    </div>
                    <DataTable value={myGiftCards} loading={loadingGiftCards} paginator rows={5} rowsPerPageOptions={[5, 10, 20]} className="p-datatable-striped" style={{ fontSize: '0.82rem' }}>
                      <Column header="GIFT CARD CODE" body={(r: IGiftCard) => <code style={{ cursor: 'pointer', color: '#15803d', fontWeight: 700, letterSpacing: '0.5px' }} onClick={() => handleCopyCode(r.code)}>{r.code}</code>} style={{ width: '180px' }} />
                      <Column header="REMAINING BALANCE" body={(r: IGiftCard) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{r.balance.toFixed(2)}</span>} style={{ width: '150px' }} />
                      <Column header="STATUS" body={(r: IGiftCard) => <PrimeTag severity={r.balance <= 0 ? 'danger' : 'success'} value={r.balance <= 0 ? 'Consumed' : 'Active'} style={{ borderRadius: '4px' }} />} style={{ width: '120px' }} />
                      <Column header="ISSUED ON" body={(r: IGiftCard) => formatDate(r.createdAt)} style={{ width: '140px' }} />
                    </DataTable>
                  </div>

                  {/* Purchase Gift Card Modal */}
                  <Dialog
                    header={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 'bold' }}><i className="pi pi-credit-card"></i><span>Purchase Dining Gift Card</span></div>}
                    visible={purchaseModalOpen}
                    style={{ width: '450px', borderRadius: '20px' }}
                    modal
                    onHide={() => setPurchaseModalOpen(false)}
                  >
                    <div style={{ padding: '0.5rem 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Select Denomination</label>
                          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                            <button type="button" onClick={() => { setSelectedPresetAmount(500); setCustomAmount(''); }} style={presetButtonStyle(500)}>₹500</button>
                            <button type="button" onClick={() => { setSelectedPresetAmount(1000); setCustomAmount(''); }} style={presetButtonStyle(1000)}>₹1,000</button>
                            <button type="button" onClick={() => { setSelectedPresetAmount(2000); setCustomAmount(''); }} style={presetButtonStyle(2000)}>₹2,000</button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Or Custom Value (₹)</label>
                          <InputText type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedPresetAmount(0); }} style={styles.formInput} placeholder="e.g. 750" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Recipient Email address *</label>
                          <InputText type="email" value={giftCardRecipientEmail} onChange={(e) => setGiftCardRecipientEmail(e.target.value)} style={styles.formInput} placeholder="friend@example.com" />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                          <Button label="Cancel" type="button" className="p-button-outlined p-button-secondary" style={{ color: '#595959', border: '1px solid #d9d9d9' }} onClick={() => setPurchaseModalOpen(false)} />
                          <Button label={purchasing ? "Processing Secure Gateway..." : "Buy Gift Card"} icon="pi pi-credit-card" severity="success" loading={purchasing} onClick={handlePurchaseGiftCard} />
                        </div>
                      </div>
                    </div>
                  </Dialog>
                </div>
              )}

              {/* Panel 3: Dynamic Coupons */}
              {activeIndex === 3 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, color: '#1f2937' }}>Available Coupon Codes Announcements</h3>
                  
                  {loadingCoupons ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}><i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#15803d' }} /></div>
                  ) : coupons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px', color: '#6b7280' }}>
                      <i className="pi pi-bell" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                      <div style={{ fontWeight: 600 }}>No promo codes running at this time</div>
                      <div style={{ fontSize: '0.85rem' }}>Check back soon for festive culinary announcements!</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {coupons.map((c) => (
                        <div key={c._id} style={{ border: '2px dashed #86efac', backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#86efac', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.6rem', fontWeight: 700, borderBottomLeftRadius: '8px' }}>ACTIVE</div>
                          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem', color: '#166534' }}>{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</h4>
                          <div style={{ fontSize: '0.85rem', color: '#15803d' }}>Minimum Order Required: <strong>₹{c.minOrderAmount}</strong></div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '0.5rem' }}>
                            <code style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>{c.code}</code>
                            <button
                              type="button"
                              style={{ backgroundColor: '#15803d', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                              onClick={() => handleCopyCode(c.code)}
                            >
                              COPY
                            </button>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 'auto' }}>Valid until: {formatDate(c.expiryDate)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Migrated Order Details modal */}
      {selectedOrder && (
        <Dialog
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <i className="pi pi-shopping-cart" />
              <span>Order Details - {selectedOrder._id}</span>
            </div>
          }
          visible={isModalVisible}
          onHide={() => { setIsModalVisible(false); setSelectedOrder(null); }}
          style={{ width: '700px', maxWidth: '95vw' }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button label="Close" onClick={() => { setIsModalVisible(false); setSelectedOrder(null); }} className="p-button-outlined p-button-secondary" style={{ color: '#595959', border: '1px solid #d9d9d9' }} />
              <Button label="Download Invoice" icon="pi pi-download" loading={isDownloading} onClick={handleDownloadReceipt} style={{ backgroundColor: '#15803d', borderColor: '#15803d', color: 'white' }} />
            </div>
          }
        >
          <div style={{ padding: '8px 0' }}>
            <div style={{ marginBottom: '24px', border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Customer</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959' }}>{selectedOrder.user?.name || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Email</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959' }}>{selectedOrder.user?.email || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Order Date</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959' }}>{formatDate(selectedOrder.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Status</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959' }}>
                  {(() => {
                    const statusColors: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
                      'Pending': 'warning',
                      'Accepted': 'info',
                      'Preparing': 'info',
                      'Pickup': 'info',
                      'Out for Delivery': 'success',
                      'Shipped': 'success',
                      'Delivered': 'success',
                      'Cancelled': 'danger'
                    };
                    return (
                      <PrimeTag 
                        value={selectedOrder.deliveryStatus} 
                        severity={statusColors[selectedOrder.deliveryStatus] || 'secondary'} 
                        style={{ borderRadius: '6px', padding: '4px 8px', fontWeight: 600 }} 
                      />
                    );
                  })()}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Total Amount</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₹{selectedOrder.totalAmount.toFixed(2)}</div>
              </div>
            </div>

            <h5 style={{ color: '#15803d', marginBottom: 12, fontSize: '1.1rem', fontWeight: 'bold' }}>Items List</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {selectedOrder.items?.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f3f4f6', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    <div>
                      <h5 style={{ margin: 0, fontWeight: 700 }}>{item.name}</h5>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#15803d' }}>₹{((item.discount_price || item.original_price) * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* PDF hidden invoice container */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
              <div ref={receiptContentRef} style={{ width: '320px', padding: '20px', fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', color: '#000', backgroundColor: '#fff' }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>TastyHub</h3>
                  <p style={{ margin: 0, fontSize: '11px' }}>1-23 Gourmet Plaza, Gachibowli, Hyderabad</p>
                  <p style={{ margin: 0, fontSize: '11px' }}>www.TastyHub.com</p>
                </div>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <p style={{ margin: '2px 0' }}><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p style={{ margin: '2px 0' }}><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                <p style={{ margin: '2px 0' }}><strong>Customer:</strong> {selectedOrder.user?.name}</p>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <table style={{ width: '100%', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>ITEM</th>
                      <th style={{ textAlign: 'center' }}>QTY</th>
                      <th style={{ textAlign: 'right' }}>PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'left' }}>{item.name}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{(item.discount_price || item.original_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: 'bold' }}><strong>TOTAL:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <p style={{ margin: 0 }}>Thank you for dining with TastyHub!</p>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Tracker Status modal */}
      {selectedOrderForStatus && (
        <Dialog
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <i className="pi pi-truck" />
              <span>Order Delivery Progress</span>
            </div>
          }
          visible={isStatusModalVisible}
          onHide={() => { setIsStatusModalVisible(false); setSelectedOrderForStatus(null); }}
          style={{ width: '850px', maxWidth: '95vw' }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button label="Close" onClick={() => { setIsStatusModalVisible(false); setSelectedOrderForStatus(null); }} className="p-button-outlined p-button-secondary" style={{ color: '#595959', border: '1px solid #d9d9d9' }} />
            </div>
          }
        >
          <OrderStatusTracker currentStatus={selectedOrderForStatus.deliveryStatus} />
        </Dialog>
      )}

      {/* Address Edit Dialog Modal */}
      <Dialog visible={showAddressModal} onHide={() => setShowAddressModal(false)} header={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}><i className="pi pi-map-marker" style={{ color: '#15803d', fontSize: '1.2rem' }}></i><span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937' }}>Configure Delivery Address</span></div>} style={{ width: '540px', maxWidth: '95vw', borderRadius: '12px' }} modal>
        <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Recipient Name *</label><InputText value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} required style={styles.formInput} placeholder="e.g. Hari Krishna" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Contact Phone *</label><InputText value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required style={styles.formInput} placeholder="e.g. +91 9876543210" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Address Line 1 *</label><InputText value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} required style={styles.formInput} placeholder="Door No, Street Name, Locality" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Address Line 2 (Optional)</label><InputText value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} style={styles.formInput} placeholder="Apartment, landmark" /></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>City *</label><InputText value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required style={styles.formInput} /></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>State *</label><InputText value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required style={styles.formInput} /></div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Postal Code *</label><InputText value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} required style={styles.formInput} /></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Country *</label><InputText value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} required style={styles.formInput} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <Button type="button" label="Cancel" severity="secondary" outlined onClick={() => setShowAddressModal(false)} />
            <Button type="submit" label="Save Address" severity="success" loading={actionLoading} />
          </div>
        </form>
      </Dialog>

      {/* Password Change Dialog Modal */}
      <Dialog visible={showPasswordModal} onHide={() => setShowPasswordModal(false)} header={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}><i className="pi pi-key" style={{ color: '#15803d', fontSize: '1.2rem' }}></i><span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937' }}>Update Account Password</span></div>} style={{ width: '440px', maxWidth: '95vw', borderRadius: '12px' }} modal>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Current Password *</label><InputText type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={styles.formInput} placeholder="••••••••" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Password *</label><InputText type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={styles.formInput} placeholder="••••••••" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Confirm New Password *</label><InputText type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={styles.formInput} placeholder="••••••••" /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <Button type="button" label="Cancel" severity="secondary" outlined onClick={() => setShowPasswordModal(false)} />
            <Button type="submit" label="Update Password" severity="success" loading={actionLoading} />
          </div>
        </form>
      </Dialog>

      {/* Delete Account Dialog Modal */}
      <Dialog visible={showDeleteModal} onHide={() => setShowDeleteModal(false)} header={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}><i className="pi pi-exclamation-triangle" style={{ color: '#ef4444', fontSize: '1.2rem' }}></i><span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ef4444' }}>Danger: Delete Account</span></div>} style={{ width: '440px', maxWidth: '95vw', borderRadius: '12px' }} modal>
        <form onSubmit={handleDeleteAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '1rem', color: '#991b1b', fontSize: '0.82rem', lineHeight: '1.5' }}>
            <strong>Warning: This action is permanent!</strong> Deleting your account will erase all order history, favorites, gift card balances, and credentials.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Confirm Password *</label><InputText type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required style={styles.formInput} placeholder="Enter password to confirm" /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <Button type="button" label="Cancel" severity="secondary" outlined onClick={() => setShowDeleteModal(false)} />
            <Button type="submit" label="Permanently Delete" severity="danger" loading={actionLoading} />
          </div>
        </form>
      </Dialog>

      {/* Redeem Card Dialog Modal */}
      <Dialog visible={redeemModalOpen} onHide={() => setRedeemModalOpen(false)} header={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}><i className="pi pi-wallet" style={{ color: '#15803d', fontSize: '1.2rem' }}></i><span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937' }}>Redeem Gift Card to Wallet</span></div>} style={{ width: '400px', maxWidth: '95vw', borderRadius: '12px' }} modal>
        <form onSubmit={handleRedeemGiftCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enter Gift Card Code *</label><InputText value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} required style={styles.formInput} placeholder="e.g. GIFT-XXXX-YYYY" /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <Button type="button" label="Cancel" severity="secondary" outlined onClick={() => setRedeemModalOpen(false)} />
            <Button type="submit" label="Redeem Now" severity="success" loading={redeeming} />
          </div>
        </form>
      </Dialog>

      {/* Rate Products Dialog Modal */}
      {selectedOrderForReview && isProductReviewVisible && (
        <Dialog 
          visible={isProductReviewVisible} 
          onHide={() => { setIsProductReviewVisible(false); setSelectedOrderForReview(null); }} 
          header={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}><i className="pi pi-star" style={{ color: '#eab308', fontSize: '1.2rem' }}></i><span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937' }}>Rate Order Products</span></div>} 
          style={{ width: '550px', maxWidth: '95vw', borderRadius: '12px' }} 
          modal
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Please share your feedback for each item in your order:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.keys(productReviews).map((productId) => {
                const item = productReviews[productId];
                return (
                  <div key={productId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{item.name}</h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Your Rating:</span>
                      <Rating 
                        value={item.rating} 
                        onChange={(e) => {
                          setProductReviews(prev => ({
                            ...prev,
                            [productId]: { ...prev[productId], rating: e.value || 5 }
                          }));
                        }} 
                        cancel={false} 
                        stars={5} 
                        style={{ color: '#f59e0b', fontSize: '18px' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Review Description</label>
                      <textarea
                        value={item.review}
                        onChange={(e) => {
                          setProductReviews(prev => ({
                            ...prev,
                            [productId]: { ...prev[productId], review: e.target.value }
                          }));
                        }}
                        placeholder="e.g. Delicious and cooked to perfection!"
                        style={{ ...styles.formInput, resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
              <Button type="button" label="Cancel" severity="secondary" outlined onClick={() => { setIsProductReviewVisible(false); setSelectedOrderForReview(null); }} />
              <Button type="button" label="Submit Reviews" severity="success" loading={submittingReview} onClick={submitProductReviews} />
            </div>
          </div>
        </Dialog>
      )}

      {/* Rate Delivery Partner Dialog Modal */}
      {selectedOrderForReview && isDeliveryReviewVisible && (
        <Dialog 
          visible={isDeliveryReviewVisible} 
          onHide={() => { setIsDeliveryReviewVisible(false); setSelectedOrderForReview(null); }} 
          header={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}><i className="pi pi-truck" style={{ color: '#3b82f6', fontSize: '1.2rem' }}></i><span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937' }}>Rate Delivery Partner</span></div>} 
          style={{ width: '450px', maxWidth: '95vw', borderRadius: '12px' }} 
          modal
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ backgroundColor: '#3b82f6', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                <i className="pi pi-user"></i>
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#1e3a8a' }}>
                  {typeof selectedOrderForReview.deliveryExecutive === 'object'
                    ? selectedOrderForReview.deliveryExecutive.name
                    : 'Delivery Executive'}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>TastyHub Delivery Partner</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563' }}>How was your delivery service?</label>
              <Rating 
                value={deliveryRating} 
                onChange={(e) => setDeliveryRating(e.value || 5)} 
                cancel={false} 
                stars={5} 
                style={{ color: '#f59e0b', fontSize: '24px' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Feedback Description</label>
              <textarea
                value={deliveryFeedback}
                onChange={(e) => setDeliveryFeedback(e.target.value)}
                placeholder="e.g. Prompt delivery, food arrived hot and friendly rider!"
                style={{ ...styles.formInput, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <Button type="button" label="Cancel" severity="secondary" outlined onClick={() => { setIsDeliveryReviewVisible(false); setSelectedOrderForReview(null); }} />
              <Button type="button" label="Submit Feedback" severity="success" loading={submittingReview} onClick={submitDeliveryReview} />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

const styles = {
  addressItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #f3f4f6',
    padding: '0.85rem 1rem',
    borderRadius: '10px'
  },
  addressLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.25px'
  },
  addressValue: {
    fontSize: '0.88rem',
    color: '#374151',
    fontWeight: 600
  },
  formInput: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%'
  }
};

export default ProfilePage;
