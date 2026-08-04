import React, { useState, useEffect } from 'react';
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';

function SearchForm({ onSearch }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [airports, setAirports] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(true);

  // டேட்டாபேஸில் உள்ள ஏர்போர்ட்ஸ் லிஸ்ட்டை லோட் செய்ய
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        // நேரடியாக Render URL-ஐப் பயன்படுத்துகிறோம்
        const response = await axios.get('https://flight-booking-app-6z55.onrender.com/api/airports');
        const result = response.data;
        
        // டேட்டா எந்த வடிவில் வந்தாலும் அதை அரேவாக மாற்றிக் கொள்ள பாதுகாப்பு முறை
        if (Array.isArray(result)) {
          setAirports(result);
        } else if (Array.isArray(result.data)) {
          setAirports(result.data);
        } else if (Array.isArray(result.airports)) {
          setAirports(result.airports);
        } else {
          setAirports([]);
        }

        setLoadingAirports(false);
      } catch (error) {
        console.error("Error fetching airports:", error);
        setAirports([]);
        setLoadingAirports(false);
      }
    };
    fetchAirports();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) {
      alert('Please fill out all fields to search for flights.');
      return;
    }
    onSearch({ from, to, date });
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-2xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* From Input (Dropdown) */}
        <div className="md:col-span-2 relative">
          <label htmlFor="from" className="block text-sm font-medium text-gray-500 mb-1">From (Departure Airport)</label>
          <div className="relative">
            <FaPlaneDeparture className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            <select
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition bg-white"
              required
            >
              <option value="">{loadingAirports ? "Loading airports..." : "Select Departure Airport"}</option>
              {Array.isArray(airports) && airports.map((airport) => (
                <option key={airport._id} value={airport.airportCode}>
                  {airport.city} ({airport.airportCode}) - {airport.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="text-center">
          <button type="button" onClick={handleSwap} className="mt-6 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-indigo-100 hover:text-indigo-blue transition-colors cursor-pointer">
            <FaExchangeAlt className="transform rotate-90 md:rotate-0" />
          </button>
        </div>

        {/* To Input (Dropdown) */}
        <div className="md:col-span-2 relative">
          <label htmlFor="to" className="block text-sm font-medium text-gray-500 mb-1">To (Arrival Airport)</label>
          <div className="relative">
            <FaPlaneArrival className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            <select
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition bg-white"
              required
            >
              <option value="">{loadingAirports ? "Loading airports..." : "Select Arrival Airport"}</option>
              {Array.isArray(airports) && airports.map((airport) => (
                <option key={airport._id} value={airport.airportCode}>
                  {airport.city} ({airport.airportCode}) - {airport.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Input */}
        <div className="relative">
          <label htmlFor="date" className="block text-sm font-medium text-gray-500 mb-1">Departure Date</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition" required />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full self-end bg-indigo-accent text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer">
          Search Flights
        </button>
      </div>
    </form>
  );
}

export default SearchForm;