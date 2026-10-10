import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Hotels from './pages/Hotels'
import HotelDetails from './pages/HotelDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Workspace from './pages/Workspace'
import NotFound from './pages/NotFound'

// Manager Pages
import MyHotel from './pages/manager/MyHotel'
import Venues from './pages/manager/Venues'
import Packages from './pages/manager/Packages'
import Pricing from './pages/manager/Pricing'
import Availability from './pages/manager/Availability'
import ManagerReservations from './pages/manager/Reservations'
import Reviews from './pages/manager/Reviews'
import Reports from './pages/manager/Reports'
import Notifications from './pages/manager/Notifications'
import Profile from './pages/manager/Profile'

// Admin Pages
import HotelVerification from './pages/admin/HotelVerification'

// Customer Pages
import CustomerOverview from './pages/customer/Overview'
import CustomerReservations from './pages/customer/Reservations'
import CustomerReviews from './pages/customer/Reviews'
import CustomerProfile from './pages/customer/Profile'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:hotelId" element={<HotelDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerOverview />} />
        <Route path="/customer/reservations" element={<CustomerReservations />} />
        <Route path="/customer/reviews" element={<CustomerReviews />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/*" element={<Workspace role="customer" />} />
        
        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={<Workspace role="manager" />} />
        <Route path="/manager/hotel" element={<MyHotel />} />
        <Route path="/manager/venues" element={<Venues />} />
        <Route path="/manager/packages" element={<Packages />} />
        <Route path="/manager/pricing" element={<Pricing />} />
        <Route path="/manager/availability" element={<Availability />} />
        <Route path="/manager/reservations" element={<ManagerReservations />} />
        <Route path="/manager/reviews" element={<Reviews />} />
        <Route path="/manager/reports" element={<Reports />} />
        <Route path="/manager/notifications" element={<Notifications />} />
        <Route path="/manager/profile" element={<Profile />} />
        <Route path="/manager/*" element={<Workspace role="manager" />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Workspace role="admin" />} />
        <Route path="/admin/hotels" element={<Workspace role="admin" adminPage="hotels" />} />
        <Route path="/admin/verification" element={<Workspace role="admin" adminPage="hotels" />} />
        <Route path="/admin/all-hotels" element={<Workspace role="admin" adminPage="all-hotels" />} />
        <Route path="/admin/users" element={<Workspace role="admin" adminPage="users" />} />
        <Route path="/admin/reservations" element={<Workspace role="admin" adminPage="reservations" />} />
        <Route path="/admin/reports" element={<Workspace role="admin" adminPage="reports" />} />
        <Route path="/admin/*" element={<Workspace role="admin" />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
