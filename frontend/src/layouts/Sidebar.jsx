import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaPlane, FaBook, FaUsers } from 'react-icons/fa';

function Sidebar() {
  const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-indigo-accent hover:text-white transition-colors";
  const activeLinkClasses = "bg-indigo-accent text-white";

  return (
    <aside className="w-64 bg-indigo-blue text-white flex flex-col">
      <div className="p-4 border-b border-blue-800">
        <h2 className="text-2xl font-bold text-center">Admin Panel</h2>
      </div>
      <nav className="grow pt-4">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          <FaTachometerAlt className="mr-3" /> Dashboard
        </NavLink>
        <NavLink to="/admin/manage-flights" className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
          <FaPlane className="mr-3" /> Manage Flights
        </NavLink>
        <NavLink to="/admin/manage-bookings" className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
          <FaBook className="mr-3" /> Manage Bookings
        </NavLink>
        <NavLink to="/admin/manage-users" className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
          <FaUsers className="mr-3" /> Manage Users
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;