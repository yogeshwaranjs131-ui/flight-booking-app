import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import flightService from '../services/flightService';
import Loader from '../components/Loader';

function FlightForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the flight ID from the URL if it exists
  const isEditMode = Boolean(id);

  const [flight, setFlight] = useState({
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: 60,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      flightService.getFlightById(id)
        .then(response => {
          const flightData = response.data.data;
          // Format dates for the datetime-local input
          flightData.departureTime = flightData.departureTime.slice(0, 16);
          flightData.arrivalTime = flightData.arrivalTime.slice(0, 16);
          setFlight(flightData);
        })
        .catch(err => setError('Failed to fetch flight data.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlight(prevFlight => ({
      ...prevFlight,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await flightService.updateFlight(id, flight);
        alert('Flight updated successfully!');
      } else {
        await flightService.createFlight(flight);
        alert('Flight created successfully!');
      }
      navigate('/admin/manage-flights');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <Loader />;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit Flight' : 'Add New Flight'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="airline" placeholder="Airline (e.g., IndiGo)" value={flight.airline} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="text" name="flightNumber" placeholder="Flight Number (e.g., 6E-2024)" value={flight.flightNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="departureAirport" placeholder="Departure Airport Code (e.g., DEL)" value={flight.departureAirport} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="text" name="arrivalAirport" placeholder="Arrival Airport Code (e.g., BOM)" value={flight.arrivalAirport} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Departure Time</label>
            <input type="datetime-local" name="departureTime" value={flight.departureTime} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="text-sm text-gray-500">Arrival Time</label>
            <input type="datetime-local" name="arrivalTime" value={flight.arrivalTime} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="number" name="price" placeholder="Price (INR)" value={flight.price} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="number" name="totalSeats" placeholder="Total Seats" value={flight.totalSeats} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={() => navigate('/admin/manage-flights')} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md mr-4 hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="bg-indigo-blue text-white px-6 py-2 rounded-md hover:bg-blue-800 disabled:bg-gray-400">
            {loading ? 'Saving...' : (isEditMode ? 'Update Flight' : 'Add Flight')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FlightForm;