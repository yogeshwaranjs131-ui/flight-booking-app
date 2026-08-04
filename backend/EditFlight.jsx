import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import flightService from '../../services/flightService';
import airportService from '../../services/airportService';
import { FaEdit, FaPlane } from 'react-icons/fa';
import Loader from '../../components/Loader';

function EditFlight() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: '',
    duration: '',
  });
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightRes, airportsRes] = await Promise.all([
          flightService.getFlightById(id),
          airportService.getAirports(),
        ]);

        const flightData = flightRes.data.data;
        setAirports(airportsRes.data.data);
        setFormData({
          airline: flightData.airline,
          flightNumber: flightData.flightNumber,
          departureAirport: flightData.departureAirport._id,
          arrivalAirport: flightData.arrivalAirport._id,
          departureTime: new Date(flightData.departureTime).toISOString().slice(0, 16), // Format for datetime-local input
          arrivalTime: new Date(flightData.arrivalTime).toISOString().slice(0, 16), // Format for datetime-local input
          price: flightData.price,
          totalSeats: flightData.totalSeats,
          duration: flightData.duration || '',
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load flight details or airports.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await flightService.updateFlight(id, formData);
      setSuccess('Flight updated successfully!');
      navigate('/admin/manage-flights'); // Redirect to manage flights page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update flight.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error && !formData.airline) { // Only show error if initial load failed
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaPlane /> Edit Flight
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Airline</label>
          <input type="text" name="airline" value={formData.airline} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Flight Number</label>
          <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Departure Airport</label>
            <select name="departureAirport" value={formData.departureAirport} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="">Select Airport</option>
              {airports.map(airport => (
                <option key={airport._id} value={airport._id}>{airport.airportName} ({airport.airportCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Arrival Airport</label>
            <select name="arrivalAirport" value={formData.arrivalAirport} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="">Select Airport</option>
              {airports.map(airport => (
                <option key={airport._id} value={airport._id}>{airport.airportName} ({airport.airportCode})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Departure Time</label>
            <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
            <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Seats</label>
            <input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (e.g., 2h 30m)</label>
            <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/manage-flights')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Flight'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditFlight;