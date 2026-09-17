import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import flightService from "../services/flightService";
import Loader from "../components/Loader";
import SeatSelector from "../components/SeatSelector";
import { formatCurrency } from "../utils/formatCurrency.js";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaClock,
  FaPlane,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { formatDateTime } from "../utils/formatDate.js";

function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // FETCH FLIGHT
  // ============================================================

  const {
    data: flightResponse,
    loading,
    error,
  } = useFetch(
    () => flightService.getFlightById(id),
    [id]
  );

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isFlying, setIsFlying] = useState(false);

  // ============================================================
  // NORMALIZE API RESPONSE
  // Supports:
  // { success: true, data: {...} }
  // OR
  // { ...flight }
  // ============================================================

  const flight =
    flightResponse?.data &&
    !Array.isArray(flightResponse.data)
      ? flightResponse.data
      : flightResponse;

  // ============================================================
  // DURATION
  // ============================================================

  const calculateDuration = (start, end) => {
    if (!start || !end) {
      return "Duration unavailable";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return "Duration unavailable";
    }

    const diff = endDate - startDate;

    if (diff <= 0) {
      return "Duration unavailable";
    }

    const hours = Math.floor(
      diff / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (diff % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  };

  // ============================================================
  // SEAT SELECTION
  // ============================================================

  const handleSeatSelection = (
    seats,
    price
  ) => {
    setSelectedSeats(
      Array.isArray(seats) ? seats : []
    );

    setTotalPrice(
      Number(price) || 0
    );
  };

  // ============================================================
  // BOOKING
  // ============================================================

  const handleBooking = () => {
    if (!selectedSeats.length) {
      alert(
        "Please select at least one seat to proceed."
      );
      return;
    }

    if (!flight) {
      alert(
        "Flight information is unavailable."
      );
      return;
    }

    const flightId =
      flight._id || flight.id || id;

    if (!flightId) {
      alert(
        "Flight ID is missing. Please try again."
      );
      return;
    }

    // Keep cinematic state
    setIsFlying(true);

    const sanitizedFlight = {
      ...flight,
      _id: flightId,
      id: flightId,
    };

    // ========================================================
    // IMMEDIATE NAVIGATION
    // No artificial 1.2 second delay.
    // ========================================================

    navigate("/passenger-details", {
      state: {
        flight: sanitizedFlight,
        selectedSeats,
        totalPrice,
      },
    });
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    navigate(-1);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader />

          <p className="text-sm text-slate-400">
            Loading flight details...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Unable to load flight
          </h2>

          <p className="text-red-400 mb-6">
            {typeof error === "string"
              ? error
              : error?.message ||
                "Something went wrong while loading flight details."}
          </p>

          <div className="flex justify-center gap-3">

            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              <FaArrowLeft className="inline mr-2" />
              Go Back
            </button>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO FLIGHT
  // ============================================================

  if (!flight) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">

          <div className="text-5xl mb-4">
            ✈️
          </div>

          <h2 className="text-2xl font-bold mb-3">
            Flight details not found
          </h2>

          <p className="text-slate-400 mb-6">
            The requested flight could not be found.
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition"
          >
            <FaArrowLeft className="inline mr-2" />
            Back to Flights
          </button>

        </div>
      </div>
    );
  }

  // ============================================================
  // AIRPORT DATA
  // IMPORTANT:
  // Backend uses airportCode, NOT code.
  // ============================================================

  const fromCode =
    flight.departureAirport?.airportCode ||
    flight.departureAirport?.code ||
    flight.from ||
    "N/A";

  const fromCity =
    flight.departureAirport?.city ||
    flight.fromCity ||
    flight.from ||
    "Departure";

  const fromAirportName =
    flight.departureAirport?.airportName ||
    flight.departureAirport?.name ||
    "";

  const toCode =
    flight.arrivalAirport?.airportCode ||
    flight.arrivalAirport?.code ||
    flight.to ||
    "N/A";

  const toCity =
    flight.arrivalAirport?.city ||
    flight.toCity ||
    flight.to ||
    "Arrival";

  const toAirportName =
    flight.arrivalAirport?.airportName ||
    flight.arrivalAirport?.name ||
    "";

  // ============================================================
  // PRICE
  // ============================================================

  const flightPrice =
    Number(flight.price) || 0;

  // ============================================================
  // DURATION
  // ============================================================

  const duration =
    flight.duration ||
    calculateDuration(
      flight.departureTime,
      flight.arrivalTime
    );

  // ============================================================
  // AVAILABLE SEATS
  // ============================================================

  const availableSeats =
    Number(flight.availableSeats);

  const totalSeats =
    Number(flight.totalSeats);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white px-4 py-6 md:px-8 md:py-8">

      {/* ========================================================
          CINEMATIC BOOKING OVERLAY
      ======================================================== */}

      {isFlying && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-slate-950/95 backdrop-blur-xl">

          {/* Animated plane */}

          <div className="relative">

            <div className="absolute inset-0 blur-3xl bg-blue-500/30 rounded-full" />

            <FaPlane
              className="
                relative
                text-7xl
                text-blue-400
                -rotate-45
                animate-pulse
                drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]
              "
            />

          </div>

          <div className="mt-8 text-center">

            <h2 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-transparent">
              Preparing Your Journey ✈️
            </h2>

            <p className="mt-3 text-sm tracking-widest uppercase text-slate-400">
              Opening passenger details
            </p>

          </div>

        </div>
      )}

      {/* ========================================================
          MAIN CONTAINER
      ======================================================== */}

      <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">

        {/* ======================================================
            BACK BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={handleBack}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-200
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <FaArrowLeft />
          Back to Flights
        </button>

        {/* ======================================================
            FLIGHT SUMMARY
        ====================================================== */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">

          {/* HEADER */}

          <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 md:p-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="mb-1 text-sm font-medium uppercase tracking-wider text-blue-100">
                  Flight Details
                </p>

                <h1 className="text-3xl font-extrabold md:text-4xl">
                  {flight.airline || "Airline"}
                </h1>

                <p className="mt-1 text-lg text-blue-100">
                  {flight.flightNumber || "Flight"}
                </p>

              </div>

              {/* PRICE */}

              <div className="text-left md:text-right">

                <p className="text-sm text-blue-100">
                  Starting Fare
                </p>

                <p className="text-3xl font-extrabold">
                  {formatCurrency(flightPrice)}
                </p>

                <p className="text-xs text-blue-200">
                  per passenger
                </p>

              </div>

            </div>
          </div>

          {/* ROUTE */}

          <div className="p-6 md:p-8">

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">

              {/* DEPARTURE */}

              <div className="text-left">

                <p className="mb-2 text-sm font-medium text-slate-400">
                  Departure
                </p>

                <div className="flex items-center gap-3">

                  <FaPlaneDeparture className="text-2xl text-blue-400" />

                  <div>

                    <p className="text-3xl font-extrabold">
                      {fromCode}
                    </p>

                    <p className="text-lg font-semibold text-slate-200">
                      {fromCity}
                    </p>

                  </div>

                </div>

                {fromAirportName && (
                  <p className="mt-2 text-xs text-slate-500">
                    {fromAirportName}
                  </p>
                )}

                <p className="mt-3 text-sm text-slate-300">
                  {flight.departureTime
                    ? formatDateTime(
                        flight.departureTime
                      )
                    : "Departure time unavailable"}
                </p>

              </div>

              {/* CENTER */}

              <div className="flex flex-col items-center">

                <div className="flex w-full items-center">

                  <div className="hidden h-px flex-1 border-t-2 border-dashed border-slate-700 md:block" />

                  <div className="mx-3 flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10">

                    <FaPlane
                      className="
                        rotate-90
                        text-blue-400
                      "
                    />

                  </div>

                  <div className="hidden h-px flex-1 border-t-2 border-dashed border-slate-700 md:block" />

                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">

                  <FaClock />

                  <span>
                    {duration}
                  </span>

                </div>

                <span className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                  Non-stop
                </span>

              </div>

              {/* ARRIVAL */}

              <div className="text-left md:text-right">

                <p className="mb-2 text-sm font-medium text-slate-400">
                  Arrival
                </p>

                <div className="flex items-center gap-3 md:justify-end">

                  <div>

                    <p className="text-3xl font-extrabold">
                      {toCode}
                    </p>

                    <p className="text-lg font-semibold text-slate-200">
                      {toCity}
                    </p>

                  </div>

                  <FaPlaneArrival className="text-2xl text-amber-300" />

                </div>

                {toAirportName && (
                  <p className="mt-2 text-xs text-slate-500">
                    {toAirportName}
                  </p>
                )}

                <p className="mt-3 text-sm text-slate-300">
                  {flight.arrivalTime
                    ? formatDateTime(
                        flight.arrivalTime
                      )
                    : "Arrival time unavailable"}
                </p>

              </div>

            </div>

            {/* FLIGHT INFORMATION */}

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Flight
                </p>
                <p className="mt-1 font-bold">
                  {flight.flightNumber || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Duration
                </p>
                <p className="mt-1 font-bold">
                  {duration}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Total Seats
                </p>
                <p className="mt-1 font-bold">
                  {Number.isFinite(totalSeats)
                    ? totalSeats
                    : "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Available
                </p>
                <p className="mt-1 font-bold text-emerald-400">
                  {Number.isFinite(
                    availableSeats
                  )
                    ? availableSeats
                    : "N/A"}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* ======================================================
            SEAT SELECTOR
        ====================================================== */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">

          <div className="border-b border-white/10 p-6">

            <h2 className="text-2xl font-bold">
              Select Your Seat
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Choose your preferred seat before
              continuing.
            </p>

          </div>

          <div className="p-4 md:p-6">

            <SeatSelector
              seats={Array.isArray(flight.seats)
                ? flight.seats
                : []}
              onSelect={handleSeatSelection}
            />

          </div>

          {/* ====================================================
              BOOKING FOOTER
          ==================================================== */}

          <div className="border-t border-white/10 bg-slate-950/70 p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              {/* SELECTED SEATS */}

              <div>

                <p className="text-sm text-slate-400">
                  Total Price
                </p>

                <p className="mt-1 text-3xl font-extrabold text-blue-400">
                  {formatCurrency(totalPrice)}
                </p>

                {selectedSeats.length > 0 ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">

                    <FaCheckCircle className="text-emerald-400" />

                    <span>
                      {selectedSeats.length} seat
                      {selectedSeats.length > 1
                        ? "s"
                        : ""}{" "}
                      selected
                    </span>

                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Please select a seat to continue.
                  </p>
                )}

                {selectedSeats.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedSeats.join(", ")}
                  </p>
                )}

              </div>

              {/* BOOK BUTTON */}

              <button
                type="button"
                onClick={handleBooking}
                disabled={
                  selectedSeats.length === 0 ||
                  isFlying
                }
                className="
                  w-full
                  rounded-xl
                  bg-linear-to-r
                  from-blue-600
                  to-indigo-600
                  px-8
                  py-4
                  text-lg
                  font-bold
                  text-white
                  shadow-xl
                  shadow-blue-600/20
                  transition
                  hover:from-blue-500
                  hover:to-indigo-500
                  disabled:cursor-not-allowed
                  disabled:bg-slate-800
                  disabled:from-slate-800
                  disabled:to-slate-800
                  disabled:text-slate-500
                  md:w-auto
                "
              >
                {isFlying
                  ? "Opening Passenger Details..."
                  : "Proceed to Book ✈️"}
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default FlightDetails;