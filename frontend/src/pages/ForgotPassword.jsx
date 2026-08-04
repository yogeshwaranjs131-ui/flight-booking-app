import { useState } from 'react';
import api from '../services/api';
import { FaEnvelope, FaPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // இந்த endpoint-ஐ நாம் backend-ல் உருவாக்க வேண்டும்
      await api.post('/auth/forgot-password', { email });
      setMessage('உங்கள் மின்னஞ்சலுக்கு கடவுச்சொல்லை மீட்டமைப்பதற்கான இணைப்பு அனுப்பப்பட்டுள்ளது.');
    } catch (err) {
      setError(err.response?.data?.message || 'ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-12 rounded-xl shadow-lg">
        <div>
          <FaPlane className="mx-auto text-5xl text-indigo-blue" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">கடவுச்சொல்லை மறந்துவிட்டீர்களா?</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            கவலை வேண்டாம்! உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும், நாங்கள் உங்களுக்கு கடவுச்சொல்லை மீட்டமைப்பதற்கான இணைப்பை அனுப்புவோம்.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" name="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition" required />
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
            {loading ? "அனுப்புகிறது..." : "மீட்டமைப்பு இணைப்பை அனுப்பு"}
          </button>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-indigo-blue hover:text-indigo-accent">
            &larr; உள்நுழைவுப் பக்கத்திற்குத் திரும்பு
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;