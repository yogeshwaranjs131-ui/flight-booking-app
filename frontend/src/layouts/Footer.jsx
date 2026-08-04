import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} IndiGo Clone. All Rights Reserved.</p>
        <p className="text-sm text-gray-400">This is a clone project for educational purposes.</p>
      </div>
    </footer>
  );
}

export default Footer;