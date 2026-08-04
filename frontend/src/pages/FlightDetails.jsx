import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import flightService from "../services/flightService";
import Loader from "../components/Loader";
import SeatSelector from "../components/SeatSelector";
import { formatCurrency } from '../utils/formatCurrency.js';
import { FaPlaneDeparture, FaPlaneArrival, FaClock } from 'react-icons/fa';
import { formatDateTime } from '../utils/formatDate.js';

function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: flight, loading, error } = useFetch(() => flightService.getFlightById(id), [id]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const calculateDuration = (start, end) => {
    if (!start || !end) return '2h 30m';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Callback function to receive dynamic seats and calculated total price from SeatSelector
  const handleSeatSelection = (seats, price) => {
    setSelectedSeats(seats);
    setTotalPrice(price);
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to proceed.");
      return;
    }

    // Ensure MongoDB _id is safely normalized to both _id and id so downstream components won't lose it
    const flightIdValue = flight?._id || flight?.id || id;
    const sanitizedFlight = {
      ...flight,
      _id: flightIdValue,
      id: flightIdValue,
    };

    navigate('/passenger-details', {
      state: { flight: sanitizedFlight, selectedSeats, totalPrice },
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!flight) {
    return <p className="text-center">Flight details not found.</p>;
  }

  // Safe fallback for departure and arrival info whether they are objects or direct strings
  const fromCode = flight.departureAirport?.code || flight.from || 'COK';
  const fromCity = flight.departureAirport?.city || flight.from || '';
  const toCode = flight.arrivalAirport?.code || flight.to || 'MAA';
  const toCity = flight.arrivalAirport?.city || flight.to || '';

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      {/* Flight Summary Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
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
              <p className="text-sm text-gray-500">From</p>
              <p className="text-2xl font-bold text-gray-800">{fromCode}</p>
              <p className="text-gray-600">{fromCity}</p>
              <p className="text-sm text-gray-500 mt-1">{flight.departureTime ? formatDateTime(flight.departureTime) : ''}</p>
            </div>

            {/* Route Line */}
            <div className="px-4">
              <div className="flex items-center text-gray-400">
                <FaPlaneDeparture className="text-indigo-600" />
                <div className="grow border-t-2 border-dashed border-gray-300 mx-2"></div>
                <FaPlaneArrival className="text-indigo-600" />
              </div>
              <div className="text-sm text-gray-500 mt-1 flex items-center justify-center">
                <FaClock className="mr-1" />
                {calculateDuration(flight.departureTime, flight.arrivalTime)}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <p className="text-sm text-gray-500">To</p>
              <p className="text-2xl font-bold text-gray-800">{toCode}</p>
              <p className="text-gray-600">{toCity}</p>
              <p className="text-sm text-gray-500 mt-1">{flight.arrivalTime ? formatDateTime(flight.arrivalTime) : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selector Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SeatSelector seats={flight.seats || []} onSelect={handleSeatSelection} />

        {/* Booking Action Footer */}
        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Price</p>
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(totalPrice)}</p>
            {selectedSeats.length > 0 && (
              <p className="text-sm text-gray-500">{selectedSeats.length} seat(s) selected ({selectedSeats.join(', ')})</p>
            )}
          </div>
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className="bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
          >
            Proceed to Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlightDetails;