
import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency.js";

function SeatSelector({ onSelect }) {
  const [selectedClass, setSelectedClass] = useState("Economy");
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);

  // ============================================================
  // SEAT CLASS CONFIGURATION
  // ============================================================

  const classesConfig = {
    First: {
      name: "First Class",
      rows: ["1", "2"],
      cols: ["A", "B", "C", "D"],
      rowPrices: {
        1: 35000,
        2: 30000,
      },
      description: "Ultra Luxury Suites & Private Space",
    },

    Business: {
      name: "Business Class",
      rows: ["3", "4", "5", "6"],
      cols: ["A", "B", "C", "D", "E", "F"],
      rowPrices: {
        3: 22000,
        4: 20000,
        5: 18000,
        6: 16000,
      },
      description: "Lie-flat seats & Gourmet Dining",
    },

    Economy: {
      name: "Economy Class",
      rows: [
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
      ],
      cols: ["A", "B", "C", "D", "E", "F"],
      rowPrices: {
        7: 9500,
        8: 9000,
        9: 8500,
        10: 8000,
        11: 7500,
        12: 7000,
        13: 6800,
        14: 6500,
        15: 6200,
        16: 6000,
      },
      description: "Comfortable seating with scenic window options",
    },
  };

  const currentConfig = classesConfig[selectedClass];

  // Window seats:
  // 4-column layout => A & D
  // 6-column layout => A & F
  const windowColumns = new Set(
    currentConfig.cols.length === 4 ? ["A", "D"] : ["A", "F"]
  );

  // ============================================================
  // GET SEAT PRICE
  // ============================================================

  const getSeatPrice = (seatNumber) => {
    const match = seatNumber.match(/^(\d+)/);

    if (!match) {
      return 6500;
    }

    const row = match[1];

    return currentConfig.rowPrices[row] || 6500;
  };

  // ============================================================
  // CALCULATE TOTAL
  // ============================================================

  const calculateTotalPrice = (seats) => {
    return seats.reduce((total, seatNumber) => {
      return total + getSeatPrice(seatNumber);
    }, 0);
  };

  // ============================================================
  // SEND SELECTION TO PARENT
  // ============================================================

  const sendSelectionToParent = (seats, className = selectedClass) => {
    const totalPrice = calculateTotalPrice(seats);

    if (onSelect) {
      onSelect(seats, totalPrice, className);
    }
  };

  // ============================================================
  // SEAT CLICK
  // ============================================================

  const handleSeatClick = (seatNumber) => {
    const isAlreadySelected =
      selectedSeatNumbers.includes(seatNumber);

    let updatedSeats;

    // Remove selected seat
    if (isAlreadySelected) {
      updatedSeats = selectedSeatNumbers.filter(
        (seat) => seat !== seatNumber
      );
    }

    // Add new seat
    else {
      if (selectedSeatNumbers.length >= 6) {
        alert("You can select a maximum of 6 seats per booking.");
        return;
      }

      updatedSeats = [
        ...selectedSeatNumbers,
        seatNumber,
      ];
    }

    setSelectedSeatNumbers(updatedSeats);

    sendSelectionToParent(updatedSeats);
  };

  // ============================================================
  // CHANGE CLASS
  // ============================================================

  const handleClassChange = (className) => {
    setSelectedClass(className);

    // Reset seats when changing class
    setSelectedSeatNumbers([]);

    // IMPORTANT:
    // Tell parent that previous seats and fare are cleared
    if (onSelect) {
      onSelect([], 0, className);
    }
  };

  // ============================================================
  // TOTAL PRICE
  // ============================================================

  const totalSeatFare = calculateTotalPrice(
    selectedSeatNumbers
  );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="my-8 p-6 md:p-10 bg-slate-950 text-white rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden perspective-distant">

      {/* ======================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">

        {/* ====================================================
            CLASS TABS
        ==================================================== */}

        <div className="flex flex-wrap justify-center gap-3 mb-6">

          {Object.keys(classesConfig).map((clsKey) => (
            <button
              key={clsKey}
              type="button"
              onClick={() => handleClassChange(clsKey)}
              className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 cursor-pointer ${
                selectedClass === clsKey
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 border border-blue-400"
                  : "bg-slate-900 text-slate-400 border border-white/10 hover:text-white"
              }`}
            >
              {classesConfig[clsKey].name}
            </button>
          ))}

        </div>

        {/* ====================================================
            CLASS DESCRIPTION
        ==================================================== */}

        <div className="text-center mb-6">

          <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
            {currentConfig.description}
          </p>

          <p className="text-sm text-slate-400 mt-1">
            🪟 Window seats available with scenic view perspectives
          </p>

        </div>

        {/* ====================================================
            AIRCRAFT CABIN
        ==================================================== */}

        <div className="max-w-xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-4xl p-6 shadow-inner transform-gpu rotate-x-2">

          {/* COCKPIT */}

          <div className="text-center pb-4 border-b border-slate-800 mb-6">

            <div className="text-xs font-extrabold text-blue-400 tracking-widest uppercase">
              ✈️ Cockpit Direction (Front)
            </div>

          </div>

          {/* ==================================================
              SEAT GRID
          ================================================== */}

          <div className="flex flex-col gap-3 items-center">

            {currentConfig.rows.map((row) => (

              <div
                key={row}
                className="flex items-center gap-4"
              >

                {/* ROW NUMBER */}

                <span className="text-xs text-slate-500 w-6 text-right font-mono font-bold">
                  {row}
                </span>

                {/* SEATS */}

                <div className="flex gap-2">

                  {currentConfig.cols.map((col) => {

                    const seatNumber = `${row}${col}`;

                    const isSelected =
                      selectedSeatNumbers.includes(
                        seatNumber
                      );

                    const seatPrice =
                      currentConfig.rowPrices[row] ||
                      6500;

                    const isWindow =
                      windowColumns.has(col);

                    return (
                      <button
                        key={seatNumber}
                        type="button"
                        onClick={() =>
                          handleSeatClick(seatNumber)
                        }
                        className={`w-11 h-11 rounded-xl text-xs font-bold transition-all transform hover:scale-110 flex flex-col items-center justify-center border shadow-md cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/40 scale-105"
                            : isWindow
                            ? "bg-blue-950/90 text-blue-300 border-blue-500/60 hover:bg-blue-900"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }`}
                        title={`${seatNumber} - ${
                          isWindow
                            ? "Window Seat"
                            : "Standard Seat"
                        } - ${formatCurrency(
                          seatPrice
                        )}`}
                      >

                        <span className="font-mono text-[11px]">
                          {seatNumber}
                        </span>

                        {isWindow && (
                          <span className="text-[9px] text-blue-400">
                            🪟
                          </span>
                        )}

                      </button>
                    );
                  })}

                </div>

              </div>

            ))}

          </div>

          {/* ==================================================
              LEGEND
          ================================================== */}

          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400">

            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-950 border border-blue-500" />
              Window Seat
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              Standard
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              Selected
            </span>

          </div>

        </div>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/10 gap-4 max-w-xl mx-auto">

          <div>

            <p className="text-xs text-slate-400">
              Selected Seats ({currentConfig.name}):
            </p>

            <p className="text-base font-bold text-emerald-400">

              {selectedSeatNumbers.length > 0
                ? selectedSeatNumbers.join(", ")
                : "No seats selected"}

            </p>

          </div>

          <div className="text-right">

            <span className="text-xs text-slate-400 block">
              Total Seat Fare
            </span>

            <span className="text-lg font-extrabold text-blue-400">
              {formatCurrency(totalSeatFare)}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SeatSelector;
