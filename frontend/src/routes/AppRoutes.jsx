import React from 'react';
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

// User Pages
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import SearchFlights from "../pages/SearchFlights.jsx";
import FlightDetails from "../pages/FlightDetails.jsx";
import PassengerDetails from "../pages/PassengerDetails.jsx";
import Payment from "../pages/Payment.jsx";
import BookingConfirmation from "../pages/BookingConfirmation.jsx"; // இம்போர்ட் சேர்க்கப்பட்டது
import Profile from "../pages/Profile.jsx";
import MyBookings from "../pages/MyBookings.jsx";
import NotFound from "../pages/NotFound.jsx";

// Admin Pages
import Dashboard from "../admin/Dashboard.jsx";
import ManageFlights from "../admin/ManageFlights.jsx";
import ManageBookings from "../admin/ManageBookings.jsx";
import Users from "../admin/Users.jsx";
import AddFlight from "../admin/AddFlight.jsx";
import EditFlight from "../admin/EditFlight.jsx";

// Route Protection
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminRoute from "../components/AdminRoute.jsx";


function AppRoutes() {
  return (
    <Routes>
      {/* User-facing pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search-flights" element={<SearchFlights />} />
        <Route path="/flight-details/:id" element={<FlightDetails />} />
        
        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/passenger-details/:id" element={<PassengerDetails />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/manage-flights" element={<ManageFlights />} />
          <Route path="/admin/manage-bookings" element={<ManageBookings />} />
          <Route path="/admin/manage-users" element={<Users />} />
          <Route path="/admin/add-flight" element={<AddFlight />} />
          <Route path="/admin/edit-flight/:id" element={<EditFlight />} />
        </Route>
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;