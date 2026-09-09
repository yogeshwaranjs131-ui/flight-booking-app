import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";
import { formatCurrency } from "../utils/formatCurrency";
import { useAuth } from "../hooks/useAuth";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe Publishable Key using Vite environment variable format
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ flight, selectedSeats, passengers, totalPrice }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Validate payment element setup using elements.submit()
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      // 2. Confirm Payment using Stripe Payment Element
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
          payment_method_data: {
            billing_details: {
              name: user?.name || passengers[0]?.name || "Passenger",
              email: user?.email || "user@example.com",
            },
          },
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        const bookingData = {
          flightId: flight?._id,
          passengers,
          seats: selectedSeats,
          totalPrice,
          paymentDetails: {
            stripe_payment_intent_id: result.paymentIntent.id,
            status: 'Success',
          },
        };

        const bookingResponse = await bookingService.createBooking(bookingData);
        const newBooking = bookingResponse.data.data;

        navigate("/booking-confirmation", {
          state: { booking: newBooking },
          replace: true,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pay with Stripe (Card, UPI, Google Pay, PhonePe, Paytm)</label>
        <PaymentElement />
      </div>

      <button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 cursor-pointer transition-colors"
      >
        {loading ? 'Processing Payment...' : `Pay ${formatCurrency(totalPrice)}`}
      </button>
    </form>
  );
}

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const { flight, selectedSeats, totalPrice: passedTotalPrice, passengers } = location.state || {};
  const totalPrice = passedTotalPrice || (flight?.price ? flight.price * (selectedSeats?.length || 1) : 0);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    if (!flight || !selectedSeats || !passengers) return;

    const fetchClientSecret = async () => {
      try {
        const { data } = await paymentService.createPaymentIntent(totalPrice);
        setClientSecret(data.clientSecret);
      } catch (err) {
        setPaymentError(err.response?.data?.error || err.message || "Unable to start Stripe checkout.");
      }
    };

    fetchClientSecret();
  }, [flight, selectedSeats, passengers, totalPrice]);

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

      {paymentError && <p className="text-red-500 text-sm text-center mb-4">{paymentError}</p>}

      {!clientSecret ? (
        <div className="text-center py-8">
          <p className="text-gray-700 font-medium">Preparing Stripe checkout...</p>
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm 
            flight={flight}
            selectedSeats={selectedSeats}
            passengers={passengers}
            totalPrice={totalPrice}
          />
        </Elements>
      )}
    </div>
  );
}

export default Payment;