import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency.js';
import { FaPlaneDeparture, FaPlaneArrival, FaClock, FaChair } from 'react-icons/fa';

function FlightCard({ flight }) {
  const navigate = useNavigate();

  // Helper to get airline logo/image based on airline name
  const getAirlineLogo = (airlineName) => {
    if (!airlineName) return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100";
    const name = airlineName.toLowerCase();
    if (name.includes('indigo')) return "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=100";
    if (name.includes('air india')) return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100";
    if (name.includes('spicejet')) return "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=100";
    return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100";
  };

  // Format time (HH:mm)
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Calculate duration or display a placeholder
  const calculateDuration = (dep, arr) => {
    if (!dep || !arr) return "2h 30m";
    const diff = Math.abs(new Date(arr) - new Date(dep)) / 1000;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleBookClick = () => {
    // Navigate to the flight details page to start the booking flow
    navigate(`/flight-details/${flight._id || flight.id}`);
  };

  const departureCity = flight.departureAirport?.city || flight.from || "Origin";
  const arrivalCity = flight.arrivalAirport?.city || flight.to || "Destination";
  const departureCode = flight.departureAirport?.airportCode || "DEP";
  const arrivalCode = flight.arrivalAirport?.airportCode || "ARR";

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
      
      {/* Airline Info & Logo */}
      <div className="flex items-center gap-4 w-full md:w-1/4">
        <img 
          src={getAirlineLogo(flight.airline)} 
          alt={flight.airline || "Airline"} 
          className="w-14 h-14 object-cover rounded-full border border-gray-200 shadow-sm"
        />
        <div>
          <h3 className="text-lg font-bold text-gray-800">{flight.airline || "IndiGo"}</h3>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{flight.flightNumber || "6E-205"}</p>
        </div>
      </div>

      {/* Flight Timing & Route */}
      <div className="flex items-center justify-between w-full md:w-2/4 px-4">
        {/* Departure */}
        <div className="text-center md:text-left">
          <p className="text-xl font-bold text-gray-900">{formatTime(flight.departureTime)}</p>
          <p className="text-sm font-semibold text-indigo-900">{departureCode} <span className="text-xs text-gray-500 font-normal">({departureCity})</span></p>
        </div>

        {/* Duration / Stops Line */}
        <div className="flex flex-col items-center px-4">
          <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FaClock className="text-gray-400" /> {calculateDuration(flight.departureTime, flight.arrivalTime)}
          </span>
          <div className="w-28 sm:w-36 flex items-center">
            <div className="h-0.5 bg-indigo-300 w-full relative">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rounded-full"></span>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-600 mt-1">
            {flight.stops === 0 || !flight.stops ? "Direct" : `${flight.stops} Stop(s)`}
          </span>
        </div>

        {/* Arrival */}
        <div className="text-center md:text-right">
          <p className="text-xl font-bold text-gray-900">{formatTime(flight.arrivalTime)}</p>
          <p className="text-sm font-semibold text-indigo-900">{arrivalCode} <span className="text-xs text-gray-500 font-normal">({arrivalCity})</span></p>
        </div>
      </div>

      {/* Price & Book Button */}
      <div className="flex flex-col gap-3 md:items-end w-full md:w-1/4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
        <div className="text-left md:text-right mb-2">
          <span className="text-xs text-gray-400 block">Price per adult</span>
          <span className="text-2xl font-extrabold text-indigo-600">{formatCurrency(flight.price || 5500)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 justify-end">
          <FaChair />
          <span>{flight.availableSeats || flight.totalSeats} / {flight.totalSeats} seats available</span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleBookClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md transition-colors duration-200 cursor-pointer"
          >
            Book Now
          </button>
          <button
            onClick={() => navigate(`/flight-details/${flight._id || flight.id}`)}
            className="w-full bg-white border border-indigo-600 text-indigo-600 font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>

    </div>
  );
}

export default FlightCard;