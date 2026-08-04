import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About IndiGo Clone</h3>
            <p className="text-gray-400 text-sm">This is a clone project for educational purposes, demonstrating a modern flight booking application built with the MERN stack.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/my-bookings" className="text-gray-400 hover:text-white">My Bookings</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><FaFacebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaTwitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaInstagram size={20} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} IndiGo Clone. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;