import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] bg-gray-100 text-center px-4">
      <div className="max-w-md">
        <FaExclamationTriangle className="mx-auto text-6xl text-yellow-400 mb-4" />
        <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
        <h2 className="mt-2 text-3xl font-bold text-gray-700">Page Not Found</h2>
        <p className="mt-4 text-gray-500">
          Sorry, the page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-indigo-blue text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-800 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;