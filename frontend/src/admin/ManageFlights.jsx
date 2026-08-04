import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { formatCurrency } from '../utils/formatCurrency';
import { useFetch } from '../hooks/useFetch';
import flightService from '../services/flightService';

const ITEMS_PER_PAGE = 10;

function ManageFlights() {
  const { data: flights, loading, error, refetch } = useFetch(flightService.getAllFlights);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await flightService.deleteFlight(flightId);
        alert('Flight deleted successfully!');
        refetch(); // Refetch the flight list after deletion
      } catch (err) {
        console.error('Failed to delete flight:', err);
        alert('Failed to delete flight.');
      }
    }
  };

  const filteredFlights = useMemo(() => {
    if (!flights) return [];
    return flights.filter(flight =>
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.departureAirport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.arrivalAirport.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flights, searchTerm]);

  const paginatedFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFlights, currentPage]);

  const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Flights</h2>
        <Link to="/admin/add-flight" className="bg-indigo-blue text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
          Add New Flight
        </Link>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Airline, Flight No, From, or To..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-blue focus:border-indigo-blue"
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 mb-6">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Airline</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Flight No.</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">From</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">To</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Price</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-200">
            {paginatedFlights && paginatedFlights.map((flight) => (
              <tr key={flight._id} className="hover:bg-gray-50">
                <td className="text-left py-3 px-4">{flight.airline}</td>
                <td className="text-left py-3 px-4">{flight.flightNumber}</td>
                <td className="text-left py-3 px-4">{flight.departureAirport}</td>
                <td className="text-left py-3 px-4">{flight.arrivalAirport}</td>
                <td className="text-left py-3 px-4">{formatCurrency(flight.price)}</td>
                <td className="text-left py-3 px-4 whitespace-nowrap">
                  <Link to={`/admin/edit-flight/${flight._id}`} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-200 mr-2">Edit</Link>
                  <button onClick={() => handleDelete(flight._id)} className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {(!paginatedFlights || paginatedFlights.length === 0) && (
              <tr>
                <td colSpan="6" className="text-center py-4">No flights available.</td>
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

export default ManageFlights;