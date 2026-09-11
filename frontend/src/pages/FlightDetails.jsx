import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import flightService from '../services/flightService';
import Loader from '../components/Loader';
import SeatSelector from '../components/SeatSelector';
import { formatCurrency } from '../utils/formatCurrency.js';
import { FaPlaneDeparture, FaPlaneArrival, FaClock, FaPlane } from 'react-icons/fa';
import { formatDateTime } from '../utils/formatDate.js';

function FlightDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { data: flight, loading, error } = useFetch(() => flightService.getFlightById(id), [id]);
 const [selectedSeats, setSelectedSeats] = useState([]);
 const [totalPrice, setTotalPrice] = useState(0);
 const [isFlying, setIsFlying] = useState(false); // 3D Cinematic Animation State

 const calculateDuration = (start, end) => {
 if (!start || !end) return '2h 30m';
 const diff = new Date(end) - new Date(start);
 const hours = Math.floor(diff / (1000 * 60 * 60));
 const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
 return `${hours}h ${minutes}m`;
 };

 const handleSeatSelection = (seats, price) => {
 setSelectedSeats(seats);
 setTotalPrice(price);
 };


 const handleBooking = () => {
 if (selectedSeats.length === 0) {
 alert("Please select at least one seat to proceed.");
 return;
 }

 // Trigger Cinematic 3D Fly Animation
 setIsFlying(true);

 const flightIdValue = flight?._id || flight?.id || id;
 const sanitizedFlight = {
 ...flight,
 _id: flightIdValue,
 id: flightIdValue,
 };

 // Navigate to next page after animation finishes (1.2 seconds)
 setTimeout(() => {
 navigate('/passenger-details', {
 state: { flight: sanitizedFlight, selectedSeats, totalPrice },
 });
 }, 1200);
 };

 if (loading) {
 return (
 <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white flex items-center justify-center z-50">
 <Loader />
 </div>
 );
 }

 if (error) {
 return (
 <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white flex items-center justify-center z-50">
 <p className="text-center text-red-400 font-semibold text-lg">{error}</p>
 </div>
 );
 }

if (!flight) {
return (
 <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white flex items-center justify-center z-50">
 <p className="text-center text-slate-300">Flight details not found.</p>
 </div>
 );
 }

 const fromCode = flight.departureAirport?.code || flight.from || 'COK';
 const fromCity = flight.departureAirport?.city || flight.from || '';
 const toCode = flight.arrivalAirport?.code || flight.to || 'MAA';
 const toCity = flight.arrivalAirport?.city || flight.to || '';
 return (
 <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white p-4 md:p-8 overflow-y-auto z-50">
 
 {/* Cinematic 3D Flying Flight Overlay Animation */} {isFlying && (
 <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-100 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000">
 <div className="relative animate-bounce">
   <FaPlane className="text-6xl text-blue-400 transform -rotate-45 animate-pulse drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]" />
 </div>
 <div className="mt-8 text-center">
 <h2 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent animate-pulse">
      Launching Your Journey... ✈️
 </h2>
 <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">Securing your seats & transition</p>
 </div>
 </div>
 )}
 <div className="max-w-5xl mx-auto space-y-8 pb-12">
 {/* Flight Summary Card */}
 <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
 <div className="p-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
 <div>
<h2 className="text-3xl font-bold">{flight.airline || 'Airline'}</h2>
<p className="text-lg opacity-90">{flight.flightNumber || 'FL-001'}</p>
 </div>
 <div className="text-right">
 <p className="text-sm opacity-85">Seat Prices</p>
 <p className="text-lg font-semibold">₹6,500 - ₹25,000</p>
 </div>
 </div>

 <div className="p-6">
 <div className="grid grid-cols-3 items-center text-center">
 {/* Departure */}
 <div className="text-left">
 <p className="text-sm text-slate-400">From</p>
 <p className="text-2xl font-bold text-white">{fromCode}</p>
 <p className="text-slate-300">{fromCity}</p>
 <p className="text-sm text-slate-400 mt-1">{flight.departureTime ? formatDateTime(flight.departureTime) : ''}</p>
 </div>

 {/* Route Line */}
<div className="px-4">
 <div className="flex items-center text-slate-500">
 <FaPlaneDeparture className="text-blue-400" />
 <div className="grow border-t-2 border-dashed border-slate-700 mx-2"></div>
 <FaPlaneArrival className="text-blue-400" />
 </div>
 <div className="text-sm text-slate-400 mt-1 flex items-center justify-center">
 <FaClock className="mr-1" />
 {calculateDuration(flight.departureTime, flight.arrivalTime)}
 </div>
 </div>

 {/* Arrival */}
 <div className="text-right">
 <p className="text-sm text-slate-400">To</p>
 <p className="text-2xl font-bold text-white">{toCode}</p>
 <p className="text-slate-300">{toCity}</p>
 <p className="text-sm text-slate-400 mt-1">{flight.arrivalTime ? formatDateTime(flight.arrivalTime) : ''}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Seat Selector Card */}
 <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
 <SeatSelector seats={flight.seats || []} onSelect={handleSeatSelection} />

 {/* Booking Action Footer */}
 <div className="p-6 bg-slate-950/60 border-t border-white/10 flex justify-between items-center flex-wrap gap-4">
 <div>
 <p className="text-sm text-slate-400">Total Price</p>
 <p className="text-3xl font-bold text-blue-400">{formatCurrency(totalPrice)}</p>
 {selectedSeats.length > 0 && (
 <p className="text-sm text-slate-300">{selectedSeats.length} seat(s) selected ({selectedSeats.join(', ')})</p> )}
 </div>
 <button onClick={handleBooking}
 disabled={selectedSeats.length === 0 || isFlying}
 className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-500 transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 cursor-pointer" >
   {isFlying ? 'Flying to next page...' : 'Proceed to Book ✈️'}
 </button>
 </div>
</div>
</div>
</div>
);
}

export default FlightDetails;