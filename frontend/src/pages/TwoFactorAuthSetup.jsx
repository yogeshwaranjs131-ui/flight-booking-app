import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import Loader from '../components/Loader';
import { FaQrcode, FaShieldAlt, FaKey } from 'react-icons/fa';

function TwoFactorAuthSetup() {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    const generateSecret = async () => {
      try {
        const res = await userService.generate2FASecret();
        if (res.data) {
          setQrCodeUrl(res.data.qrCodeUrl);
          setSecret(res.data.secret);
        }
      } catch (err) {
        setError('Failed to generate 2FA secret. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    generateSecret();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerifyError(null);
    try {
      await userService.verify2FAToken({ token });
      alert('Two-Factor Authentication enabled successfully!');
      navigate('/profile');
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Invalid token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !qrCodeUrl) {
    return <Loader />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 flex items-center justify-center gap-2">
          <FaShieldAlt /> Setup Two-Factor Authentication
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Scan the QR code with your authenticator app (like Google Authenticator or Authy).
        </p>

        <div className="flex justify-center mb-6">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="2FA QR Code" className="border-4 border-gray-200 rounded-lg" />
          ) : (
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
              <FaQrcode className="text-gray-400 text-6xl" />
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mb-4">
          Can't scan? Manually enter this secret key:
        </p>
        <div className="bg-gray-100 p-3 rounded-lg text-center font-mono text-lg tracking-wider mb-8">
          {secret}
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Verification Code</label>
            <div className="relative">
              <FaKey className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                required
              />
            </div>
            {verifyError && <p className="text-red-500 text-xs mt-1">{verifyError}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400">
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TwoFactorAuthSetup;