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
import AuthPage from './Pages/Auth'

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
import OrderSuccessPage from './Pages/Customer/OrderSuccessPage'
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
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        <Route path='/auth/callback' element={<GoogleCallback />} />
        <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
      </Routes>
    )
  }

  return (
    <>
      {!isDeliveryRoute && <FoodNavbar />}
      <div
        style={
          isDeliveryRoute
            ? {}
            : { margin: '30px', width: 'auto' }
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu-items" element={<Store />} />
          <Route path="/contact" element={<Contact />} />
          <Route path='/profilepage' element={<ProfilePage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path='/faq' element={<FAQ />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/checkout' element={<CheckoutPage />} />
          <Route path="/ordersuccess/:orderId" element={<OrderSuccessPage />} />
          <Route path='/newarrivals' element={<NewArrivals />} />
          <Route path='/dealsdiscount' element={<DealsDiscounts />} />
          <Route path='/giftcards' element={<GiftCards />} />
          <Route path='/combodeals' element={<ComboDeals />} />
          <Route path='/shoppinginfo' element={<ShoppingInfo />} />
          <Route path='/returnexchanges' element={<ReturnsExchanges />} />
          <Route path='/terms' element={<TermsOfService />} />
          <Route path='/auth' element={<AuthPage />} />
          <Route path='/auth/callback' element={<GoogleCallback />} />
          <Route path='/delivery' element={<DeliveryLandingPage />} />
          <Route path='/deivery' element={<DeliveryLandingPage />} />
          <Route path='/delivery/auth' element={<DeliveryAuth />} />
          <Route path='/admin/auth' element={<AdminAuth />} />

          <Route element={<ProtectedRoute allowedRoles={['delivery_executive']} />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          </Route>

          <Route path="/admin/orderanalytics" element={<Navigate to="/" replace />} />
        </Routes>
        {!isDeliveryRoute && <FoodFooter />}
      </div>
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
