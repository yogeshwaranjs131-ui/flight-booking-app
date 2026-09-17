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

// ============================================================
// STRIPE
// ============================================================

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

// ============================================================
// CHECKOUT FORM
// ============================================================

function CheckoutForm({
  flight,
  returnFlight,
  tripType,
  selectedSeats,
  returnSelectedSeats,
  passengers,
  totalPrice,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // ROUND TRIP
  // ==========================================================

  const isRoundTrip =
    tripType === "round-trip" &&
    !!returnFlight;

  // ==========================================================
  // GET FLIGHT IDS
  // ==========================================================

  const outboundFlightId =
    flight?._id ||
    flight?.id ||
    flight?.flightId ||
    null;

  const returnFlightId =
    returnFlight?._id ||
    returnFlight?.id ||
    returnFlight?.flightId ||
    null;

  // ==========================================================
  // SUBMIT PAYMENT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // Stripe validation
    // --------------------------------------------------------

    if (!stripe || !elements) {
      setError(
        "Payment system is still loading. Please wait."
      );

      return;
    }

    // --------------------------------------------------------
    // Outbound flight validation
    // --------------------------------------------------------

    if (!outboundFlightId) {
      setError(
        "Outbound flight information is missing."
      );

      return;
    }

    // --------------------------------------------------------
    // Outbound seats validation
    // --------------------------------------------------------

    if (
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0
    ) {
      setError(
        "Please select at least one outbound seat."
      );

      return;
    }

    // --------------------------------------------------------
    // Passenger validation
    // --------------------------------------------------------

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      setError(
        "Passenger information is missing."
      );

      return;
    }

    // --------------------------------------------------------
    // Round trip validation
    // --------------------------------------------------------

    if (isRoundTrip) {
      if (!returnFlightId) {
        setError(
          "Return flight information is missing."
        );

        return;
      }

      if (
        !Array.isArray(returnSelectedSeats) ||
        returnSelectedSeats.length === 0
      ) {
        setError(
          "Please select at least one return seat."
        );

        return;
      }
    }

    // --------------------------------------------------------
    // Amount validation
    // --------------------------------------------------------

    if (
      !totalPrice ||
      Number(totalPrice) <= 0
    ) {
      setError(
        "Invalid booking amount."
      );

      return;
    }

    setLoading(true);

    try {
      // ======================================================
      // STEP 1
      // Validate Payment Element
      // ======================================================

      const {
        error: submitError,
      } = await elements.submit();

      if (submitError) {
        setError(
          submitError.message ||
            "Please check your payment details."
        );

        setLoading(false);

        return;
      }

      // ======================================================
      // STEP 2
      // Confirm Stripe Payment
      // ======================================================

      const result =
        await stripe.confirmPayment({
          elements,

          confirmParams: {
            return_url:
              `${window.location.origin}/booking-confirmation`,
          },

          redirect: "if_required",
        });

      // ======================================================
      // STRIPE ERROR
      // ======================================================

      if (result.error) {
        setError(
          result.error.message ||
            "Payment failed. Please try again."
        );

        setLoading(false);

        return;
      }

      // ======================================================
      // PAYMENT INTENT
      // ======================================================

      const paymentIntent =
        result.paymentIntent;

      if (!paymentIntent) {
        setError(
          "Unable to verify payment."
        );

        setLoading(false);

        return;
      }

      console.log(
        "Stripe PaymentIntent:",
        paymentIntent
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      if (
        paymentIntent.status ===
        "succeeded"
      ) {
        // ====================================================
        // BOOKING DATA
        // ====================================================

        const bookingData = {
          // --------------------------------------------------
          // Trip
          // --------------------------------------------------

          tripType:
            isRoundTrip
              ? "round-trip"
              : "one-way",

          // --------------------------------------------------
          // Outbound
          // --------------------------------------------------

          flightId:
            outboundFlightId,

          seats:
            selectedSeats,

          // --------------------------------------------------
          // Return
          // --------------------------------------------------

          returnFlightId:
            isRoundTrip
              ? returnFlightId
              : null,

          returnSeats:
            isRoundTrip
              ? returnSelectedSeats
              : [],

          // --------------------------------------------------
          // Passengers
          // --------------------------------------------------

          passengers,

          // --------------------------------------------------
          // Total
          // --------------------------------------------------

          totalPrice:
            Number(totalPrice),

          // --------------------------------------------------
          // Stripe
          // --------------------------------------------------

          paymentDetails: {
            stripe_payment_intent_id:
              paymentIntent.id,

            status: "Success",
          },
        };

        console.log(
          "Creating booking:",
          bookingData
        );

        // ====================================================
        // CREATE BOOKING IN DATABASE
        // ====================================================

        const bookingResponse =
          await bookingService.createBooking(
            bookingData
          );

        console.log(
          "Booking API response:",
          bookingResponse
        );

        // ====================================================
        // EXTRACT BOOKING
        // ====================================================

        const newBooking =
          bookingResponse?.data?.data ||
          bookingResponse?.data ||
          bookingResponse;

        if (
          !newBooking ||
          !newBooking._id
        ) {
          throw new Error(
            "Payment succeeded, but booking could not be created."
          );
        }

        // ====================================================
        // NAVIGATE CONFIRMATION
        // ====================================================

        navigate(
          "/booking-confirmation",
          {
            state: {
              booking:
                newBooking,

              flight,

              returnFlight:
                isRoundTrip
                  ? returnFlight
                  : null,

              tripType:
                isRoundTrip
                  ? "round-trip"
                  : "one-way",

              selectedSeats,

              returnSelectedSeats:
                isRoundTrip
                  ? returnSelectedSeats
                  : [],

              passengers,

              totalPrice:
                Number(totalPrice),

              paymentIntent:
                paymentIntent.id,
            },

            replace: true,
          }
        );

        return;
      }

      // ======================================================
      // PROCESSING
      // ======================================================

      if (
        paymentIntent.status ===
        "processing"
      ) {
        setError(
          "Your payment is being processed. Please wait."
        );

        setLoading(false);

        return;
      }

      // ======================================================
      // OTHER STATUS
      // ======================================================

      setError(
        `Payment status: ${paymentIntent.status}`
      );

      setLoading(false);
    } catch (err) {
      console.error(
        "Payment Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Payment processing failed."
      );

      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ======================================================
          PAYMENT METHOD
      ====================================================== */}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Payment method
            </h3>

            <p className="mt-1 text-sm text-slate-500">
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

        {/* ====================================================
            STRIPE PAYMENT ELEMENT
        ==================================================== */}

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

      {/* ======================================================
          SECURITY
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            🔐
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Secure payment
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your payment information is securely
              processed by Stripe. We never store
              your card details.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <span className="text-red-600">
              ⚠️
            </span>

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          PAY BUTTON
      ====================================================== */}

      <button
        type="submit"
        disabled={
          !stripe ||
          !elements ||
          loading
        }
        className="
          group
          relative
          w-full
          overflow-hidden
          rounded-2xl
          bg-slate-950
          px-6
          py-4
          text-white
          shadow-xl
          transition-all
          duration-300
          hover:bg-slate-800
          hover:shadow-2xl
          disabled:cursor-not-allowed
          disabled:bg-slate-400
        "
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
              <span className="text-lg">
                🔒
              </span>

              <span className="font-bold">
                Pay{" "}
                {formatCurrency(
                  totalPrice
                )}
              </span>

              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </div>
      </button>

      <p className="text-center text-xs text-slate-400">
        By continuing, you agree to the booking
        terms and payment conditions.
      </p>
    </form>
  );
}

