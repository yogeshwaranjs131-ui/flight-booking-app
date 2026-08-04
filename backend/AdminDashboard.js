import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaPlane, FaUsers, FaBook } from 'react-icons/fa';

function AdminDashboard() {
  const location = useLocation();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'
    }`;

  const DashboardHome = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800">Welcome to the Admin Dashboard</h2>
      <p className="mt-2 text-gray-600">Select an option from the sidebar to manage flights, users, or bookings.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex-col hidden md:flex">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="grow p-4 space-y-2">
          <NavLink to="/admin/dashboard" end className={navLinkClasses}>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/dashboard/manage-flights" className={navLinkClasses}>
            <FaPlane />
            <span>Manage Flights</span>
          </NavLink>
          {/* எதிர்காலத்தில் சேர்க்க வேண்டிய மற்ற இணைப்புகள் */}
          {/* <NavLink to="/admin/manage-users" className={navLinkClasses}><FaUsers /><span>Manage Users</span></NavLink> */}
          {/* <NavLink to="/admin/view-bookings" className={navLinkClasses}><FaBook /><span>View Bookings</span></NavLink> */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {location.pathname === '/admin/dashboard' ? <DashboardHome /> : <Outlet />}
      </main>
    </div>
  );
}

export default AdminDashboard;