import { Routes, Route } from 'react-router-dom';

// Layouts (src/layouts/)
import AdminLayout from './layouts/AdminLayout';

// Route Protection (src/components/)
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FlyingPlane from './components/FlyingPlane'; // பறக்கும் விமான காம்போனன்ட்

// Core Pages (src/pages/)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchFlights from './pages/SearchFlights';
import ForgotPassword from './pages/ForgotPassword';
import FlightDetails from './pages/FlightDetails';
import BookingPage from './pages/BookingPage';
import PassengerDetails from './pages/PassengerDetails';
import BookingReview from './pages/BookingReview';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Admin Pages (src/admin/)
import Dashboard from './admin/Dashboard';
import ManageFlights from './admin/ManageFlights';
import ManageBookings from './admin/ManageBookings';
import Users from './admin/Users';
import FlightForm from './admin/FlightForm';

function AppRouter() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 via-sky-300 to-blue-500 text-slate-900 relative overflow-hidden">
      {/* சினிமாட்டிக் பறக்கும் விமானம் அனைத்துப் பக்கங்களிலும் தொடர்ந்து வர */}
      <FlyingPlane />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected User Routes (Home -> Search -> Details -> Booking -> Payment -> My Bookings) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/search-flights" element={<SearchFlights />} />
          <Route path="/flight-details/:id" element={<FlightDetails />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/passenger-details" element={<PassengerDetails />} />
          <Route path="/booking-review" element={<BookingReview />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes with AdminLayout */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/manage-flights" element={<ManageFlights />} />
            <Route path="/admin/add-flight" element={<FlightForm />} />
            <Route path="/admin/edit-flight/:id" element={<FlightForm />} />
            <Route path="/admin/manage-bookings" element={<ManageBookings />} />
            <Route path="/admin/manage-users" element={<Users />} />
          </Route>
        </Route>

        {/* Global Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default AppRouter;