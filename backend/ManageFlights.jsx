import React from 'react';
import { useFetch } from '../../hooks/useFetch'; // Changed path to hooks
import flightService from '../../services/flightService';
import Loader from '../../components/Loader';
import { FaPlane, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

function ManageFlights() {
  const { data: response, loading, error, refetch } = useFetch(flightService.getAllFlights);

  const flights = response?.data || [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await flightService.deleteFlight(id);
        alert('Flight deleted successfully!');
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete flight.');
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Flights</h1>
        <button
          onClick={() => navigate('/admin/add-flight')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700"
        >
          <FaPlus /> Add New Flight
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Airline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {flights.map((flight) => (
              <tr key={flight._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold">{flight.airline}</div>
                  <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold">{flight.departureAirport?.code} &rarr; {flight.arrivalAirport?.code}</div>
                  <div className="text-sm text-gray-500">{flight.departureAirport?.city} to {flight.arrivalAirport?.city}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDateTime(flight.departureTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                  {formatCurrency(flight.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {flight.availableSeats} / {flight.totalSeats}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    // onClick={() => navigate(`/admin/edit-flight/${flight._id}`)} 
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(flight._id)} 
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageFlights;