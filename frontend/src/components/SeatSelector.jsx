import { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';

function SeatSelector({ seats = [], onSelect }) {
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);

  // Generate 30 default seats if not provided by backend
  const defaultThirtySeats = [];
  const rows = ['1', '2', '3', '4', '5'];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  const rowPrices = { '1': 25000, '2': 20000, '3': 15000, '4': 10000, '5': 6500 };

  rows.forEach((row) => {
    cols.forEach((col) => {
      defaultThirtySeats.push({ 
        number: `${row}${col}`, 
        price: rowPrices[row] || 8000,
        isAvailable: true 
      });
    });
  });

  const seatList = seats && seats.length > 0 ? seats : defaultThirtySeats;

  const handleSeatClick = (seat) => {
    const seatNumber = seat.number || seat;
    const isBooked = seat.isAvailable === false;
    
    if (isBooked) return; // Cannot click already booked seats

    const isAlreadySelected = selectedSeatNumbers.includes(seatNumber);
    
    let updatedSeats;
    if (isAlreadySelected) {
      updatedSeats = selectedSeatNumbers.filter((num) => num !== seatNumber);
    } else {
      updatedSeats = [...selectedSeatNumbers, seatNumber];
    }

    setSelectedSeatNumbers(updatedSeats);
    
    // Calculate total price based on selected seats
    const totalPrice = updatedSeats.reduce((sum, num) => {
      const foundSeat = seatList.find(s => (s.number || s) === num);
      const price = foundSeat?.price || 6500;
      return sum + price;
    }, 0);
    
    onSelect(updatedSeats, totalPrice);
  };

  return (
    <div className="my-8 p-6 border-t border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Select Your Seats (30 Seats Available)</h3>
      <p className="text-sm text-gray-500 mb-4">Prices range from ₹6,500 (Row 5) up to ₹25,000 (Row 1)</p>
      
      {/* Legend */}
      <div className="flex gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white border border-gray-300 rounded shadow-sm"></div>
          <span className="text-gray-700 font-medium">Available (White)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-600 rounded"></div>
          <span className="text-gray-700 font-medium">Booked / Selected (Green)</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 max-w-lg">
        {seatList.map((seat) => {
          const seatNumber = seat.number || seat;
          const isBooked = seat.isAvailable === false;
          const isSelected = selectedSeatNumbers.includes(seatNumber);
          const seatPrice = seat.price || 6500;

          // If booked or selected -> Green, Otherwise -> White
          const isGreen = isBooked || isSelected;

          return (
            <button
              key={seatNumber}
              type="button"
              disabled={isBooked}
              onClick={() => handleSeatClick(seat)}
              className={`p-2 border rounded text-center transition-colors flex flex-col justify-center items-center ${
                isGreen
                  ? 'bg-green-600 text-white border-green-600 shadow-md cursor-pointer'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 cursor-pointer shadow-sm'
              }`}
            >
              <span className="font-bold text-sm">{seatNumber}</span>
              <span className={`text-[10px] ${isGreen ? 'text-green-100' : 'text-gray-500'}`}>
                {formatCurrency(seatPrice)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SeatSelector;