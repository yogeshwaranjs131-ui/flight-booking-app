import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency.js";
import {
  FaClock,
  FaChair,
  FaPlane,
  FaArrowRight,
} from "react-icons/fa";

function FlightCard({ flight }) {
  const navigate = useNavigate();

  // ============================================================
  // FORMAT TIME
  // ============================================================
  const formatTime = (dateString) => {
    if (!dateString) return "--:--";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================
  const formatFlightDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString([], {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // CALCULATE DURATION
  // ============================================================
  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) {
      return "2h 30m";
    }

    const departureDate = new Date(departure);
    const arrivalDate = new Date(arrival);

    if (
      Number.isNaN(departureDate.getTime()) ||
      Number.isNaN(arrivalDate.getTime())
    ) {
      return "2h 30m";
    }

    const difference =
      Math.abs(arrivalDate.getTime() - departureDate.getTime()) / 1000;

    const hours = Math.floor(difference / 3600);
    const minutes = Math.floor((difference % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  // ============================================================
  // AIRPORT INFORMATION
  // ============================================================
  const departureAirport = flight?.departureAirport || {};
  const arrivalAirport = flight?.arrivalAirport || {};

  const departureCity =
    departureAirport.city ||
    flight?.fromCity ||
    flight?.from ||
    "Origin";

  const arrivalCity =
    arrivalAirport.city ||
    flight?.toCity ||
    flight?.to ||
    "Destination";

  const departureCode =
    departureAirport.airportCode ||
    departureAirport.code ||
    flight?.from ||
    "DEP";

  const arrivalCode =
    arrivalAirport.airportCode ||
    arrivalAirport.code ||
    flight?.to ||
    "ARR";

  // ============================================================
  // FLIGHT INFORMATION
  // ============================================================
  const airline = flight?.airline || "International Airline";

  const flightNumber =
    flight?.flightNumber ||
    flight?.flightCode ||
    "FL-001";

  const price = Number(flight?.price) || 0;

  const availableSeats =
    flight?.availableSeats ??
    flight?.totalSeats ??
    0;

  const stops =
    flight?.stops === undefined ||
    flight?.stops === null ||
    flight?.stops === 0 ||
    flight?.stops === "0"
      ? 0
      : Number(flight.stops);

  // ============================================================
  // BOOK NOW
  // ============================================================
  const handleBookClick = () => {
    const flightId = flight?._id || flight?.id;

    if (!flightId) {
      console.error("Flight ID not found:", flight);
      alert("Flight information is incomplete. Please try again.");
      return;
    }

    // Immediate navigation - no artificial delay
    navigate(`/flight-details/${flightId}`, {
      state: {
        flight,
      },
    });
  };

  // ============================================================
  // VIEW DETAILS
  // ============================================================
  const handleViewDetails = () => {
    const flightId = flight?._id || flight?.id;

    if (!flightId) {
      console.error("Flight ID not found:", flight);
      alert("Flight information is incomplete. Please try again.");
      return;
    }

    navigate(`/flight-details/${flightId}`, {
      state: {
        flight,
      },
    });
  };

  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-3xl
        border border-white/15
        bg-slate-950/90
        backdrop-blur-xl
        shadow-2xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-400/50
        hover:shadow-blue-900/30
      "
    >
      {/* ======================================================
          TOP INFORMATION BAR
      ====================================================== */}
      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-white/10
          px-5
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* Airline */}
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-blue-500/10
              ring-1
              ring-blue-400/20
            "
          >
            <FaPlane
              className="
                -rotate-45
                text-xl
                text-blue-400
              "
            />
          </div>

          <div>
            <h3 className="font-bold text-white">
              {airline}
            </h3>

            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {flightNumber}
            </p>
          </div>
        </div>

        {/* Flight Date */}
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Travel Date
          </p>

          <p className="text-sm font-semibold text-slate-200">
            {formatFlightDate(flight?.departureTime)}
          </p>
        </div>
      </div>

      {/* ======================================================
          MAIN FLIGHT INFORMATION
      ====================================================== */}
      <div
        className="
          grid
          grid-cols-1
          gap-6
          px-5
          py-6
          md:grid-cols-[1fr_auto_1fr]
          md:items-center
        "
      >
        {/* ====================================================
            DEPARTURE
        ==================================================== */}
        <div className="text-center md:text-left">
          <p className="text-3xl font-extrabold tracking-tight text-white">
            {formatTime(flight?.departureTime)}
          </p>

          <p className="mt-1 text-xl font-bold text-blue-400">
            {departureCode}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {departureCity}
          </p>

          {departureAirport.name && (
            <p className="mt-1 text-xs text-slate-500">
              {departureAirport.name}
            </p>
          )}
        </div>

        {/* ====================================================
            FLIGHT ROUTE
        ==================================================== */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
            <FaClock />

            <span>
              {calculateDuration(
                flight?.departureTime,
                flight?.arrivalTime
              )}
            </span>
          </div>

          <div className="flex w-full min-w-45 items-center">
            {/* Left line */}
            <div className="h-px flex-1 bg-blue-400/40" />

            {/* Plane */}
            <div
              className="
                mx-3
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-blue-400/30
                bg-blue-500/10
              "
            >
              <FaPlane
                className="
                  -rotate-45
                  text-sm
                  text-blue-400
                "
              />
            </div>

            {/* Right line */}
            <div className="h-px flex-1 bg-blue-400/40" />
          </div>

          {/* Stops */}
          <div
            className={`
              mt-2
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold
              ${
                stops === 0
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }
            `}
          >
            {stops === 0
              ? "Direct Flight"
              : `${stops} Stop${stops > 1 ? "s" : ""}`}
          </div>
        </div>

        {/* ====================================================
            ARRIVAL
        ==================================================== */}
        <div className="text-center md:text-right">
          <p className="text-3xl font-extrabold tracking-tight text-white">
            {formatTime(flight?.arrivalTime)}
          </p>

          <p className="mt-1 text-xl font-bold text-blue-400">
            {arrivalCode}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {arrivalCity}
          </p>

          {arrivalAirport.name && (
            <p className="mt-1 text-xs text-slate-500">
              {arrivalAirport.name}
            </p>
          )}
        </div>
      </div>

      {/* ======================================================
          BOTTOM BOOKING SECTION
      ====================================================== */}
      <div
        className="
          border-t
          border-white/10
          bg-white/3
          px-5
          py-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* Seats */}
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
              "
            >
              <FaChair className="text-blue-400" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Available Seats
              </p>

              <p className="font-semibold text-white">
                {availableSeats > 0
                  ? `${availableSeats} seats`
                  : "Check availability"}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="text-left lg:text-right">
            <p className="text-xs text-slate-500">
              Price per adult
            </p>

            <p className="text-3xl font-extrabold text-white">
              {price > 0
                ? formatCurrency(price)
                : "Price unavailable"}
            </p>

            <p className="text-xs text-slate-500">
              Taxes & fees may apply
            </p>
          </div>

          {/* Buttons */}
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <button
              type="button"
              onClick={handleViewDetails}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/15
                bg-white/5
                px-5
                py-3
                font-semibold
                text-white
                transition-all
                duration-200
                hover:bg-white/10
                sm:w-auto
              "
            >
              View Details
              <FaArrowRight className="text-xs" />
            </button>

            <button
              type="button"
              onClick={handleBookClick}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-6
                py-3
                font-bold
                text-white
                shadow-lg
                shadow-blue-600/25
                transition-all
                duration-200
                hover:bg-blue-500
                hover:shadow-blue-500/40
                active:scale-[0.98]
                sm:w-auto
              "
            >
              Book Now
              <FaPlane className="-rotate-45" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FlightCard;