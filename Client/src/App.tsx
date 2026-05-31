import React, { useContext } from 'react'
import './App.css'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Home from "./Pages/Home"
import Store from "./Pages/Store"
import FoodNavbar from './Components/FoodNavbar'
import Contact from './Pages/Contact'
import FoodFooter from './Components/FoodFooter'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsOfService from './Pages/TermsOfService'
import { AuthProvider, AuthContext } from './context/AuthContext'
import AuthPage from './Pages/Auth'

import ProtectedRoute from './Components/ProtectedRoute'
import ProductsPage from './Pages/ProductsPage'
import FAQ from './Pages/FAQ'
import NewArrivals from './Pages/NewArrivals'
import DealsDiscounts from './Pages/DealsDiscounts'
import GiftCards from './Pages/GiftCards'
import ShoppingInfo from './Pages/ShoppingInfo'
import ReturnsExchanges from './Pages/ReturnsExchanges'
import PaymentOverview from './Pages/PaymentOverview'
import OrderManagement from './Pages/OrderManagement'
import OrderAnalytics from './Pages/OrderAnalytics'
import ProfilePage from './Pages/ProfilePage'
import CheckoutPage from './Pages/CheckoutPage'
import OrderSuccessPage from '././Pages/OrderSuccessPage'
import GoogleCallback from '../src/Components/GoogleCallback'
import AdminLayout from './Components/AdminLayout'
import DeliveryManagement from './Pages/DeliveryManagement'
import CouponsManagement from './Pages/CouponsManagement'
import ComboDealsManagement from './Pages/ComboDealsManagement'
import GiftCardsManagement from './Pages/GiftCardsManagement'
import CartPage from './Pages/CartPage'
import CustomersManagement from './Pages/CustomersManagement'
import DeliveryAuth from './Pages/DeliveryAuth'
import DeliveryDashboard from './Pages/DeliveryDashboard'
import DeliveryLandingPage from './Pages/DeliveryLandingPage'
import ComboDeals from './Pages/ComboDeals'

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

          <Route element={<ProtectedRoute allowedRoles={['delivery_executive']} />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          </Route>

          <Route path="/admin/orderanalytics" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isDeliveryRoute && <FoodFooter />}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
