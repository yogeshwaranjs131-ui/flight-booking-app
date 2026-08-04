import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { FaLock, FaPlane, FaEye, FaEyeSlash } from 'react-icons/fa';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setMessage('Your password has been reset successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-12 rounded-xl shadow-lg">
        <div>
          <FaPlane className="mx-auto text-5xl text-indigo-blue" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="New Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition" 
              required 
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm New Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition" 
              required 
            />
          </div>
          <button type="submit" disabled={loading || !!message} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;