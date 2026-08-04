import { useState } from "react";
import { useNavigate } from "react-router-dom";
import flightService from "../services/flightService";

function AddFlight() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    airline: "",
    flightNumber: "",
    departureAirport: "",
    arrivalAirport: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await flightService.createFlight(formData);
      alert("Flight added successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add flight.");
      console.error("Error adding flight:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Flight</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" name="airline" placeholder="Airline" value={formData.airline} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="text" name="flightNumber" placeholder="Flight Number" value={formData.flightNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="text" name="departureAirport" placeholder="Departure Airport (e.g., DEL)" value={formData.departureAirport} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="text" name="arrivalAirport" placeholder="Arrival Airport (e.g., BOM)" value={formData.arrivalAirport} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <div>
          <label className="block text-sm font-medium text-gray-700">Departure Time:</label>
          <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Arrival Time:</label>
          <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        </div>
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="number" name="availableSeats" placeholder="Available Seats" value={formData.availableSeats} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add Flight</button>
      </form>
    </div>
  );
}

export default AddFlight;