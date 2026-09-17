
import React, { useState } from "react";
import {
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import { formatCurrency } from "../utils/formatCurrency";
import { formatDateTime } from "../utils/formatDate";

import {
  FaPlane,
  FaUserFriends,
  FaRupeeSign,
  FaExchangeAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

function BookingReview() {
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // GET BOOKING DATA
  // ============================================================

  const {
    flight,
    returnFlight = null,

    tripType = "one-way",

    selectedSeats = [],
    returnSelectedSeats = [],

    passengers = [],

    totalPrice: passedTotalPrice,
  } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);

  // ============================================================
  // ROUND TRIP
  // ============================================================

  const isRoundTrip =
    tripType === "round-trip" && !!returnFlight;

  // ============================================================
  // BASIC DATA VALIDATION
  // ============================================================

  const invalidBasicData =
    !flight ||
    !Array.isArray(selectedSeats) ||
    selectedSeats.length === 0 ||
    !Array.isArray(passengers) ||
    passengers.length === 0;

  const invalidRoundTripData =
    isRoundTrip &&
    (!Array.isArray(returnSelectedSeats) ||
      returnSelectedSeats.length === 0 ||
      returnSelectedSeats.length !== selectedSeats.length);

  if (invalidBasicData || invalidRoundTripData) {
    return <Navigate to="/" replace />;
  }

  // ============================================================
  // OUTBOUND FLIGHT
  // ============================================================

  const fromCode =
    flight?.departureAirport?.airportCode ||
    flight?.departureAirport?.code ||
    flight?.from ||
    "N/A";

  const toCode =
    flight?.arrivalAirport?.airportCode ||
    flight?.arrivalAirport?.code ||
    flight?.to ||
    "N/A";

  const airlineName =
    flight?.airline || "Airline";

  const flightNo =
    flight?.flightNumber || "Flight";

  const outboundPrice =
    Number(flight?.price) || 0;

  // ============================================================
  // RETURN FLIGHT
  // ============================================================

  const returnFromCode =
    returnFlight?.departureAirport?.airportCode ||
    returnFlight?.departureAirport?.code ||
    returnFlight?.from ||
    "N/A";

  const returnToCode =
    returnFlight?.arrivalAirport?.airportCode ||
    returnFlight?.arrivalAirport?.code ||
    returnFlight?.to ||
    "N/A";

  const returnAirlineName =
    returnFlight?.airline || "Airline";

  const returnFlightNo =
    returnFlight?.flightNumber || "Flight";

  const returnPrice =
    Number(returnFlight?.price) || 0;

  // ============================================================
  // PASSENGER COUNT
  // ============================================================

  const passengerCount =
    passengers.length;

  // ============================================================
  // PRICE CALCULATION
  //
  // Backend/FlightDetails totalPrice is preferred.
  // If it is not available, calculate here.
  // ============================================================

  const outboundBasePrice =
    outboundPrice * passengerCount;

  const returnBasePrice =
    isRoundTrip
      ? returnPrice * passengerCount
      : 0;

  const totalBasePrice =
    outboundBasePrice + returnBasePrice;

  const calculatedTaxes =
    totalBasePrice * 0.18;

  const calculatedTotal =
    totalBasePrice + calculatedTaxes;

  const totalPrice =
    Number(passedTotalPrice) > 0
      ? Number(passedTotalPrice)
      : calculatedTotal;

  /*
   * If FlightDetails already calculated the final amount,
   * derive the displayed tax from that final amount.
   *
   * This prevents the UI from showing one tax value while
   * Stripe receives another total.
   */
  const displayedTaxes =
    Number(passedTotalPrice) > 0
      ? Math.max(
          0,
          totalPrice - totalBasePrice
        )
      : calculatedTaxes;

  // ============================================================
  // PROCEED TO PAYMENT
  // ============================================================

  const handleProceedToPayment = () => {
    if (isProcessing) return;

    if (!flight?._id && !flight?.id) {
      alert("Flight information is missing.");
      return;
    }

    if (
      isRoundTrip &&
      !returnFlight?._id &&
      !returnFlight?.id
    ) {
      alert("Return flight information is missing.");
      return;
    }

    if (
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0
    ) {
      alert("Please select your departure seats.");
      return;
    }

    if (
      isRoundTrip &&
      (!Array.isArray(returnSelectedSeats) ||
        returnSelectedSeats.length === 0)
    ) {
      alert("Please select your return seats.");
      return;
    }

    if (
      isRoundTrip &&
      returnSelectedSeats.length !== selectedSeats.length
    ) {
      alert(
        "The number of return seats must match the passengers."
      );
      return;
    }

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      alert("Passenger information is missing.");
      return;
    }

    if (!totalPrice || totalPrice <= 0) {
      alert("Invalid booking amount.");
      return;
    }

    setIsProcessing(true);

    // ========================================================
    // SEND COMPLETE DATA TO PAYMENT PAGE
    // ========================================================

    navigate("/payment", {
      state: {
        flight,

        returnFlight: isRoundTrip
          ? returnFlight
          : null,

        tripType,

        selectedSeats,

        returnSelectedSeats: isRoundTrip
          ? returnSelectedSeats
          : [],

        passengers,

        totalPrice,
      },
    });
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (isProcessing) return;

    navigate(-1);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-y-auto bg-slate-950 p-4 text-white md:p-8">

      {/* ======================================================
          PAYMENT PROCESSING OVERLAY
      ====================================================== */}

      {isProcessing && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-slate-950/95 backdrop-blur-2xl">

          <div className="relative">

            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl" />

            <FaPlane
              className="
                relative
                -rotate-45
                animate-pulse
                text-7xl
                text-blue-400
                drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]
              "
            />

          </div>

          <div className="mt-8 text-center">

            <h2 className="bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Connecting to Payment Gateway... ✈️
            </h2>

            <p className="mt-3 text-sm uppercase tracking-widest text-slate-400">
              Securing your transaction
            </p>

          </div>

        </div>
      )}

      {/* ======================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="mx-auto max-w-4xl py-6 pb-12">

        {/* BACK */}

        <button
          type="button"
          onClick={handleBack}
          disabled={isProcessing}
          className="
            mb-5
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-300
            transition
            hover:bg-white/10
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ← Back
        </button>

        {/* ====================================================
            MAIN CARD
        ==================================================== */}

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">

          {/* HEADER */}

          <div className="mb-8 text-center">

            <div className="mb-4 flex justify-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400">

                {isRoundTrip ? (
                  <FaExchangeAlt className="text-xl" />
                ) : (
                  <FaPlane className="-rotate-45 text-xl" />
                )}

              </div>

            </div>

            <h1 className="bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Review Your Booking
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Verify your journey, passengers and total
              amount before payment.
            </p>

            {/* TRIP TYPE */}

            <div className="mt-4 flex justify-center">

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-2
                  text-sm
                  font-bold
                  ${
                    isRoundTrip
                      ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                      : "border-blue-400/20 bg-blue-500/10 text-blue-300"
                  }
                `}
              >

                {isRoundTrip ? (
                  <>
                    <FaExchangeAlt />
                    Round Trip
                  </>
                ) : (
                  <>
                    <FaPlane />
                    One Way
                  </>
                )}

              </div>

            </div>

          </div>

          {/* ==================================================
              FLIGHTS
          ================================================== */}

          <div className="space-y-5">

            {/* =================================================
                OUTBOUND FLIGHT
            ================================================= */}

            <div className="rounded-2xl border border-blue-400/20 bg-slate-950/60 p-6 shadow-lg">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center">

                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                    <FaPlane className="-rotate-45 text-blue-400" />

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-blue-400">
                      {isRoundTrip
                        ? "Departure Flight"
                        : "Flight Summary"}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {airlineName} · {flightNo}
                    </p>

                  </div>

                </div>

                <div className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">
                  {selectedSeats.length} Seat
                  {selectedSeats.length > 1
                    ? "s"
                    : ""}
                </div>

              </div>

              {/* ROUTE */}

              <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-3">

                <div>

                  <p className="text-3xl font-extrabold">
                    {fromCode}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Departure
                  </p>

                  {flight.departureTime && (
                    <p className="mt-2 text-sm font-semibold text-slate-200">
                      {formatDateTime(
                        flight.departureTime
                      )}
                    </p>
                  )}

                </div>

                <div className="flex flex-col items-center">

                  <div className="flex w-full items-center gap-2">

                    <div className="h-px flex-1 bg-white/10" />

                    <FaPlane className="-rotate-45 text-blue-400" />

                    <div className="h-px flex-1 bg-white/10" />

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {flight.duration || "Flight"}
                  </p>

                </div>

                <div className="text-left md:text-right">

                  <p className="text-3xl font-extrabold">
                    {toCode}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Arrival
                  </p>

                  {flight.arrivalTime && (
                    <p className="mt-2 text-sm font-semibold text-slate-200">
                      {formatDateTime(
                        flight.arrivalTime
                      )}
                    </p>
                  )}

                </div>

              </div>

              {/* OUTBOUND SEATS */}

              <div className="mt-5 border-t border-white/10 pt-4">

                <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                  Selected Seats
                </p>

                <div className="flex flex-wrap gap-2">

                  {selectedSeats.map((seat) => (
                    <span
                      key={`outbound-${seat}`}
                      className="
                        rounded-lg
                        border
                        border-blue-400/20
                        bg-blue-500/10
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-blue-300
                      "
                    >
                      Seat {seat}
                    </span>
                  ))}

                </div>

              </div>

            </div>

            {/* =================================================
                RETURN FLIGHT
            ================================================= */}

            {isRoundTrip && (
              <div className="rounded-2xl border border-amber-400/20 bg-slate-950/60 p-6 shadow-lg">

                <div className="mb-5 flex items-center justify-between">

                  <div className="flex items-center">

                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">

                      <FaPlane className="rotate-180 text-amber-400" />

                    </div>

                    <div>

                      <h2 className="text-lg font-semibold text-amber-400">
                        Return Flight
                      </h2>

                      <p className="text-xs text-slate-500">
                        {returnAirlineName} ·{" "}
                        {returnFlightNo}
                      </p>

                    </div>

                  </div>

                  <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300">
                    {returnSelectedSeats.length} Seat
                    {returnSelectedSeats.length > 1
                      ? "s"
                      : ""}
                  </div>

                </div>

                {/* ROUTE */}

                <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-3">

                  <div>

                    <p className="text-3xl font-extrabold">
                      {returnFromCode}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Return Departure
                    </p>

                    {returnFlight.departureTime && (
                      <p className="mt-2 text-sm font-semibold text-slate-200">
                        {formatDateTime(
                          returnFlight.departureTime
                        )}
                      </p>
                    )}

                  </div>

                  <div className="flex flex-col items-center">

                    <div className="flex w-full items-center gap-2">

                      <div className="h-px flex-1 bg-white/10" />

                      <FaPlane className="rotate-180 text-amber-400" />

                      <div className="h-px flex-1 bg-white/10" />

                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {returnFlight.duration ||
                        "Flight"}
                    </p>

                  </div>

                  <div className="text-left md:text-right">

                    <p className="text-3xl font-extrabold">
                      {returnToCode}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Return Arrival
                    </p>

                    {returnFlight.arrivalTime && (
                      <p className="mt-2 text-sm font-semibold text-slate-200">
                        {formatDateTime(
                          returnFlight.arrivalTime
                        )}
                      </p>
                    )}

                  </div>

                </div>

                {/* RETURN SEATS */}

                <div className="mt-5 border-t border-white/10 pt-4">

                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                    Return Seats
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {returnSelectedSeats.map((seat) => (
                      <span
                        key={`return-${seat}`}
                        className="
                          rounded-lg
                          border
                          border-amber-400/20
                          bg-amber-500/10
                          px-3
                          py-1.5
                          text-xs
                          font-bold
                          text-amber-300
                        "
                      >
                        Seat {seat}
                      </span>
                    ))}

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                PASSENGERS
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-lg">

              <h2 className="mb-5 flex items-center text-xl font-semibold text-blue-400">

                <FaUserFriends className="mr-3" />

                Passengers

              </h2>

              <div className="space-y-3">

                {passengers.map(
                  (passenger, index) => (
                    <div
                      key={index}
                      className="
                        flex
                        flex-col
                        gap-3
                        rounded-xl
                        border
                        border-white/5
                        bg-slate-900/60
                        p-4
                        md:flex-row
                        md:items-center
                        md:justify-between
                      "
                    >

                      <div>

                        <p className="text-sm font-bold text-slate-200">

                          {index + 1}.{" "}

                          {passenger.name}

                        </p>

                        <p className="mt-1 text-xs text-slate-500">

                          {passenger.age} years ·{" "}
                          {passenger.gender}

                        </p>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                          Outbound:{" "}
                          {selectedSeats[index]}
                        </span>

                        {isRoundTrip && (
                          <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                            Return:{" "}
                            {
                              returnSelectedSeats[index]
                            }
                          </span>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* =================================================
                PRICE SUMMARY
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-lg">

              <h2 className="mb-5 flex items-center text-xl font-semibold text-blue-400">

                <FaRupeeSign className="mr-3" />

                Price Summary

              </h2>

              <div className="space-y-4 text-slate-300">

                {/* OUTBOUND */}

                <div className="flex justify-between gap-4">

                  <span>
                    Departure Flight
                    <span className="ml-1 text-xs text-slate-500">
                      ({selectedSeats.length} passenger
                      {selectedSeats.length > 1
                        ? "s"
                        : ""})
                    </span>
                  </span>

                  <span className="font-semibold">
                    {formatCurrency(
                      outboundBasePrice
                    )}
                  </span>

                </div>

                {/* RETURN */}

                {isRoundTrip && (
                  <div className="flex justify-between gap-4">

                    <span>
                      Return Flight
                      <span className="ml-1 text-xs text-slate-500">
                        ({returnSelectedSeats.length} passenger
                        {returnSelectedSeats.length > 1
                          ? "s"
                          : ""})
                      </span>
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        returnBasePrice
                      )}
                    </span>

                  </div>
                )}

                {/* TAXES */}

                <div className="flex justify-between border-b border-white/10 pb-4">

                  <span>
                    Taxes & Fees
                    <span className="ml-1 text-xs text-slate-500">
                      (included)
                    </span>
                  </span>

                  <span className="font-semibold">
                    {formatCurrency(
                      displayedTaxes
                    )}
                  </span>

                </div>

                {/* TOTAL */}

                <div className="flex items-center justify-between pt-2">

                  <div>

                    <p className="text-sm text-slate-400">
                      Total Amount
                    </p>

                    <p className="mt-1 text-3xl font-extrabold text-white">
                      {formatCurrency(
                        totalPrice
                      )}
                    </p>

                  </div>

                  <FaCheckCircle className="text-3xl text-emerald-400" />

                </div>

              </div>

            </div>

            {/* =================================================
                PAYMENT BUTTON
            ================================================= */}

            <div className="pt-2">

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-linear-to-r
                  from-blue-600
                  to-indigo-600
                  py-4
                  text-lg
                  font-bold
                  text-white
                  shadow-lg
                  shadow-blue-600/30
                  transition
                  hover:from-blue-500
                  hover:to-indigo-500
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {isProcessing ? (
                  <>
                    <FaPlane className="-rotate-45 animate-pulse" />
                    Connecting to Payment...
                  </>
                ) : (
                  <>
                    Confirm & Pay
                    <FaArrowRight />
                  </>
                )}

              </button>

            </div>

            <p className="text-center text-xs text-slate-500">
              Your booking details will be securely
              transferred to the payment gateway.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default BookingReview;
