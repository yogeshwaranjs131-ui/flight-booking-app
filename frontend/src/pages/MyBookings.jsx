import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import bookingService from '../services/bookingService';
import Loader from '../components/Loader.jsx';
import Ticket from '../components/Ticket.jsx';
import { FaTicketAlt, FaSearch } from 'react-icons/fa';

function MyBookings() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [pnrQuery, setPnrQuery] = useState('');
  const [pnrBooking, setPnrBooking] = useState(null);
  const [pnrError, setPnrError] = useState('');
  const [pnrLoading, setPnrLoading] = useState(false);

  const { data: responseData, loading, error, refetch } = useFetch(bookingService.getMyBookings);

  const bookings = useMemo(() => {
    if (!responseData) return [];
    return responseData.data || [];
  }, [responseData]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await bookingService.cancelBooking(bookingId);
        alert('Booking cancelled successfully.');
        refetch();
      } catch (err) {
        alert('Failed to cancel booking. Please try again.');
        console.error(err);
      }
    }
  };

  const handlePnrLookup = async () => {
    const normalizedPnr = pnrQuery.trim().toUpperCase();
    if (!normalizedPnr) {
      setPnrError('Enter a PNR number to check the booking status.');
      return;
    }

    try {
      setPnrLoading(true);
      setPnrError('');
      const response = await bookingService.getBookingByPnr(normalizedPnr);
      setPnrBooking(response.data.data || response.data);
    } catch (err) {
      setPnrBooking(null);
      setPnrError(err.response?.data?.message || 'PNR not found.');
    } finally {
      setPnrLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    return bookings.filter(b => {
      const status = (b.status || '').toLowerCase();

      if (activeTab === 'Upcoming') {
        return status === 'confirmed' || status === 'pending';
      }
      if (activeTab === 'Cancelled') {
        return status === 'cancelled';
      }
      return true;
    });
  }, [bookings, activeTab]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Bookings</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={pnrQuery}
              onChange={(e) => setPnrQuery(e.target.value)}
              placeholder="Check PNR Status"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-800"
            />
          </div>
          <button
            onClick={handlePnrLookup}
            disabled={pnrLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all disabled:bg-slate-400"
          >
            {pnrLoading ? 'Checking...' : 'Live PNR Status'}
          </button>
        </div>

        {pnrError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {pnrError}
          </div>
        )}

        {pnrBooking && (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div>
                <span className="text-xs uppercase font-bold tracking-wide text-indigo-700">PNR Status</span>
                <div className="font-bold text-slate-900 mt-1">{pnrBooking.pnr}</div>
              </div>
              <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${pnrBooking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>Status: {pnrBooking.status}</span>
            </div>
            <div className="mt-3">
              <Ticket booking={pnrBooking} onCancel={handleCancelBooking} />
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 flex justify-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab('Upcoming')}
          className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'Upcoming' ? 'border-b-2 border-indigo-blue text-indigo-blue' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('Cancelled')}
          className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'Cancelled' ? 'border-b-2 border-indigo-blue text-indigo-blue' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Cancelled
        </button>
      </div>

      {filteredBookings && filteredBookings.length > 0 ? (
        <div className="space-y-8">
          {filteredBookings.map((booking) => (
            booking && booking._id ? (
              <Ticket key={booking._id} booking={booking} onCancel={handleCancelBooking} />
            ) : null
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          <FaTicketAlt className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No {activeTab.toLowerCase()} bookings</h3>
          <p className="text-gray-500 mb-6">It looks like you don't have any {activeTab.toLowerCase()} bookings right now.</p>
          {activeTab === 'Upcoming' && (
            <Link to="/" className="mt-4 inline-block bg-indigo-accent text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors">
              Find a Flight
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default MyBookings;