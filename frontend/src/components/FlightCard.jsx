import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency.js';
import { FaClock, FaChair, FaPlane } from 'react-icons/fa';

function FlightCard({ flight }) {
  const navigate = useNavigate();
  const [isFlying, setIsFlying] = useState(false); // 3D Cinematic Flight Animation State

  // Format time (HH:mm)
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Calculate duration
  const calculateDuration = (dep, arr) => {
    if (!dep || !arr) return "2h 30m";
    const diff = Math.abs(new Date(arr) - new Date(dep)) / 1000;
    if (isNaN(diff)) return "2h 30m";
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleBookClick = () => {
    const flightId = flight?._id || flight?.id;
    if (!flightId) {
      alert("Flight ID not found!");
      return;
    }

    // Trigger Cinematic 3D Fly Animation
    setIsFlying(true);

    // Navigate to flight details page with full flight object in state
    setTimeout(() => {
      navigate(`/flight-details/${flightId}`, {
        state: { flight: flight }
      });
    }, 1200);
  };

  // Safely handle both international and domestic airport codes & cities
  const departureCity = flight.departureAirport?.city || flight.from || "Origin";
  const arrivalCity = flight.arrivalAirport?.city || flight.to || "Destination";
  const departureCode = flight.departureAirport?.code || flight.departureAirport?.airportCode || flight.from || "DEP";
  const arrivalCode = flight.arrivalAirport?.code || flight.arrivalAirport?.airportCode || flight.to || "ARR";

  return (
    <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/15 flex flex-col md:flex-row justify-between items-center gap-6 text-white overflow-hidden transition-all duration-300 hover:border-blue-400/50">
      
      {/* Cinematic 3D Flying Flight Overlay Animation */}
      {isFlying && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-100 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000">
          <div className="relative animate-bounce">
            <FaPlane className="text-6xl text-blue-400 transform -rotate-45 animate-pulse drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]" />
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent animate-pulse">
              Launching Flight Details... ✈️
            </h2>
            <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">Connecting to your destination</p>
          </div>
        </div>
      )}

      {/* Airline Info & Logo */}
      <div className="flex items-center gap-4 w-full md:w-1/4">
        <div className="w-14 h-14 bg-slate-950 flex items-center justify-center rounded-full border border-white/20 shadow-inner">
          <FaPlane className="text-blue-400 text-2xl transform -rotate-45" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{flight.airline || "International Flight"}</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{flight.flightNumber || "FL-001"}</p>
        </div>
      </div>

      {/* Flight Timing & Route */}
      <div className="flex items-center justify-between w-full md:w-2/4 px-4">
        {/* Departure */}
        <div className="text-center md:text-left">
          <p className="text-xl font-bold text-white">{formatTime(flight.departureTime)}</p>
          <p className="text-sm font-semibold text-blue-400">{departureCode} <span className="text-xs text-slate-400 font-normal">({departureCity})</span></p>
        </div>

        {/* Duration / Stops Line */}
        <div className="flex flex-col items-center px-4">
          <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <FaClock className="text-slate-400" /> {calculateDuration(flight.departureTime, flight.arrivalTime)}
          </span>
          <div className="w-28 sm:w-36 flex items-center">
            <div className="h-0.5 bg-blue-500/40 w-full relative">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-400 mt-1">
            {flight.stops === 0 || !flight.stops ? "Direct" : `${flight.stops} Stop(s)`}
          </span>
        </div>

        {/* Arrival */}
        <div className="text-center md:text-right">
          <p className="text-xl font-bold text-white">{formatTime(flight.arrivalTime)}</p>
          <p className="text-sm font-semibold text-blue-400">{arrivalCode} <span className="text-xs text-slate-400 font-normal">({arrivalCity})</span></p>
        </div>
      </div>

      {/* Price & Book Button */}
      <div className="flex flex-col gap-3 md:items-end w-full md:w-1/4 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
        <div className="text-left md:text-right mb-2">
          <span className="text-xs text-slate-400 block">Price per adult</span>
          <span className="text-2xl font-extrabold text-blue-400">{formatCurrency(flight.price || 5500)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 justify-end">
          <FaChair className="text-blue-400" />
          <span>{flight.availableSeats || flight.totalSeats || 60} seats available</span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleBookClick}
            disabled={isFlying}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer disabled:bg-slate-800"
          >
            Book Now ✈️
          </button>
        </div>
      </div>

    </div>
  );
}

export default FlightCard;