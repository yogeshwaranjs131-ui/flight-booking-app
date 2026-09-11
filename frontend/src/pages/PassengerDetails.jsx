import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlane } from 'react-icons/fa';

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const { flight, selectedSeats, totalPrice } = location.state || {};

  const [passengers, setPassengers] = useState(
    () => Array.from({ length: selectedSeats?.length || 0 }, () => ({
      name: '',
      age: '',
      gender: 'Male',
    }))
  );
  const [isProcessing, setIsProcessing] = useState(false); // 3D Cinematic Animation State

  const handleChange = (index, e) => {
    const updatedPassengers = passengers.map((passenger, i) => {
      if (i === index) {
        return { ...passenger, [e.target.name]: e.target.value };
      }
      return passenger;
    });
    setPassengers(updatedPassengers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Trigger Cinematic 3D Fly Animation
    setIsProcessing(true);

    const sanitizedFlight = {
      ...flight,
      _id: flight?._id || flight?.id,
      flightId: flight?._id || flight?.id,
    };

    const finalTotalPrice = totalPrice || (selectedSeats?.length * 6500) || 6500;

    // Navigate to next page after animation finishes (1.2 seconds)
    setTimeout(() => {
      navigate('/booking-review', {
        state: { 
          flight: sanitizedFlight, 
          selectedSeats, 
          passengers, 
          totalPrice: finalTotalPrice 
        },
      });
    }, 1200);
  };

  if (!flight || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white flex flex-col items-center justify-center z-50 p-4">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">No flight or seat information was provided.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg cursor-pointer">
          Go to Home ✈️
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white p-4 md:p-8 overflow-y-auto z-50">
      
      {/* Cinematic 3D Flying Animation Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-100 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000">
          <div className="relative animate-bounce">
            <FaPlane className="text-6xl text-blue-400 transform -rotate-45 animate-pulse drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]" />
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent animate-pulse">
              Proceeding to Review... ✈️
            </h2>
            <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">Securing your passenger details</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-6 pb-12">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/15 p-6 md:p-8 shadow-2xl">
          <h2 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent mb-2">
            Passenger Details
          </h2>
          <p className="text-slate-400 mb-8">
            Please enter the details for the <strong className="text-white">{selectedSeats.length}</strong> passenger(s).
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {passengers.map((passenger, index) => (
              <div key={index} className="p-6 bg-slate-950/60 rounded-2xl border border-white/10 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">Passenger {index + 1} (Seat {selectedSeats[index]})</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Full Name" 
                    value={passenger.name} 
                    onChange={(e) => handleChange(index, e)} 
                    className="md:col-span-2 px-4 py-3 bg-slate-900 text-white border border-white/20 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    required 
                  />
                  <input 
                    type="number" 
                    name="age" 
                    placeholder="Age" 
                    value={passenger.age} 
                    onChange={(e) => handleChange(index, e)} 
                    className="px-4 py-3 bg-slate-900 text-white border border-white/20 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    required 
                  />
                  <select 
                    name="gender" 
                    value={passenger.gender} 
                    onChange={(e) => handleChange(index, e)} 
                    className="md:col-span-3 px-4 py-3 bg-slate-900 text-white border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-4 px-4 rounded-xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-blue-600/40 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              {isProcessing ? 'Processing...' : 'Confirm and Proceed to Payment ✈️'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PassengerDetails;