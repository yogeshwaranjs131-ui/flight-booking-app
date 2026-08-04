import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaPlane, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-600 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/" className="flex items-center text-indigo-blue text-2xl font-bold">
              <FaPlane className="mr-2" />
              IndiGo
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-blue'}`}>Home</NavLink>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <NavLink to="/admin/dashboard" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-blue'}`}>Admin</NavLink>
                )}
                <NavLink to="/my-bookings" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-blue'}`}>My Bookings</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-blue'}`}>Profile</NavLink>
                <button onClick={logout} className="bg-indigo-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-blue'}`}>Login</NavLink>
                <NavLink to="/register" className="bg-indigo-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                  Register
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="text-gray-500 hover:text-indigo-blue focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <NavLink to="/" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-blue'}`}>Home</NavLink>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <NavLink to="/admin/dashboard" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-blue'}`}>Admin</NavLink>
                )}
                <NavLink to="/my-bookings" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-blue'}`}>My Bookings</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-blue'}`}>Profile</NavLink>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-blue">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-blue'}`}>Login</NavLink>
                <NavLink to="/register" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-indigo-100 text-indigo-blue' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-blue'}`}>Register</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;