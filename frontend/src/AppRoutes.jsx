import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts (src/layouts/)
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Protection (src/components/)
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Core Pages (src/pages/)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchFlights from './pages/SearchFlights';
import ForgotPassword from './pages/ForgotPassword';
import FlightDetails from './pages/FlightDetails';
import BookingPage from './pages/BookingPage'; // <-- 1. Added BookingPage import
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
    <Routes>
      {/* Public & Protected Routes inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/search-flights" element={<SearchFlights />} />
        <Route path="/flight-details/:id" element={<FlightDetails />} />
        <Route path="/book/:id" element={<BookingPage />} /> {/* <-- 2. Added BookingPage route */}
        
        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/passenger-details" element={<PassengerDetails />} />
          <Route path="/booking-review" element={<BookingReview />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Routes with AdminRoute & AdminLayout */}
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
  );
}

export default AppRouter;