// ============================================================
// PAYMENT PAGE
// ============================================================

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const state =
    location.state || {};

  // ==========================================================
  // BOOKING DATA
  // ==========================================================

  const flight =
    state.flight || null;

  const returnFlight =
    state.returnFlight || null;

  const tripType =
    state.tripType ||
    "one-way";

  const selectedSeats =
    Array.isArray(
      state.selectedSeats
    )
      ? state.selectedSeats
      : [];

  const returnSelectedSeats =
    Array.isArray(
      state.returnSelectedSeats
    )
      ? state.returnSelectedSeats
      : [];

  const passengers =
    Array.isArray(
      state.passengers
    )
      ? state.passengers
      : [];

  const passedTotalPrice =
    Number(
      state.totalPrice || 0
    );

  // ==========================================================
  // ROUND TRIP
  // ==========================================================

  const isRoundTrip =
    tripType === "round-trip" &&
    !!returnFlight;

  // ==========================================================
  // PRICE
  // ==========================================================

  const outboundPrice =
    Number(
      flight?.price || 0
    );

  const returnPrice =
    Number(
      returnFlight?.price || 0
    );

  const outboundTotal =
    outboundPrice *
    selectedSeats.length;

  const returnTotal =
    isRoundTrip
      ? returnPrice *
        returnSelectedSeats.length
      : 0;

  const calculatedPrice =
    outboundTotal +
    returnTotal;

  const totalPrice =
    passedTotalPrice > 0
      ? passedTotalPrice
      : calculatedPrice;

  // ==========================================================
  // STRIPE
  // ==========================================================

  const [
    clientSecret,
    setClientSecret,
  ] = useState("");

  const [
    paymentError,
    setPaymentError,
  ] = useState("");

  const [
    loadingPayment,
    setLoadingPayment,
  ] = useState(true);

  // ==========================================================
  // STRIPE OPTIONS
  // ==========================================================

  const stripeOptions =
    useMemo(() => {
      if (!clientSecret) {
        return null;
      }

      return {
        clientSecret,

        appearance: {
          theme: "stripe",

          variables: {
            colorPrimary:
              "#0f172a",

            colorBackground:
              "#ffffff",

            colorText:
              "#0f172a",

            colorDanger:
              "#dc2626",

            fontFamily:
              '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

            borderRadius:
              "12px",
          },

          rules: {
            ".Input": {
              border:
                "1px solid #e2e8f0",

              boxShadow:
                "none",

              padding:
                "12px",
            },

            ".Input:focus": {
              border:
                "1px solid #0f172a",

              boxShadow:
                "0 0 0 3px rgba(15, 23, 42, 0.08)",
            },

            ".Label": {
              fontWeight:
                "600",

              color:
                "#334155",
            },
          },
        },

        loader: "auto",
      };
    }, [clientSecret]);

  // ==========================================================
  // CREATE PAYMENT INTENT
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const createPaymentIntent =
      async () => {
        // ----------------------------------------------------
        // Basic validation
        // ----------------------------------------------------

        if (
          !flight ||
          selectedSeats.length === 0 ||
          passengers.length === 0
        ) {
          setPaymentError(
            "Booking information is incomplete."
          );

          setLoadingPayment(false);

          return;
        }

        // ----------------------------------------------------
        // Round trip validation
        // ----------------------------------------------------

        if (isRoundTrip) {
          if (!returnFlight) {
            setPaymentError(
              "Return flight information is missing."
            );

            setLoadingPayment(false);

            return;
          }

          if (
            returnSelectedSeats.length === 0
          ) {
            setPaymentError(
              "Return seat selection is missing."
            );

            setLoadingPayment(false);

            return;
          }
        }

        // ----------------------------------------------------
        // Amount validation
        // ----------------------------------------------------

        if (
          !totalPrice ||
          totalPrice <= 0
        ) {
          setPaymentError(
            "Invalid booking amount."
          );

          setLoadingPayment(false);

          return;
        }

        // ----------------------------------------------------
        // Stripe configuration validation
        // ----------------------------------------------------

        if (!stripePromise) {
          setPaymentError(
            "Stripe is not configured. Please check VITE_STRIPE_PUBLISHABLE_KEY."
          );

          setLoadingPayment(false);

          return;
        }

        try {
          setLoadingPayment(true);
          setPaymentError("");
          setClientSecret("");

          // ----------------------------------------------
          // Create PaymentIntent
          // ----------------------------------------------

          const response =
            await paymentService.createPaymentIntent(
              totalPrice
            );

          console.log(
            "Payment Intent response:",
            response
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
    returnFlight?._id,
    selectedSeats.join(","),
    returnSelectedSeats.join(","),
    passengers.length,
    totalPrice,
    isRoundTrip,
  ]);

  // ==========================================================
  // MISSING BOOKING DATA
  // ==========================================================

  if (
    !flight ||
    selectedSeats.length === 0 ||
    passengers.length === 0
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Booking details missing
          </h2>

          <p className="mt-3 text-slate-500">
            Your payment session does not contain
            the required booking information.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="
              mt-7
              rounded-xl
              bg-slate-950
              px-6
              py-3
              font-semibold
              text-white
              hover:bg-slate-800
            "
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // OUTBOUND DISPLAY
  // ==========================================================

  const departureCode =
    flight?.departureAirport
      ?.airportCode ||
    flight?.departureAirport
      ?.code ||
    flight?.from ||
    "DEP";

  const arrivalCode =
    flight?.arrivalAirport
      ?.airportCode ||
    flight?.arrivalAirport
      ?.code ||
    flight?.to ||
    "ARR";

  const departureCity =
    flight?.departureAirport
      ?.city ||
    departureCode;

  const arrivalCity =
    flight?.arrivalAirport
      ?.city ||
    arrivalCode;

  // ==========================================================
  // RETURN DISPLAY
  // ==========================================================

  const returnDepartureCode =
    returnFlight
      ?.departureAirport
      ?.airportCode ||
    returnFlight
      ?.departureAirport
      ?.code ||
    returnFlight?.from ||
    "DEP";

  const returnArrivalCode =
    returnFlight
      ?.arrivalAirport
      ?.airportCode ||
    returnFlight
      ?.arrivalAirport
      ?.code ||
    returnFlight?.to ||
    "ARR";

  const returnDepartureCity =
    returnFlight
      ?.departureAirport
      ?.city ||
    returnDepartureCode;

  const returnArrivalCity =
    returnFlight
      ?.arrivalAirport
      ?.city ||
    returnArrivalCode;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                Secure Checkout
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
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

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <div className="mb-8 hidden items-center md:flex">
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

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">

          {/* =================================================
              PAYMENT
          ================================================= */}

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

            {/* =================================================
                PAYMENT ERROR
            ================================================= */}

            {paymentError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex gap-3">
                  <span className="text-xl">
                    ⚠️
                  </span>

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

            {/* =================================================
                LOADING
            ================================================= */}

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
            ) : clientSecret &&
              stripeOptions &&
              stripePromise ? (
              <Elements
                stripe={stripePromise}
                options={stripeOptions}
              >
                <CheckoutForm
                  flight={flight}
                  returnFlight={
                    isRoundTrip
                      ? returnFlight
                      : null
                  }
                  tripType={tripType}
                  selectedSeats={
                    selectedSeats
                  }
                  returnSelectedSeats={
                    isRoundTrip
                      ? returnSelectedSeats
                      : []
                  }
                  passengers={
                    passengers
                  }
                  totalPrice={
                    totalPrice
                  }
                />
              </Elements>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="font-semibold text-red-700">
                  Unable to load payment form.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="
                    mt-4
                    rounded-xl
                    bg-slate-950
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              BOOKING SUMMARY
          ================================================= */}

          <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* =================================================
                AIRLINE HEADER
            ================================================= */}

            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {isRoundTrip
                      ? "Round Trip"
                      : "One Way"}
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

            <div className="p-6">

              {/* =================================================
                  OUTBOUND
              ================================================= */}

              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {isRoundTrip
                    ? "Departure"
                    : "Journey"}
                </p>
              </div>

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
                  <span className="text-lg">
                    ✈️
                  </span>

                  <div className="relative my-2 h-px w-full bg-slate-200">
                    <span className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-indigo-600" />
                  </div>

                  <span className="text-xs text-slate-400">
                    {flight.duration ||
                      "Direct"}
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

              {/* OUTBOUND SEATS */}

              <div className="mt-5 rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Departure Seats
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {selectedSeats.join(
                    ", "
                  )}
                </p>
              </div>

              {/* =================================================
                  RETURN
              ================================================= */}

              {isRoundTrip && (
                <>
                  <div className="my-6 border-t border-slate-100" />

                  <div className="mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                      Return
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black text-slate-950">
                        {returnDepartureCode}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {returnDepartureCity}
                      </p>
                    </div>

                    <div className="mx-4 flex flex-1 flex-col items-center">
                      <span className="text-lg">
                        ✈️
                      </span>

                      <div className="relative my-2 h-px w-full bg-slate-200">
                        <span className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-500" />
                      </div>

                      <span className="text-xs text-slate-400">
                        {returnFlight?.duration ||
                          "Direct"}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-black text-slate-950">
                        {returnArrivalCode}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {returnArrivalCity}
                      </p>
                    </div>
                  </div>

                  {/* RETURN SEATS */}

                  <div className="mt-5 rounded-xl bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                      Return Seats
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {returnSelectedSeats.join(
                        ", "
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* =================================================
                  DETAILS
              ================================================= */}

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
                    Trip type
                  </span>

                  <span className="text-sm font-bold capitalize text-slate-800">
                    {isRoundTrip
                      ? "Round Trip"
                      : "One Way"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Outbound
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {flight.flightNumber}
                  </span>
                </div>

                {isRoundTrip && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Return
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {returnFlight?.flightNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* =================================================
                  PRICE
              ================================================= */}

              <div className="mt-7 rounded-2xl bg-slate-50 p-5">

                {isRoundTrip && (
                  <>
                    <div className="mb-3 flex justify-between text-sm">
                      <span className="text-slate-500">
                        Departure
                      </span>

                      <span className="font-semibold text-slate-800">
                        {formatCurrency(
                          outboundTotal
                        )}
                      </span>
                    </div>

                    <div className="mb-4 flex justify-between text-sm">
                      <span className="text-slate-500">
                        Return
                      </span>

                      <span className="font-semibold text-slate-800">
                        {formatCurrency(
                          returnTotal
                        )}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    Total amount
                  </span>

                  <span className="text-2xl font-black text-slate-950">
                    {formatCurrency(
                      totalPrice
                    )}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Taxes and applicable charges included
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ==================================================
            TRUST SECTION
        ================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xl">
              🔒
            </div>

            <p className="mt-3 font-bold text-slate-800">
              Secure payment
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Payments are securely processed through Stripe.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xl">
              🛡️
            </div>

            <p className="mt-3 font-bold text-slate-800">
              Protected checkout
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your sensitive payment information is protected.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xl">
              🎫
            </div>

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