import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { FaPlane, FaUserFriends, FaRupeeSign } from 'react-icons/fa';
import bookingService from '../services/bookingService';

function BookingReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { flight, selectedSeats, passengers, totalPrice: passedTotalPrice } = location.state || {};

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

  const handleProceedToPayment = async () => {
    try {
      const bookingPayload = {
        flightId: flight._id || flight.id,
        passengers: passengers,
        seats: selectedSeats,
        totalPrice: totalPrice, // totalPrice சரியாக இங்கே அனுப்பப்படுகிறது
      };

      const response = await bookingService.createBooking(bookingPayload);
      const bookingData = response.data || response;

      navigate('/booking-confirmation', {
        state: { booking: bookingData },
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert(err.response?.data?.message || "Failed to create booking. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Review Your Booking</h1>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Flight Details Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><FaPlane className="mr-3 text-indigo-600" />Flight Summary</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{fromCode} &rarr; {toCode}</p>
              <p className="text-sm text-gray-500">{airlineName} - {flightNo}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{flight.departureTime ? formatDateTime(flight.departureTime) : 'N/A'}</p>
              <p className="text-sm text-gray-500">Departure</p>
            </div>
          </div>
        </div>

        {/* Passenger Details Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><FaUserFriends className="mr-3 text-indigo-600" />Passengers</h2>
          <ul className="space-y-2">
            {passengers.map((p, index) => (
              <li key={index} className="flex justify-between items-center text-gray-600">
                <span>{index + 1}. {p.name} ({p.age} yrs, {p.gender})</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">Seat: {selectedSeats[index]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Details Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><FaRupeeSign className="mr-3 text-indigo-600" />Price Summary</h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between"><span>Selected Seats ({selectedSeats.length})</span> <span>{formatCurrency(totalBasePrice)}</span></div>
            <div className="flex justify-between"><span>Taxes & Fees (18%)</span> <span>{formatCurrency(totalTaxes)}</span></div>
            <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-2 mt-2"><span>Total Amount</span> <span>{formatCurrency(totalPrice)}</span></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-gray-50 p-6 text-right">
          <button 
            onClick={handleProceedToPayment} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-md"
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingReview;