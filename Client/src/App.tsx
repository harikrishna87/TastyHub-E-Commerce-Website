import React, { useContext, useRef, useEffect } from 'react'
import './App.css'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import Home from "./Pages/Customer/Home"
import Store from "./Pages/Customer/Store"
import FoodNavbar from './Components/FoodNavbar'
import Contact from './Pages/Customer/Contact'
import FoodFooter from './Components/FoodFooter'
import PrivacyPolicy from './Pages/Customer/PrivacyPolicy'
import TermsOfService from './Pages/Customer/TermsOfService'
import { AuthProvider, AuthContext } from './context/AuthContext'
import AuthPage from './Pages/Customer/UserAuth'

import ProtectedRoute from './Components/ProtectedRoute'
import ProductsPage from './Pages/Admin/ProductsPage'
import FAQ from './Pages/Customer/FAQ'
import NewArrivals from './Pages/Customer/NewArrivals'
import DealsDiscounts from './Pages/Customer/DealsDiscounts'
import GiftCards from './Pages/Customer/GiftCards'
import ShoppingInfo from './Pages/Customer/ShoppingInfo'
import ReturnsExchanges from './Pages/Customer/ReturnsExchanges'
import PaymentOverview from './Pages/Admin/PaymentOverview'
import OrderManagement from './Pages/Admin/OrderManagement'
import OrderAnalytics from './Pages/Admin/OrderAnalytics'
import ProfilePage from './Pages/Customer/ProfilePage'
import CheckoutPage from './Pages/Customer/CheckoutPage'
import GoogleCallback from './Components/GoogleCallback'
import AdminLayout from './Components/AdminLayout'
import DeliveryManagement from './Pages/Admin/DeliveryManagement'
import CouponsManagement from './Pages/Admin/CouponsManagement'
import RestaurantsManagement from './Pages/Admin/RestaurantsManagement'
import ComboDealsManagement from './Pages/Admin/ComboDealsManagement'
import GiftCardsManagement from './Pages/Admin/GiftCardsManagement'
import CartPage from './Pages/Customer/CartPage'
import CustomersManagement from './Pages/Admin/CustomersManagement'
import DeliveryAuth from './Pages/Delivery/DeliveryAuth'
import DeliveryDashboard from './Pages/Delivery/DeliveryDashboard'
import DeliveryLandingPage from './Pages/Delivery/DeliveryLandingPage'
import ComboDeals from './Pages/Customer/ComboDeals'
import AdminAuth from './Pages/Admin/AdminAuth'

