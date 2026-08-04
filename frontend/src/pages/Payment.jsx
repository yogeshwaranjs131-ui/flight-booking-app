import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";
import { formatCurrency } from "../utils/formatCurrency";
import { FaCreditCard, FaUniversity, FaMobileAlt, FaGooglePay } from 'react-icons/fa';
import { useAuth } from "../hooks/useAuth";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Receive booking data from the PassengerDetails page
  const { flight, selectedSeats, totalPrice: passedTotalPrice, passengers } = location.state || {};

  const [key, setKey] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fallback to calculate total price if passedTotalPrice is missing
  const totalPrice = passedTotalPrice || (flight?.price ? flight.price * (selectedSeats?.length || 1) : 0);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data } = await paymentService.getKey();
        setKey(data.key);
      } catch (error) {
        console.error("Error fetching Razorpay key", error);
      }
    };
    fetchKey();
  }, []);

  const handleChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create an order on Razorpay via our backend
      const { data: order } = await paymentService.createOrder(totalPrice);

      // 2. Configure Razorpay options
      const options = {
        key: key,
        amount: order.amount,
        currency: "INR",
        name: "Flight Booking",
        description: `Booking for ${flight.airline} flight`,
        order_id: order.id,
        handler: async function (response) {
          // 3. On successful payment, create the booking in our database
          const bookingData = {
            flightId: flight?._id,
            passengers,
            seats: selectedSeats,
            totalPrice,
            paymentDetails: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          };

          try {
            const bookingResponse = await bookingService.createBooking(bookingData);
            const newBooking = bookingResponse.data.data;
            
            // 4. Navigate to the confirmation page
            navigate("/booking-confirmation", { 
              state: { booking: newBooking }, 
              replace: true 
            });
          } catch (bookingError) {
            setError(bookingError.response?.data?.message || "Booking failed after payment. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || passengers[0]?.name,
          email: user?.email || "user@example.com",
          contact: "9999999999",
        },
      };

      // 5. Open the Razorpay checkout modal
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || "Payment initiation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!flight || !selectedSeats || !passengers) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
        <p className="text-gray-600 mt-2">Booking details are missing. Please start over.</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors cursor-pointer">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Complete Your Payment</h2>

      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Booking Summary</h3>
        <div className="space-y-2">
          <p><strong>Flight:</strong> {flight.airline} {flight.flightNumber}</p>
          <p><strong>Route:</strong> {flight.departureAirport?.code || flight.departureAirport || 'COK'} &rarr; {flight.arrivalAirport?.code || flight.arrivalAirport || 'MAA'}</p>
          <p><strong>Seats ({selectedSeats.length}):</strong> {selectedSeats.join(", ")}</p>
          <p className="text-xl font-bold text-indigo-600"><strong>Total Price:</strong> {formatCurrency(totalPrice)}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-700 mb-4">Select Payment Method</h3>

      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setPaymentMethod('upi')}
          className={`py-3 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
            paymentMethod === 'upi' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaMobileAlt size={20} />
          UPI / VPA
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={`py-3 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
            paymentMethod === 'card' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaCreditCard size={20} />
          Credit / Debit Card
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('netbanking')}
          className={`py-3 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
            paymentMethod === 'netbanking' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaUniversity size={20} />
          Net Banking
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('gpay')}
          className={`py-3 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
            paymentMethod === 'gpay' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaGooglePay size={24} />
          GPay QR
        </button>
      </div>

      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* 1. UPI Form Fields */}
        {paymentMethod === 'upi' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Enter UPI ID</label>
            <input 
              type="text" 
              placeholder="e.g., username@oksbi or username@okhdfcbank" 
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              required 
            />
            <p className="text-xs text-gray-500">A payment request will be sent to your UPI app.</p>
          </div>
        )}

        {/* 2. Card Form Fields */}
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input 
                type="text" 
                name="nameOnCard" 
                placeholder="Name on Card" 
                value={paymentDetails.nameOnCard}
                onChange={handleChange} 
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input 
                type="text" 
                name="cardNumber" 
                maxLength="16"
                placeholder="4532 •••• •••• ••••" 
                value={paymentDetails.cardNumber}
                onChange={handleChange} 
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                required 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  name="expiryDate" 
                  placeholder="MM/YY" 
                  value={paymentDetails.expiryDate}
                  onChange={handleChange} 
                  className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input 
                  type="password" 
                  name="cvv" 
                  maxLength="3"
                  placeholder="123" 
                  value={paymentDetails.cvv}
                  onChange={handleChange} 
                  className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Net Banking Selection */}
        {paymentMethod === 'netbanking' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Your Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="sbi">State Bank of India (SBI)</option>
              <option value="hdfc">HDFC Bank</option>
              <option value="icici">ICICI Bank</option>
              <option value="axis">Axis Bank</option>
              <option value="iob">Indian Overseas Bank</option>
            </select>
          </div>
        )}

        {/* 4. Google Pay QR Code Option */}
        {paymentMethod === 'gpay' && (
          <div className="text-center space-y-3 py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="w-36 h-36 bg-white border mx-auto flex flex-col items-center justify-center rounded-lg shadow-sm">
              <FaGooglePay size={50} className="text-blue-600 mb-1" />
              <span className="text-[10px] text-gray-500 font-semibold">SCAN TO PAY</span>
            </div>
            <p className="text-xs text-gray-600">Scan this QR code using Google Pay, PhonePe or Paytm to complete payment.</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 cursor-pointer transition-colors"
        >
          {loading ? 'Processing Payment...' : `Pay ${formatCurrency(totalPrice)}`}
        </button>
      </form>
    </div>
  );
}

export default Payment;