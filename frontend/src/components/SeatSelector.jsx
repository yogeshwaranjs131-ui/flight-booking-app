import { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';

function SeatSelector({ onSelect }) {
  const [selectedClass, setSelectedClass] = useState('Economy');
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);

  // 3 Classes Configuration with 30+ Window Seats and specific pricing
  const classesConfig = {
    First: {
      name: 'First Class',
      rows: ['1', '2'],
      cols: ['A', 'B', 'C', 'D'],
      rowPrices: { '1': 35000, '2': 30000 },
      description: 'Ultra Luxury Suites & Private Space'
    },
    Business: {
      name: 'Business Class',
      rows: ['3', '4', '5', '6'],
      cols: ['A', 'B', 'C', 'D', 'E', 'F'],
      rowPrices: { '3': 22000, '4': 20000, '5': 18000, '6': 16000 },
      description: 'Lie-flat seats & Gourmet Dining'
    },
    Economy: {
      name: 'Economy Class',
      rows: ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
      cols: ['A', 'B', 'C', 'D', 'E', 'F'], // 10 rows * 6 cols = 60 seats (Over 30 window seats total!)
      rowPrices: { 
        '7': 9500, '8': 9000, '9': 8500, '10': 8000, 
        '11': 7500, '12': 7000, '13': 6800, '14': 6500, '15': 6200, '16': 6000 
      },
      description: 'Comfortable seating with scenic window options'
    }
  };

  const currentConfig = classesConfig[selectedClass];
  const windowColumns = new Set(currentConfig.cols.length === 4 ? ['A', 'D'] : ['A', 'F']);

  const handleSeatClick = (seatNumber, seatPrice) => {
    const isAlreadySelected = selectedSeatNumbers.includes(seatNumber);
    let updatedSeats;

    if (isAlreadySelected) {
      updatedSeats = selectedSeatNumbers.filter((num) => num !== seatNumber);
    } else {
      if (selectedSeatNumbers.length >= 6) {
        alert("You can select a maximum of 6 seats per booking.");
        return;
      }
      updatedSeats = [...selectedSeatNumbers, seatNumber];
    }

    setSelectedSeatNumbers(updatedSeats);

    // Calculate total price dynamically across rows/classes
    const totalPrice = updatedSeats.reduce((sum, num) => {
      const matchRow = num.match(/^(\d+)/);
      if (!matchRow) return sum + 6500;
      const r = matchRow[1];
      
      for (const clsKey of Object.keys(classesConfig)) {
        if (classesConfig[clsKey].rowPrices[r]) {
          return sum + classesConfig[clsKey].rowPrices[r];
        }
      }
      return sum + 6500;
    }, 0);

    if (onSelect) {
      onSelect(updatedSeats, totalPrice, selectedClass);
    }
  };

  return (
    <div className="my-8 p-6 md:p-10 bg-slate-950 text-white rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden perspective-distant">
      {/* 3D Cinematic Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Class Selection Tabs (3 Classes) */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {Object.keys(classesConfig).map((clsKey) => (
            <button
              key={clsKey}
              type="button"
              onClick={() => {
                setSelectedClass(clsKey);
                setSelectedSeatNumbers([]); // Reset selection when switching class
              }}
              className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 cursor-pointer ${
                selectedClass === clsKey
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 border border-blue-400'
                  : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {classesConfig[clsKey].name}
            </button>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
            {currentConfig.description}
          </p>
          <p className="text-sm text-slate-400 mt-1">🪟 Over 30+ Window Seats available with scenic view perspectives</p>
        </div>

        {/* 3D Aircraft Cabin Container */}
        <div className="max-w-xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-4xl p-6 shadow-inner transform-gpu rotate-x-2">
          
          <div className="text-center pb-4 border-b border-slate-800 mb-6">
            <div className="text-xs font-extrabold text-blue-400 tracking-widest uppercase">✈️ Cockpit Direction (Front)</div>
          </div>

          {/* Seat Grid Map */}
          <div className="flex flex-col gap-3 items-center">
            {currentConfig.rows.map((row) => (
              <div key={row} className="flex items-center gap-4">
                <span className="text-xs text-slate-500 w-6 text-right font-mono font-bold">{row}</span>
                <div className="flex gap-2">
                  {currentConfig.cols.map((col) => {
                    const seatNumber = `${row}${col}`;
                    const isSelected = selectedSeatNumbers.includes(seatNumber);
                    const seatPrice = currentConfig.rowPrices[row] || 6500;
                    const isWindow = windowColumns.has(col);

                    return (
                      <button
                        key={seatNumber}
                        type="button"
                        onClick={() => handleSeatClick(seatNumber, seatPrice)}
                        className={`w-11 h-11 rounded-xl text-xs font-bold transition-all transform hover:scale-110 flex flex-col items-center justify-center border shadow-md cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/40 scale-105'
                            : isWindow
                            ? 'bg-blue-950/90 text-blue-300 border-blue-500/60 hover:bg-blue-900'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        title={`${seatNumber} - ${isWindow ? 'Window Seat' : 'Standard Seat'} - ${formatCurrency(seatPrice)}`}
                      >
                        <span className="font-mono text-[11px]">{seatNumber}</span>
                        {isWindow && <span className="text-[9px] text-blue-400">🪟</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend Footer */}
          <div className="flex justify-center gap-6 mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-950 border border-blue-500"></span> Window Seat</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span> Standard</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span> Selected</span>
          </div>
        </div>

        {/* Footer Summary Bar */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/10 gap-4 max-w-xl mx-auto">
          <div>
            <p className="text-xs text-slate-400">Selected Seats ({selectedClass}):</p>
            <p className="text-base font-bold text-emerald-400">
              {selectedSeatNumbers.length > 0 ? selectedSeatNumbers.join(', ') : 'No seats selected'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Seat Fare</span>
            <span className="text-lg font-extrabold text-blue-400">
              {formatCurrency(selectedSeatNumbers.reduce((sum, num) => {
                const r = num.match(/^(\d+)/)?.[1];
                for (const clsKey of Object.keys(classesConfig)) {
                  if (classesConfig[clsKey].rowPrices[r]) return sum + classesConfig[clsKey].rowPrices[r];
                }
                return sum + 6500;
              }, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelector;