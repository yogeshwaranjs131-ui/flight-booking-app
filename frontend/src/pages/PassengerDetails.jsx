import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive flight, selectedSeats, and totalPrice from the previous page (FlightDetails)
  const { flight, selectedSeats, totalPrice } = location.state || {};

  // Initialize an array of passenger objects based on the number of selected seats
  const [passengers, setPassengers] = useState(
    () => Array.from({ length: selectedSeats?.length || 0 }, () => ({
      name: '',
      age: '',
      gender: 'Male',
    }))
  );

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
    
    // Ensure flight object safely carries _id and flightId for backend validation
    const sanitizedFlight = {
      ...flight,
      _id: flight?._id || flight?.id,
      flightId: flight?._id || flight?.id,
    };

    // Calculate a safe fallback total price if totalPrice was somehow missing
    const finalTotalPrice = totalPrice || (selectedSeats?.length * 6500) || 6500;

    // Navigate to the review page, passing totalPrice along with flight, selectedSeats, and passengers
    navigate('/booking-review', {
      state: { 
        flight: sanitizedFlight, 
        selectedSeats, 
        passengers, 
        totalPrice: finalTotalPrice 
      },
    });
  };

  if (!flight || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
        <p className="text-gray-600 mt-2">No flight or seat information was provided.</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors cursor-pointer">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Passenger Details</h2>
      <p className="text-gray-600 mb-8">
        Please enter the details for the <strong>{selectedSeats.length}</strong> passenger(s).
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {passengers.map((passenger, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Passenger {index + 1} (Seat {selectedSeats[index]})</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" name="name" placeholder="Full Name" value={passenger.name} onChange={(e) => handleChange(index, e)} className="md:col-span-2 mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
              <input type="number" name="age" placeholder="Age" value={passenger.age} onChange={(e) => handleChange(index, e)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
              <select name="gender" value={passenger.gender} onChange={(e) => handleChange(index, e)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        ))}
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer">
          Confirm and Proceed to Payment
        </button>
      </form>
    </div>
  );
}

export default PassengerDetails;