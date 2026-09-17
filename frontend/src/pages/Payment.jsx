import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";
import { formatCurrency } from "../utils/formatCurrency";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// ============================================================
// Stripe Checkout Form
// ============================================================

function CheckoutForm({
  flight,
  selectedSeats,
  passengers,
  totalPrice,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system is still loading. Please wait.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validate Stripe PaymentElement
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      // Confirm payment
      const result = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
        },

        redirect: "if_required",
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Payment failed. Please try again."
        );

        setLoading(false);
        return;
      }

      const paymentIntent = result.paymentIntent;

      if (!paymentIntent) {
        setError("Unable to verify payment.");
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        const bookingData = {
          flightId: flight?._id,

          passengers,

          seats: selectedSeats,

          totalPrice,

          paymentDetails: {
            stripe_payment_intent_id: paymentIntent.id,
            status: "Success",
          },
        };

        const bookingResponse =
          await bookingService.createBooking(bookingData);

        const newBooking =
          bookingResponse?.data?.data ||
          bookingResponse?.data ||
          bookingResponse;

        navigate("/booking-confirmation", {
          state: {
            booking: newBooking,
          },
          replace: true,
        });

        return;
      }

      if (paymentIntent.status === "processing") {
        setError(
          "Your payment is being processed. Please wait."
        );

        setLoading(false);
        return;
      }

      setError(
        `Payment status: ${paymentIntent.status}`
      );
    } catch (err) {
      console.error("Payment Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Payment processing failed."
      );

      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Payment method
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Choose your preferred secure payment method
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
              🔒
            </span>

            Secure
          </div>
        </div>

        {/* Stripe Payment Element */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <PaymentElement
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      {/* Security Information */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            🔐
          </div>

          <div>
            <p className="font-semibold text-slate-800 text-sm">
              Secure payment
            </p>

            <p className="text-xs text-slate-500 mt-1 leading-5">
              Your payment information is securely processed
              by Stripe. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <span className="text-red-600">⚠️</span>

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="group relative w-full overflow-hidden rounded-2xl bg-slate-950 px-6 py-4 text-white shadow-xl transition-all duration-300 hover:bg-slate-800 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <div className="relative flex items-center justify-center gap-3">
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

              <span className="font-bold">
                Processing payment...
              </span>
            </>
          ) : (
            <>
              <span className="text-lg">🔒</span>

              <span className="font-bold">
                Pay {formatCurrency(totalPrice)}
              </span>

              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </div>
      </button>

      <p className="text-center text-xs text-slate-400">
        By continuing, you agree to the booking terms and
        payment conditions.
      </p>
    </form>
  );
}

// ============================================================
// Payment Page
// ============================================================

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};

  const flight = state.flight;

  const selectedSeats = Array.isArray(state.selectedSeats)
    ? state.selectedSeats
    : [];

  const passengers = Array.isArray(state.passengers)
    ? state.passengers
    : [];

  const passedTotalPrice = Number(
    state.totalPrice || 0
  );

  const calculatedPrice =
    Number(flight?.price || 0) *
    Math.max(selectedSeats.length, 1);

  const totalPrice =
    passedTotalPrice > 0
      ? passedTotalPrice
      : calculatedPrice;

  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [loadingPayment, setLoadingPayment] =
    useState(true);

  // ==========================================================
  // Stripe appearance
  // ==========================================================

  const stripeOptions = useMemo(() => {
    if (!clientSecret) return null;

    return {
      clientSecret,

      appearance: {
        theme: "stripe",

        variables: {
          colorPrimary: "#0f172a",
          colorBackground: "#ffffff",
          colorText: "#0f172a",
          colorDanger: "#dc2626",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          borderRadius: "12px",
        },

        rules: {
          ".Input": {
            border: "1px solid #e2e8f0",
            boxShadow: "none",
            padding: "12px",
          },

          ".Input:focus": {
            border: "1px solid #0f172a",
            boxShadow:
              "0 0 0 3px rgba(15, 23, 42, 0.08)",
          },

          ".Label": {
            fontWeight: "600",
            color: "#334155",
          },
        },
      },

      loader: "auto",
    };
  }, [clientSecret]);

  // ==========================================================
  // Create Payment Intent
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const createPaymentIntent = async () => {
      if (
        !flight ||
        selectedSeats.length === 0 ||
        passengers.length === 0
      ) {
        setLoadingPayment(false);
        return;
      }

      if (!totalPrice || totalPrice <= 0) {
        setPaymentError(
          "Invalid booking amount."
        );
        setLoadingPayment(false);
        return;
      }

      try {
        setLoadingPayment(true);
        setPaymentError("");

        const response =
          await paymentService.createPaymentIntent(
            totalPrice
          );

        const secret =
          response?.clientSecret ||
          response?.data?.clientSecret ||
          response?.data?.data?.clientSecret;

        if (!secret) {
          throw new Error(
            "Stripe client secret was not returned by the server."
          );
        }

        if (!cancelled) {
          setClientSecret(secret);
        }
      } catch (error) {
        console.error(
          "Payment Intent Error:",
          error
        );

        if (!cancelled) {
          setPaymentError(
            error?.response?.data?.error ||
              error?.response?.data?.message ||
              error?.message ||
              "Unable to start secure payment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPayment(false);
        }
      }
    };

    createPaymentIntent();

    return () => {
      cancelled = true;
    };
  }, [
    flight?._id,
    selectedSeats.join(","),
    passengers.length,
    totalPrice,
  ]);

  // ==========================================================
  // Missing booking data
  // ==========================================================

  if (
    !flight ||
    selectedSeats.length === 0 ||
    passengers.length === 0
  ) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 shadow-xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Booking details missing
          </h2>

          <p className="mt-3 text-slate-500">
            Your payment session does not contain the
            required booking information.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-7 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const departureCode =
    flight?.departureAirport?.airportCode ||
    flight?.departureAirport?.code ||
    "DEP";

  const arrivalCode =
    flight?.arrivalAirport?.airportCode ||
    flight?.arrivalAirport?.code ||
    "ARR";

  const departureCity =
    flight?.departureAirport?.city ||
    departureCode;

  const arrivalCity =
    flight?.arrivalAirport?.city ||
    arrivalCode;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                Secure Checkout
              </p>

              <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-slate-950">
                Complete your booking
              </h1>

              <p className="mt-2 text-slate-500">
                Securely pay for your flight and receive
                your booking confirmation.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <span>🔒</span>
              Secure checkout
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* Progress */}
        {/* ================================================= */}

        <div className="mb-8 hidden md:flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
              ✓
            </div>

            <span className="text-sm font-semibold text-slate-600">
              Flight
            </span>
          </div>

          <div className="mx-4 h-px flex-1 bg-emerald-300" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
              ✓
            </div>

            <span className="text-sm font-semibold text-slate-600">
              Passenger
            </span>
          </div>

          <div className="mx-4 h-px flex-1 bg-indigo-300" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
              3
            </div>

            <span className="text-sm font-bold text-slate-950">
              Payment
            </span>
          </div>
        </div>

        {/* ================================================= */}
        {/* Main Grid */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">

          {/* ================================================= */}
          {/* Payment Card */}
          {/* ================================================= */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">

            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl">
                💳
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Payment
                </h2>

                <p className="text-sm text-slate-500">
                  All major payment methods are supported
                </p>
              </div>
            </div>

            {paymentError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex gap-3">
                  <span className="text-xl">⚠️</span>

                  <div>
                    <p className="font-bold text-red-800">
                      Payment unavailable
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {paymentError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loadingPayment ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

                <p className="mt-5 font-semibold text-slate-800">
                  Preparing secure payment...
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Connecting to Stripe
                </p>
              </div>
            ) : clientSecret && stripeOptions ? (
              <Elements
                stripe={stripePromise}
                options={stripeOptions}
              >
                <CheckoutForm
                  flight={flight}
                  selectedSeats={selectedSeats}
                  passengers={passengers}
                  totalPrice={totalPrice}
                />
              </Elements>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="font-semibold text-red-700">
                  Unable to load payment form.
                </p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* Booking Summary */}
          {/* ================================================= */}

          <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* Airline Header */}
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Flight
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    {flight.airline}
                  </h3>
                </div>

                <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold">
                  {flight.flightNumber}
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="p-6">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-3xl font-black text-slate-950">
                    {departureCode}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {departureCity}
                  </p>
                </div>

                <div className="mx-4 flex flex-1 flex-col items-center">
                  <span className="text-lg">✈️</span>

                  <div className="my-2 h-px w-full bg-slate-200 relative">
                    <span className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-indigo-600" />
                  </div>

                  <span className="text-xs text-slate-400">
                    {flight.duration || "Direct"}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black text-slate-950">
                    {arrivalCode}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {arrivalCity}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-7 space-y-4 border-t border-slate-100 pt-6">

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Passengers
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {passengers.length}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Seats
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {selectedSeats.join(", ")}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Flight number
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {flight.flightNumber}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    Total amount
                  </span>

                  <span className="text-2xl font-black text-slate-950">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Taxes and applicable charges included
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ================================================= */}
        {/* Trust Section */}
        {/* ================================================= */}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xl">🔒</div>

            <p className="mt-3 font-bold text-slate-800">
              Secure payment
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Payments are securely processed through Stripe.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xl">🛡️</div>

            <p className="mt-3 font-bold text-slate-800">
              Protected checkout
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your sensitive payment information is protected.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xl">🎫</div>

            <p className="mt-3 font-bold text-slate-800">
              Instant confirmation
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              After successful payment, your booking is confirmed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Payment;