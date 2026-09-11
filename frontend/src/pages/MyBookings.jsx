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
    return (
      <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white flex items-center justify-center z-50">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white flex items-center justify-center z-50">
        <p className="text-center text-red-400 font-semibold text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white p-4 md:p-8 overflow-y-auto z-50">
      <div className="max-w-4xl mx-auto py-6">
        <h2 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent mb-8 text-center">My Bookings</h2>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/15 p-6 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3.5 top-4 text-slate-400" />
              <input
                type="text"
                value={pnrQuery}
                onChange={(e) => setPnrQuery(e.target.value)}
                placeholder="Check PNR Status"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 rounded-xl border border-white/20 focus:ring-2 focus:ring-blue-400 focus:outline-none text-white placeholder-slate-400"
              />
            </div>
            <button
              onClick={handlePnrLookup}
              disabled={pnrLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:bg-slate-700 cursor-pointer w-full sm:w-auto"
            >
              {pnrLoading ? 'Checking...' : 'Live PNR Status'}
            </button>
          </div>

          {pnrError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 text-red-200 px-4 py-3">
              {pnrError}
            </div>
          )}

          {pnrBooking && (
            <div className="mt-4 rounded-2xl border border-blue-400/30 bg-blue-950/30 p-4">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wide text-blue-400">PNR Status</span>
                  <div className="font-bold text-white mt-1">{pnrBooking.pnr}</div>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${pnrBooking.status === 'CANCELLED' ? 'bg-red-900/50 text-red-300 border border-red-500/30' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'}`}>Status: {pnrBooking.status}</span>
              </div>
              <div className="mt-3">
                <Ticket booking={pnrBooking} onCancel={handleCancelBooking} />
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 flex justify-center border-b border-white/10">
          <button
            onClick={() => setActiveTab('Upcoming')}
            className={`px-6 py-3 font-semibold text-lg transition-colors cursor-pointer ${activeTab === 'Upcoming' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('Cancelled')}
            className={`px-6 py-3 font-semibold text-lg transition-colors cursor-pointer ${activeTab === 'Cancelled' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Cancelled
          </button>
        </div>

        {filteredBookings && filteredBookings.length > 0 ? (
          <div className="space-y-8 pb-12">
            {filteredBookings.map((booking) => (
              booking && booking._id ? (
                <Ticket key={booking._id} booking={booking} onCancel={handleCancelBooking} />
              ) : null
            ))}
          </div>
        ) : (
          <div className="text-center bg-slate-900/80 backdrop-blur-xl p-12 rounded-2xl border border-white/15 shadow-2xl">
            <FaTicketAlt className="mx-auto text-5xl text-slate-500 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-slate-400 mb-6">It looks like you don't have any {activeTab.toLowerCase()} bookings right now.</p>
            {activeTab === 'Upcoming' && (
              <Link to="/" className="mt-4 inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/40">
                Find a Flight ✈️
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;