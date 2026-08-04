import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import bookingService from '../services/bookingService';
import Loader from '../components/Loader.jsx';
import Ticket from '../components/Ticket.jsx';
import { FaTicketAlt } from 'react-icons/fa';

function MyBookings() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const { data: responseData, loading, error, refetch } = useFetch(bookingService.getMyBookings);

  const bookings = useMemo(() => {
    if (!responseData) return [];
    // The actual bookings array is inside the 'data' property of the response
    return responseData.data || [];
  }, [responseData]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await bookingService.cancelBooking(bookingId);
        alert('Booking cancelled successfully.');
        refetch(); // Refresh the list of bookings
      } catch (err) {
        alert('Failed to cancel booking. Please try again.');
        console.error(err);
      }
    }
  };

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter(b => {
      // status-ஐ lowercase-ஆக மாற்றி செக் செய்வதால் பெரிய/சிறிய எழுத்து குழப்பம் வராது
      const status = (b.status || '').toLowerCase();
      
      if (activeTab === 'Upcoming') {
        // confirmed அல்லது pending எதுவாக இருந்தாலும் Upcoming-ல் காட்டும்
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

      {/* Tabs */}
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