import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import bookingService from '../services/bookingService';
import { 
  Plane, Calendar, Clock, User, Mail, Phone, 
  CheckCircle, ArrowRight, ArrowLeft, CreditCard, 
  Download, ShieldCheck, Sparkles, Armchair 
} from 'lucide-react';
import flightService from '../services/flightService.js';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Seat Selection State
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Passenger Count State
  const [passengerCount, setPassengerCount] = useState(1);

  // Passenger Form State
  const [passengers, setPassengers] = useState([
    { name: '', email: '', phone: '' }
  ]);

  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'upi',
    cardNumber: '',
    upiId: '',
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });


  // Mock available seats (e.g., 12 seats layout)
  const rows = ['1', '2', '3', '4'];
  const cols = ['A', 'B', 'C'];

  // Fetch flight details based on ID passed in URL
  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await flightService.getFlightById(id);
        const data = response.data;
        if (data.success) {
          setFlight(data.data);
        }
      } catch (error) {
        console.error("Error fetching flight:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFlightDetails();
    }
  }, [id]);

  useEffect(() => {
    setPassengers(Array.from({ length: passengerCount }, () => ({ name: '', email: '', phone: '' })));
  }, [passengerCount]);

  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setPassengerCount(count);
    setSelectedSeats([]); // Reset selected seats when passenger count changes
  };

  const handlePassengerInfoChange = (index, e) => {
    const newPassengers = [...passengers];
    newPassengers[index][e.target.name] = e.target.value;
    setPassengers(newPassengers);
  };

  const handleContactInfoChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleCompleteBooking = async (e) => {
    e.preventDefault();
    if (selectedSeats.length !== passengerCount) {
      setError('The number of selected seats must match the number of passengers.');
      return;
    }
    setError(null);
    setLoading(true);

    const bookingData = {
      flightId: flight._id,
      passengers: passengers.map(p => ({
        name: p.name,
        age: 30, // Default age
        gender: 'Male', // Default gender
      })),
      seats: selectedSeats,
      totalPrice: flight.price * passengerCount,
    };

    try {
      const response = await bookingService.createBooking(bookingData);
      if (response.data.success) {
        setBooking(response.data.data);
        setIsConfirmed(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to simulate Ticket PDF Download
  const handleDownloadPDF = async () => {
    if (!booking?._id) {
      alert("Booking details not found.");
      return;
    }
    try {
      const response = await bookingService.downloadTicket(booking._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${booking.pnr}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download ticket:", error);
      alert("Could not download the ticket. Please try again.");
    }
  };

  if (loading) {
    return ( 
      <div className="min-h-screen flex items-center justify-center bg-slate-50"> 
        <div className="text-indigo-600 font-semibold text-lg animate-pulse">Loading Flight & Booking Details...</div>
      </div>
    );
  }

  const handleSeatClick = (seatNumber) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      }
      if (prev.length < passengerCount) {
        return [...prev, seatNumber];
      }
      return prev; // Do not add more seats than passengers
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" /> Secure Flight Reservation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Complete Your Flight Booking
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Select your seat, fill in passenger details, and get your instant ticket.
          </p>
        </div>

        {!isConfirmed ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            
            {/* Progress Bar Header */}
            <div className="bg-slate-900 px-8 py-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">Step {step} of 3</span>
                <h2 className="text-xl font-bold">
                  {step === 1 && 'Select Your Seat'}
                  {step === 2 && 'Passenger Details'}
                  {step === 3 && 'Payment & Checkout'}
                </h2>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      step === i ? 'w-8 bg-indigo-500' : step > i ? 'w-2.5 bg-emerald-400' : 'w-2.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-10">
              
              {/* FLIGHT SUMMARY CARD */}
              {flight && (
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 grow">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{flight.airline} ({flight.flightNumber})</h4>
                      <p className="text-xs text-slate-600">
                        {flight.departureAirport?.city} → {flight.arrivalAirport?.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="passengerCount" className="text-sm font-semibold text-slate-700">Passengers:</label>
                    <select id="passengerCount" value={passengerCount} onChange={handlePassengerCountChange} className="rounded-md border-slate-300 shadow-sm">
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="text-xl font-extrabold text-indigo-600">
                      ₹{flight.price * passengerCount}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 1: SEAT SELECTION */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Armchair className="text-indigo-600" /> Choose Your Seat
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                    <div className="w-48 bg-slate-200 h-8 rounded-t-full mb-6 flex items-center justify-center text-xs font-bold text-slate-600 tracking-wider">
                      COCKPIT / FRONT
                    </div>
                    
                    <div className="space-y-3 w-full max-w-xs">
                      {rows.map((row) => (
                        <div key={row} className="flex justify-center gap-4">
                          {cols.map((col) => {
                            const seatNumber = `${row}${col}`;
                            const isSelected = selectedSeats.includes(seatNumber);
                            return (
                              <button
                                key={seatNumber}
                                type="button"
                                onClick={() => handleSeatClick(seatNumber)}
                                className={`w-12 h-12 rounded-xl font-bold text-sm border transition-all flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                                }`}
                              >
                                {seatNumber}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-6">
                      Selected Seats: <strong className="text-indigo-600">{selectedSeats.join(', ') || 'None'}</strong>
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      disabled={selectedSeats.length !== passengerCount}
                      onClick={() => setStep(2)}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-all ${
                        selectedSeats.length === passengerCount
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Next: Passenger Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PASSENGER DETAILS */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800">Enter Passenger Information ({passengerCount} {passengerCount > 1 ? 'Passengers' : 'Passenger'})</h3>
                  
                  {passengers.map((passenger, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <h4 className="font-semibold">Passenger {index + 1} (Seat: {selectedSeats[index]})</h4>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                          <input 
                            type="text" 
                            required
                            name="name"
                            value={passenger.name}
                            onChange={(e) => handlePassengerInfoChange(index, e)}
                            placeholder="Yogeshwaran U"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Contact Information (for e-ticket)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                          <input type="email" required name="email" value={contactInfo.email} onChange={handleContactInfoChange} placeholder="yogesh@example.com" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-800" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                          <input type="tel" required name="phone" value={contactInfo.phone} onChange={handleContactInfoChange} placeholder="+91 9876543210" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      disabled={passengers.some(p => !p.name) || !contactInfo.email || !contactInfo.phone}
                      onClick={() => setStep(3)}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-all ${
                        !passengers.some(p => !p.name) && contactInfo.email && contactInfo.phone
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Next: Payment <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & CHECKOUT */}
              {step === 3 && (
                <form onSubmit={handleCompleteBooking} className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="text-indigo-600" /> Choose Payment Method
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <label className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${
                      paymentDetails.paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200'
                    }`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="upi" 
                        checked={paymentDetails.paymentMethod === 'upi'}
                        onChange={handlePaymentDetailsChange}
                        className="text-indigo-600"
                      />
                      <span className="font-semibold text-slate-800">UPI / GPay / PhonePe</span>
                    </label>

                    <label className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${
                      paymentDetails.paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200'
                    }`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card" 
                        checked={paymentDetails.paymentMethod === 'card'}
                        onChange={handlePaymentDetailsChange}
                        className="text-indigo-600"
                      />
                      <span className="font-semibold text-slate-800">Credit / Debit Card</span>
                    </label>
                  </div>
                  
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                      <strong className="font-bold">Booking Failed: </strong>
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}

                  {paymentDetails.paymentMethod === 'upi' ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Enter UPI ID</label>
                      <input 
                        type="text" 
                        required
                        name="upiId"
                        value={paymentDetails.upiId}
                        onChange={handlePaymentDetailsChange}
                        placeholder="username@oksbi"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-800"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Card Number</label>
                      <input 
                        type="text" 
                        required
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentDetailsChange}
                        placeholder="4111 2222 3333 4444"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-800"
                      />
                    </div>
                  )}

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800">Seats: {selectedSeats.join(', ')} | {flight?.airline}</h4>
                      <p className="text-xs text-slate-500">{passengerCount} {passengerCount > 1 ? 'Passengers' : 'Passenger'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Amount</span>
                      <span className="text-lg font-bold text-indigo-600">₹{flight?.price * passengerCount}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all cursor-pointer disabled:bg-slate-400"
                    >
                      Pay & Confirm Booking <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        ) : (
          /* SUCCESS CONFIRMATION & TICKET DOWNLOAD SCREEN */
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Booking Confirmed Successfully!</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Your PNR is <strong className="text-indigo-600">{booking?.pnr}</strong>. We have sent your flight ticket details to <strong className="text-slate-800">{contactInfo.email}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-md mx-auto text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Airline:</span>
                <span className="font-bold text-slate-800">{flight?.airline} ({flight?.flightNumber})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Route:</span>
                <span className="font-bold text-slate-800">{flight?.departureAirport?.city} → {flight?.arrivalAirport?.city}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Seat Number:</span>
                <span className="font-bold text-indigo-600">{selectedSeats.join(', ')}</span>
              </div>
              {passengers.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">Passenger {i+1}:</span>
                  <span className="font-bold text-slate-800">{p.name}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Ticket (PDF)
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}