const AppContent: React.FC = () => {
  const auth = useContext(AuthContext)
  const location = useLocation()

  const isDeliveryRoute =
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/deivery')

  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthRoute = location.pathname.includes('/auth')

  if (auth?.isAuthenticated && auth.user?.role === 'admin') {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin/home" element={<OrderAnalytics />} />
          <Route path="/admin/orderanalytics" element={<Navigate to="/admin/home" replace />} />
          <Route path='/admin/productspage' element={<ProductsPage />} />
          <Route path='/admin/paymentoverview' element={<PaymentOverview />} />
          <Route path='/admin/ordermanagement' element={<OrderManagement />} />
          <Route path='/admin/customers' element={<CustomersManagement />} />
          <Route path='/admin/delivery' element={<DeliveryManagement />} />
          <Route path='/admin/coupons' element={<CouponsManagement />} />
          <Route path='/admin/restaurants' element={<RestaurantsManagement />} />
          <Route path='/admin/combodeals' element={<ComboDealsManagement />} />
          <Route path='/admin/giftcards' element={<GiftCardsManagement />} />
          <Route path='/admin/profilepage' element={<ProfilePage />} />
          <Route path='/auth/callback' element={<GoogleCallback />} />
          <Route path="*" element={<Navigate to="/admin/home" replace />} />
        </Routes>
      </AdminLayout>
    )
  }

  // Delivery Executive Layout (screens are full height and width, completely clean of customer headers/footers)
  if (auth?.isAuthenticated && auth.user?.role === 'delivery_executive') {
    return (
      <Routes>
        <Route path="/delivery/home" element={<DeliveryDashboard />} />
        <Route path="/delivery/dashboard" element={<Navigate to="/delivery/home" replace />} />
        <Route path='/auth/callback' element={<GoogleCallback />} />
        <Route path="*" element={<Navigate to="/delivery/home" replace />} />
      </Routes>
    )
  }

  return (
    <>
      {!isDeliveryRoute && !isAdminRoute && !isAuthRoute && <FoodNavbar />}
      <div
        className={isDeliveryRoute || isAdminRoute || isAuthRoute ? "" : "customer-content-wrapper"}
        style={
          isDeliveryRoute || isAdminRoute || isAuthRoute
            ? {}
            : { margin: '30px', width: 'auto' }
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/user/home" replace />} />
          <Route path="/home" element={<Navigate to="/user/home" replace />} />
          <Route path="/user/home" element={<Home />} />
          <Route path="/user/menu-items" element={<Store />} />
          <Route path="/menu-items" element={<Navigate to="/user/menu-items" replace />} />
          <Route path="/user/contact" element={<Contact />} />
          <Route path="/contact" element={<Navigate to="/user/contact" replace />} />
          <Route path='/user/profilepage' element={<ProfilePage />} />
          <Route path='/profilepage' element={<Navigate to="/user/profilepage" replace />} />
          <Route path="/user/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<Navigate to="/user/privacy" replace />} />
          <Route path='/user/faq' element={<FAQ />} />
          <Route path='/faq' element={<Navigate to="/user/faq" replace />} />
          <Route path='/user/cart' element={<CartPage />} />
          <Route path='/cart' element={<Navigate to="/user/cart" replace />} />
          <Route path='/user/checkout' element={<CheckoutPage />} />
          <Route path='/checkout' element={<Navigate to="/user/checkout" replace />} />
          <Route path='/user/newarrivals' element={<NewArrivals />} />
          <Route path='/newarrivals' element={<Navigate to="/user/newarrivals" replace />} />
          <Route path='/user/dealsdiscount' element={<DealsDiscounts />} />
          <Route path='/dealsdiscount' element={<Navigate to="/user/dealsdiscount" replace />} />
          <Route path='/user/giftcards' element={<GiftCards />} />
          <Route path='/giftcards' element={<Navigate to="/user/giftcards" replace />} />
          <Route path='/user/combodeals' element={<ComboDeals />} />
          <Route path='/combodeals' element={<Navigate to="/user/combodeals" replace />} />
          <Route path='/user/shoppinginfo' element={<ShoppingInfo />} />
          <Route path='/shoppinginfo' element={<Navigate to="/user/shoppinginfo" replace />} />
          <Route path='/user/returnexchanges' element={<ReturnsExchanges />} />
          <Route path='/returnexchanges' element={<Navigate to="/user/returnexchanges" replace />} />
          <Route path='/user/terms' element={<TermsOfService />} />
          <Route path='/terms' element={<Navigate to="/user/terms" replace />} />
          <Route path='/user/auth' element={<AuthPage />} />
          <Route path='/auth' element={<Navigate to="/user/auth" replace />} />
          <Route path='/auth/callback' element={<GoogleCallback />} />
          <Route path='/delivery' element={<DeliveryLandingPage />} />
          <Route path='/deivery' element={<DeliveryLandingPage />} />
          <Route path='/delivery/auth' element={<DeliveryAuth />} />
          <Route path='/admin/auth' element={<AdminAuth />} />

          <Route element={<ProtectedRoute allowedRoles={['delivery_executive']} />}>
            <Route path="/delivery/home" element={<DeliveryDashboard />} />
            <Route path="/delivery/dashboard" element={<Navigate to="/delivery/home" replace />} />
          </Route>

          <Route path="/admin/home" element={<Navigate to="/user/home" replace />} />
          <Route path="/admin/orderanalytics" element={<Navigate to="/user/home" replace />} />
        </Routes>
      </div>
      {!isDeliveryRoute && !isAuthRoute && <FoodFooter />}
    </>
  )
}

function App() {
  const globalToastRef = useRef<Toast>(null)

  useEffect(() => {
    (window as any).showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
      globalToastRef.current?.show({ severity, summary, detail, life: 3500 })
    }
    return () => {
      delete (window as any).showToast
    }
  }, [])

  return (
    <AuthProvider>
      <Toast ref={globalToastRef} />
      <AppContent />
    </AuthProvider>
  )
}

export default App
