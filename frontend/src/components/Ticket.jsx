import React from 'react';
import { formatDate } from '../utils/formatDate';
import { FaPlaneDeparture } from 'react-icons/fa';

function Ticket({ booking, onCancel }) {
  if (!booking) {
    return null;
  }

  const { _id, flight, passengers = [], seats = [], createdAt, pnr, status, totalPrice } = booking;

  // Flight டேட்டா இல்லாவிட்டால் எரர் அடிக்காமல் இருக்க ஒரு பாதுகாப்பு செக்
  if (!flight) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 my-4 border border-red-200">
        <p className="text-red-500 font-semibold">Flight details not available for this booking.</p>
        <p className="text-sm text-gray-500">PNR: {pnr || 'N/A'}</p>
      </div>
    );
  }

  const bookingDate = createdAt;
  const firstPassengerName = passengers?.[0]?.name || 'Passenger';
  const seatList = Array.isArray(seats) ? seats : [seats].filter(Boolean);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden my-4 border border-gray-200 transition-transform hover:shadow-xl hover:-translate-y-1">
      {/* Header */}
      <div className="bg-indigo-blue text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <FaPlaneDeparture className="text-3xl mr-3" />
          <h2 className="text-2xl font-bold">{flight?.airline || 'Airline'}</h2>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">Boarding Pass</p>
          <p className="text-sm opacity-80">PNR: <span className="font-mono">{pnr}</span></p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Passenger and Seat Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Passenger</p>
            <p className="font-bold text-lg text-gray-800">{firstPassengerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Seat(s)</p>
            <p className="font-bold text-lg text-gray-800">{seatList.join(', ') || 'N/A'}</p>
          </div>
        </div>

        {/* Flight Route Info */}
        <div className="flex items-center justify-between text-center mb-6">
          <div>
            <p className="text-2xl font-bold text-gray-800">{flight?.departureAirport?.code || flight?.from || 'N/A'}</p>
            <p className="text-sm text-gray-500">{flight?.departureAirport?.city || ''}</p>
          </div>
          <div className="grow mx-4">
            <div className="w-full h-px bg-gray-300 relative">
              <FaPlaneDeparture className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 text-indigo-blue text-xl" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">{flight?.arrivalAirport?.code || flight?.to || 'N/A'}</p>
            <p className="text-sm text-gray-500">{flight?.arrivalAirport?.city || ''}</p>
          </div>
        </div>

        {/* More Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 border-t pt-4">
          <p><span className="font-semibold">Flight:</span> {flight?.flightNumber || 'FL-001'}</p>
          <p><span className="font-semibold">Date:</span> {bookingDate ? formatDate(bookingDate) : 'N/A'}</p>
          <p><span className="font-semibold">Status:</span> <span className={`font-bold ${status?.toLowerCase() === 'cancelled' ? 'text-red-500' : 'text-green-600'}`}>{status || 'Confirmed'}</span></p>
        </div>
      </div>

      {/* Footer with Cancel Button */}
      <div className="bg-gray-50 p-4 flex justify-end items-center">
        {status !== 'Cancelled' && onCancel && (
          <button
            onClick={() => onCancel(_id)}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
          >Cancel Booking</button>
        )}
      </div>
    </div>
  );
}

export default Ticket;