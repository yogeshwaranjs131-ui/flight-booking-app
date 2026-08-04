import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-indigo-blue shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          IndiGo
        </Link>
        <div className="flex items-center space-x-4">
          <NavLink to="/" className="text-white hover:text-gray-300">Home</NavLink>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <NavLink to="/admin/dashboard" className="text-white hover:text-gray-300">Admin Dashboard</NavLink>
              )}
              <NavLink to="/my-bookings" className="text-white hover:text-gray-300">My Bookings</NavLink>
              <NavLink to="/profile" className="text-white hover:text-gray-300">Profile</NavLink>
              <button onClick={logout} className="bg-indigo-accent text-white px-4 py-2 rounded hover:bg-pink-700">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-white hover:text-gray-300">Login</NavLink>
              <NavLink to="/register" className="bg-white text-indigo-blue px-4 py-2 rounded hover:bg-gray-200">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;