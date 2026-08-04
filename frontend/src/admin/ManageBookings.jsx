import { useState, useMemo } from 'react';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { useFetch } from '../hooks/useFetch';
import bookingService from '../services/bookingService';
import { formatDate } from '../utils/formatDate';

const ITEMS_PER_PAGE = 10;

function ManageBookings() {
  const { data: bookings, loading, error, refetch } = useFetch(bookingService.getAllBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId);
        alert('Booking cancelled successfully!');
        refetch(); // Refetch the bookings list
      } catch (err) {
        console.error('Failed to cancel booking:', err);
        alert('Failed to cancel booking.');
      }
    }
  };

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter(booking => {
        if (statusFilter === 'All') return true;
        return booking.status === statusFilter;
      })
      .filter(booking =>
        booking.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [bookings, searchTerm, statusFilter]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Bookings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by PNR or User Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-blue focus:border-indigo-blue"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-blue focus:border-indigo-blue"
        >
          <option value="All">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 mb-6">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">User</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Flight No.</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Booking Date</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">PNR</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Status</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-200">
            {paginatedBookings && paginatedBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="text-left py-3 px-4">{booking.user?.name || 'N/A'}</td>
                <td className="text-left py-3 px-4">{booking.flight?.flightNumber || 'N/A'}</td>
                <td className="text-left py-3 px-4">{formatDate(booking.bookingDate)}</td>
                <td className="text-left py-3 px-4">{booking.pnr}</td>
                <td className="text-left py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="text-left py-3 px-4 whitespace-nowrap">
                  <button onClick={() => handleCancelBooking(booking._id)} disabled={booking.status === 'Cancelled'} className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
            {(!paginatedBookings || paginatedBookings.length === 0) && (
              <tr>
                <td colSpan="6" className="text-center py-4">No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default ManageBookings;