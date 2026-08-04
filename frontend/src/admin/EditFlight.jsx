import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import flightService from "../services/flightService";

function EditFlight() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        setLoading(true);
        const { data: flightToEdit } = await flightService.getFlightById(id);
        if (flightToEdit) {
          // Format dates for the datetime-local input field
          const formatForInput = (dateStr) => (dateStr ? dateStr.slice(0, 16) : "");
          setFormData({
            ...flightToEdit,
            departureTime: formatForInput(flightToEdit.departureTime),
            arrivalTime: formatForInput(flightToEdit.arrivalTime),
          });
        }
      } catch (err) {
        setError("Failed to fetch flight details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await flightService.updateFlight(id, formData);
      alert("Details updated successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Failed to update flight.");
      console.error(err);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Flight Details</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" name="airline" placeholder="Airline" value={formData.airline} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="text" name="flightNumber" placeholder="Flight Number" value={formData.flightNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="text" name="departureAirport" placeholder="Departure Airport" value={formData.departureAirport} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="text" name="arrivalAirport" placeholder="Arrival Airport" value={formData.arrivalAirport} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <input type="number" name="availableSeats" placeholder="Available Seats" value={formData.availableSeats} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue sm:text-sm" required />
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Update Details</button>
      </form>
    </div>
  );
}

export default EditFlight;