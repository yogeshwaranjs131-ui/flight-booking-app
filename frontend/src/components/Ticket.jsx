import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { FaPlaneDeparture, FaDownload, FaHome } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

function Ticket({ booking, onCancel }) {
  const ticketRef = useRef();

  if (!booking) {
    return null;
  }

  const { _id, flight, passengers = [], seats = [], createdAt, pnr, status } = booking;

  if (!flight) {
    return (
      <div className="bg-[#0b1329] text-white rounded-4xl shadow-lg p-6 my-4 border border-red-500/30">
        <p className="text-red-400 font-semibold">Flight details not available for this booking.</p>
        <p className="text-sm text-slate-400 font-mono mt-1">PNR: {pnr || 'N/A'}</p>
        <div className="mt-4">
          <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
            <FaHome /> Back to Home Page
          </Link>
        </div>
      </div>
    );
  }

  const bookingDate = createdAt;
  const firstPassengerName = passengers?.[0]?.name || 'Passenger';
  const seatList = Array.isArray(seats) ? seats : [seats].filter(Boolean);
  const flightClass = booking.class || 'Economy';
  const totalAmount = booking.totalPrice ? `₹${booking.totalPrice.toLocaleString('en-IN')}` : '₹4,500';

  const departureDate = flight?.departureDate || (bookingDate ? formatDate(bookingDate) : '12 SEP 2026');
  const departureTime = flight?.departureTime || '21:40';
  const arrivalDate = flight?.arrivalDate || departureDate;
  const arrivalTime = flight?.arrivalTime || '23:30';
  const boardingZone = flight?.boardingZone || 'Zone A';

  const fromCode = flight?.departureAirport?.code || flight?.from || 'CNN';
  const fromCity = flight?.departureAirport?.name || flight?.departureAirport?.city || 'Kannur International Airport';
  
  const toCode = flight?.arrivalAirport?.code || flight?.to || 'DEL';
  const toCity = flight?.arrivalAirport?.name || flight?.arrivalAirport?.city || 'Indira Gandhi International Airport, T-2';

  const calculateDuration = (depTime, arrTime) => {
    try {
      const [depH, depM] = depTime.split(':').map(Number);
      const [arrH, arrM] = arrTime.split(':').map(Number);
      
      let depTotalMins = depH * 60 + depM;
      let arrTotalMins = arrH * 60 + arrM;
      
      if (arrTotalMins < depTotalMins) {
        arrTotalMins += 24 * 60;
      }
      
      const diffMins = arrTotalMins - depTotalMins;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} hrs`;
    } catch (e) {
      return '03:50 hrs';
    }
  };

  const stopsText = flight?.stopsText || (flight?.stops > 0 ? `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}: ${flight?.layoverAirport || 'BLR'}` : 'Non-Stop');
  const layoverDuration = flight?.layoverDuration || (flight?.stops > 0 ? '03:15 hrs Layover' : calculateDuration(departureTime, arrivalTime));

  const qrCodePayload = JSON.stringify({
    pnr: pnr,
    passenger: firstPassengerName,
    flight: flight?.flightNumber || '6E-2143',
    route: `${fromCode} -> ${toCode}`,
    seat: seatList.join(', ') || '12A',
    zone: boardingZone,
    departure: `${departureDate} ${departureTime}`,
    status: status || 'Confirmed'
  });

  const handleDownloadPDF = () => {
    const printContent = ticketRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // A4 ஒரே பக்கத்தில் மட்டும் (Single Page Fit) வருவதற்கு ஸ்டைல்ஸ் குறைக்கப்பட்டுள்ளன
    document.body.innerHTML = `
      <style>
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          body {
            background-color: #0b1329 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            transform: scale(0.85);
            transform-origin: top center;
            page-break-after: avoid;
            page-break-before: avoid;
          }
        }
      </style>
      <div class="print-container" style="background-color: #0b1329; color: white; padding: 10px; border-radius: 16px; font-family: sans-serif;">
        ${printContent}
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-4 px-2 print:hidden">
        <Link 
          to="/" 
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-white/10 shadow-md"
        >
          <FaHome /> Back to Home Page
        </Link>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <FaDownload /> Download Ticket PDF (Single A4 Page)
        </button>
      </div>

      <div ref={ticketRef} className="max-w-4xl mx-auto bg-[#0b1329] text-white rounded-4xl p-8 border border-white/10 shadow-2xl relative overflow-hidden font-sans my-2">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              <FaPlaneDeparture />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wide">{flight?.airline || 'IndiGo E-TICKET'}</h1>
              <p className="text-xs text-blue-400 font-mono">PNR: {pnr}</p>
            </div>
          </div>
          <div>
            <span className={`text-xs font-extrabold px-4 py-1.5 rounded-full tracking-wider uppercase ${status?.toLowerCase() === 'cancelled' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
              {status || 'Confirmed'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111c38] border border-white/10 rounded-2xl p-5 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">FLIGHT DETAILS</span>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-lg border border-blue-500/30">
                  {flight?.flightNumber || '6E-2143'}
                </span>
              </div>

              <div className="flex justify-between items-center my-6">
                <div className="w-1/3">
                  <h2 className="text-3xl font-black tracking-wider text-white">{fromCode}</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-tight">{fromCity}</p>
                </div>

                <div className="w-1/3 px-2 text-center flex flex-col items-center">
                  <div className="w-full flex items-center justify-center relative my-1">
                    <div className="border-t border-dashed border-slate-500 w-full absolute"></div>
                    <FaPlaneDeparture className="relative bg-[#111c38] px-2 text-blue-400 text-lg" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">{stopsText}</span>
                  <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded mt-1 border border-blue-500/20">
                    {layoverDuration}
                  </span>
                </div>

                <div className="w-1/3 text-right">
                  <h2 className="text-3xl font-black tracking-wider text-white">{toCode}</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-tight">{toCity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider mb-1">Departure</span>
                  <span className="font-bold text-sm text-white block">{departureDate}</span>
                  <span className="text-blue-400 font-mono font-bold text-base">{departureTime}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block uppercase tracking-wider mb-1">Arrival</span>
                  <span className="font-bold text-sm text-white block">{arrivalDate}</span>
                  <span className="text-blue-400 font-mono font-bold text-base">{arrivalTime}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111c38] border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                👤 PASSENGER & MANIFEST
              </p>
              <div className="grid grid-cols-4 text-xs text-slate-400 border-b border-white/10 pb-2 mb-3 uppercase tracking-wider font-semibold">
                <div>Passenger</div>
                <div>Seat</div>
                <div>Zone</div>
                <div>Class</div>
              </div>
              <div className="grid grid-cols-4 text-sm font-bold items-center">
                <div className="text-white truncate">{firstPassengerName}</div>
                <div className="text-blue-400 font-mono">🪟 {seatList.join(', ') || '12A'}</div>
                <div className="text-amber-400 font-mono">{boardingZone}</div>
                <div className="text-white">{flightClass}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 flex-wrap gap-4 bg-[#111c38]/50 p-4 rounded-2xl border border-white/5">
              <div>
                <p className="text-xs text-slate-400">Booking Date: <span className="text-white font-medium">{bookingDate ? formatDate(bookingDate) : 'N/A'}</span></p>
                <p className="text-[11px] text-slate-500 mt-0.5">Please present this e-ticket at the airport check-in counter.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Paid</span>
                  <span className="text-lg font-extrabold text-blue-400">{totalAmount}</span>
                </div>

                {status !== 'Cancelled' && onCancel && (
                  <button
                    onClick={() => onCancel(_id)}
                    className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-bold px-3 py-2 rounded-xl border border-red-500/30 transition-all cursor-pointer print:hidden"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#111c38] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative">
            <div className="w-full">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">SCAN BOARDING PASS</p>
              
              <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mx-auto mb-4 border-2 border-blue-500/50">
                <QRCodeSVG 
                  value={qrCodePayload} 
                  size={130}
                  bgColor={"#ffffff"}
                  fgColor={"#0b1329"}
                  level={"H"}
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="w-full space-y-3 text-xs border-t border-white/10 pt-4">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">ZONE</span>
                <span className="font-bold font-mono text-amber-400">{boardingZone}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">GATE</span>
                <span className="font-bold font-mono">B12</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">BOARDING</span>
                <span className="font-bold font-mono">{departureTime}</span>
              </div>
            </div>

            <div className="w-full border-t border-white/10 pt-4 mt-4 text-left">
              <p className="text-[10px] text-slate-400 uppercase">PASSENGER</p>
              <p className="font-bold text-sm text-blue-400 truncate">{firstPassengerName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ticket;