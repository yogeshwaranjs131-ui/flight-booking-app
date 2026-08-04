import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaKey, FaPlane } from 'react-icons/fa';

function VerifyToken() {
  const { complete2FALogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!userId) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await complete2FALogin(userId, token);
      if (data && data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-12 rounded-xl shadow-lg">
        <div>
          <FaPlane className="mx-auto text-5xl text-indigo-blue" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Two-Factor Authentication</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          <div className="relative">
            <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="token"
              placeholder="6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition"
              required
              maxLength="6"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyToken;