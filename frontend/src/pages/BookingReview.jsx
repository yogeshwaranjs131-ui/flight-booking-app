import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { FaPlane, FaUserFriends, FaRupeeSign } from 'react-icons/fa';

function BookingReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { flight, selectedSeats, passengers, totalPrice: passedTotalPrice } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);

  if (!flight || !selectedSeats || !passengers) {
    return <Navigate to="/" replace />;
  }

  const basePrice = flight.price || 4500;
  const totalBasePrice = basePrice * (selectedSeats.length || passengers.length);
  const totalTaxes = totalBasePrice * 0.18;
  const totalPrice = passedTotalPrice || (totalBasePrice + totalTaxes);

  const fromCode = flight.departureAirport?.code || flight.from || 'COK';
  const toCode = flight.arrivalAirport?.code || flight.to || 'MAA';
  const airlineName = flight.airline || 'Airline';
  const flightNo = flight.flightNumber || 'FL-001';

  const handleProceedToPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      navigate('/payment', {
        state: {
          flight,
          selectedSeats,
          passengers,
          totalPrice,
        },
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white p-4 md:p-8 overflow-y-auto z-50">
      
      {/* Cinematic 3D Flying Animation Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-100 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000">
          <div className="relative animate-bounce">
            <img 
              src="https://img.pikbest.com/png-images/3d-flying-airplane-isolated-on-white-background_10648593.png!w700wp" 
              alt="3D Flying Airplane" 
              className="w-44 h-44 object-contain transform -rotate-45 animate-pulse drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]"
            />
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent animate-pulse">
              Connecting to Payment Gateway... ✈️
            </h2>
            <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">Securing transaction</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-6 pb-12">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/15 p-6 md:p-8 shadow-2xl">
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent mb-8 text-center">
            Review Your Booking
          </h1>
          
          <div className="space-y-6">
            {/* Flight Details Section */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/10 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                <FaPlane className="mr-3 text-blue-400 transform -rotate-45" />Flight Summary
              </h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-white">{fromCode} &rarr; {toCode}</p>
                  <p className="text-sm text-slate-400">{airlineName} - {flightNo}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{flight.departureTime ? formatDateTime(flight.departureTime) : 'N/A'}</p>
                  <p className="text-sm text-slate-400">Departure</p>
                </div>
              </div>
            </div>

            {/* Passenger Details Section */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/10 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                <FaUserFriends className="mr-3 text-blue-400" />Passengers
              </h2>
              <ul className="space-y-2">
                {passengers.map((p, index) => (
                  <li key={index} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-white/5 text-slate-200">
                    <span className="text-sm font-medium">{index + 1}. {p.name} ({p.age} yrs, {p.gender})</span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30 font-semibold">Seat: {selectedSeats[index]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Details Section */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/10 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                <FaRupeeSign className="mr-3 text-blue-400" />Price Summary
              </h2>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between"><span>Selected Seats ({selectedSeats.length})</span> <span>{formatCurrency(totalBasePrice)}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-3"><span>Taxes & Fees (18%)</span> <span>{formatCurrency(totalTaxes)}</span></div>
                <div className="flex justify-between text-xl font-extrabold text-white pt-2"><span>Total Amount</span> <span className="text-amber-200 text-2xl">{formatCurrency(totalPrice)}</span></div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button 
                onClick={handleProceedToPayment} 
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/40 transition-all cursor-pointer"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Pay ✈️'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingReview;