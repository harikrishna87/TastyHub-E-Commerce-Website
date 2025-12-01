import React, { useContext } from 'react'
import { Container } from 'react-bootstrap'
import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from "./Pages/Home"
import Store from "./Pages/Store"
import FoodNavbar from './Components/FoodNavbar'
import Contact from './Pages/Contact'
import FoodFooter from './Components/FoodFooter'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsOfService from './Pages/TermsOfService'
import { AuthProvider, AuthContext } from './context/AuthContext'
import AuthPage from './Pages/Auth'
// import AdminDashboard from './Pages/OrderAnalytics'
import UserOrders from './Pages/UserOrders'
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
import OrderSuccessPage from './Pages/OrderSuccessPage'

const AppContent: React.FC = () => {
  const auth = useContext(AuthContext)

  if (auth?.isAuthenticated && auth.user?.role === 'admin') {
    return (
      <>
        <FoodNavbar/>
        <Container className='mb-4 mt-4'>
          <Routes>
            <Route path="/admin/orderanalytics" element={<OrderAnalytics />} />
            <Route path='/admin/productspage' element={<ProductsPage/>}/>
            <Route path='/admin/paymentoverview' element={<PaymentOverview/>}/>
            <Route path='/admin/ordermanagement' element={<OrderManagement/>}/>
            <Route path='/admin/profilepage' element={<ProfilePage/>} />
            <Route path="*" element={<Navigate to="/admin/orderanalytics" replace />} />
          </Routes>
        </Container>
        <FoodFooter/>
      </>
    )
  }

  return (
    <>
      <FoodNavbar/>
      <Container className='mb-4 mt-4'>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/menu-items" element={<Store/>} />
          <Route path="/contact" element={<Contact/>}/>
          <Route path='/profilepage' element={<ProfilePage/>} />
          <Route path="/privacy" element={<PrivacyPolicy/>} />
          <Route path='/faq' element={<FAQ/>}/>
          <Route path='/checkout' element={<CheckoutPage/>}/>
          <Route path="/ordersuccess/:orderId" element={<OrderSuccessPage />} />
          <Route path='/newarrivals' element={<NewArrivals/>}/>
          <Route path='/dealsdiscount' element={<DealsDiscounts/>}/>
          <Route path='/giftcards' element={<GiftCards/>}/>
          <Route path='/shoppinginfo' element={<ShoppingInfo/>} />
          <Route path='/returnexchanges' element={<ReturnsExchanges/>} />
          <Route path='/terms' element={<TermsOfService/>} />
          <Route path='/auth' element={<AuthPage/>} />
          
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/my-orders" element={<UserOrders />} />
          </Route>
          
          <Route path="/admin/orderanalytics" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <FoodFooter/>
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