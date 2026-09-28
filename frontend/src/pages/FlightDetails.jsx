
import React, { useState } from "react";
import {
  useLocation,
  useParams,
  useNavigate,
} from "react-router-dom";

import { useFetch } from "../hooks/useFetch";
import flightService from "../services/flightService";
import Loader from "../components/Loader";
import SeatSelector from "../components/SeatSelector";
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDateTime } from "../utils/formatDate.js";

import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaClock,
  FaPlane,
  FaArrowLeft,
  FaCheckCircle,
  FaExchangeAlt,
} from "react-icons/fa";

function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // NAVIGATION STATE
  // ============================================================

  const navigationState = location.state || {};

  const {
    returnFlight: stateReturnFlight = null,
    tripType = "one-way",
    departureDate = null,
    returnDate = null,
  } = navigationState;

  const isRoundTrip = tripType === "round-trip";

  // ============================================================
  // FETCH OUTBOUND FLIGHT
  // ============================================================

  const {
    data: flightResponse,
    loading,
    error,
  } = useFetch(
    () => flightService.getFlightById(id),
    [id]
  );

  // ============================================================
  // SEAT STATES
  // ============================================================

  const [selectedDepartureSeats, setSelectedDepartureSeats] =
    useState([]);

  const [selectedReturnSeats, setSelectedReturnSeats] =
    useState([]);

  const [departureSeatPrice, setDepartureSeatPrice] =
    useState(0);

  const [returnSeatPrice, setReturnSeatPrice] =
    useState(0);

  const [isFlying, setIsFlying] = useState(false);

  // ============================================================
  // NORMALIZE OUTBOUND RESPONSE
  // ============================================================

  const fetchedFlight =
    flightResponse?.data &&
    !Array.isArray(flightResponse.data)
      ? flightResponse.data
      : flightResponse;

  // ============================================================
  // RETURN FLIGHT
  // ============================================================

  const returnFlight = isRoundTrip
    ? stateReturnFlight
    : null;

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

    const difference = endDate - startDate;

    if (difference <= 0) {
      return "Duration unavailable";
    }

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  };

  // ============================================================
  // DEPARTURE SEAT SELECTION
  // ============================================================

  const handleDepartureSeatSelection = (
    seats,
    price
  ) => {
    setSelectedDepartureSeats(
      Array.isArray(seats) ? seats : []
    );

    setDepartureSeatPrice(
      Number(price) || 0
    );
  };

  // ============================================================
  // RETURN SEAT SELECTION
  // ============================================================

  const handleReturnSeatSelection = (
    seats,
    price
  ) => {
    setSelectedReturnSeats(
      Array.isArray(seats) ? seats : []
    );

    setReturnSeatPrice(
      Number(price) || 0
    );
  };

  // ============================================================
  // BASE PRICES
  // ============================================================

  const departureBasePrice =
    Number(fetchedFlight?.price) || 0;

  const returnBasePrice =
    Number(returnFlight?.price) || 0;

  // ============================================================
  // TOTALS
  // ============================================================

  const departureTotal =
    departureBasePrice +
    departureSeatPrice;

  const returnTotal = isRoundTrip
    ? returnBasePrice + returnSeatPrice
    : 0;

  const totalPrice =
    departureTotal + returnTotal;

  // ============================================================
  // BOOKING
  // ============================================================

  const handleBooking = () => {
    // ----------------------------------------------------------
    // OUTBOUND SEAT
    // ----------------------------------------------------------

    if (selectedDepartureSeats.length === 0) {
      alert(
        "Please select at least one departure seat."
      );

      return;
    }

    // ----------------------------------------------------------
    // ROUND TRIP RETURN SEAT
    // ----------------------------------------------------------

    if (
      isRoundTrip &&
      selectedReturnSeats.length === 0
    ) {
      alert(
        "Please select at least one return seat."
      );

      return;
    }

    // ----------------------------------------------------------
    // OUTBOUND FLIGHT
    // ----------------------------------------------------------

    if (!fetchedFlight) {
      alert(
        "Departure flight information is unavailable."
      );

      return;
    }

    const departureFlightId =
      fetchedFlight._id ||
      fetchedFlight.id ||
      id;

    if (!departureFlightId) {
      alert(
        "Departure flight ID is missing."
      );

      return;
    }

    // ----------------------------------------------------------
    // RETURN FLIGHT
    // ----------------------------------------------------------

    let returnFlightId = null;

    if (isRoundTrip) {
      if (!returnFlight) {
        alert(
          "Return flight information is unavailable."
        );

        return;
      }

      returnFlightId =
        returnFlight._id ||
        returnFlight.id ||
        returnFlight.flightId;

      if (!returnFlightId) {
        alert(
          "Return flight ID is missing."
        );

        return;
      }
    }

    // ----------------------------------------------------------
    // SANITIZE OUTBOUND
    // ----------------------------------------------------------

    const sanitizedDepartureFlight = {
      ...fetchedFlight,
      _id: departureFlightId,
      id: departureFlightId,
    };

    // ----------------------------------------------------------
    // SANITIZE RETURN
    // ----------------------------------------------------------

    const sanitizedReturnFlight =
      isRoundTrip && returnFlight
        ? {
            ...returnFlight,
            _id: returnFlightId,
            id: returnFlightId,
          }
        : null;

    // ----------------------------------------------------------
    // DEBUG
    // ----------------------------------------------------------

    console.log(
      "========== BOOKING STATE =========="
    );

    console.log(
      "Trip Type:",
      tripType
    );

    console.log(
      "Departure Flight:",
      sanitizedDepartureFlight
    );

    console.log(
      "Return Flight:",
      sanitizedReturnFlight
    );

    console.log(
      "Departure Seats:",
      selectedDepartureSeats
    );

    console.log(
      "Return Seats:",
      selectedReturnSeats
    );

    console.log(
      "Total Price:",
      totalPrice
    );

    console.log(
      "===================================="
    );

    // ----------------------------------------------------------
    // CINEMATIC LOADING
    // ----------------------------------------------------------

    setIsFlying(true);

    // ----------------------------------------------------------
    // PASSENGER DETAILS
    // ----------------------------------------------------------

    navigate("/passenger-details", {
      state: {
        // ======================================================
        // TRIP
        // ======================================================

        tripType,

        // ======================================================
        // OUTBOUND
        // ======================================================

        flight: sanitizedDepartureFlight,

        selectedSeats:
          selectedDepartureSeats,

        departureSeats:
          selectedDepartureSeats,

        departureDate:
          departureDate ||
          fetchedFlight.departureTime ||
          null,

        departureSeatPrice,

        departureTotal,

        // ======================================================
        // RETURN
        // ======================================================

        returnFlight:
          sanitizedReturnFlight,

        returnSelectedSeats:
          isRoundTrip
            ? selectedReturnSeats
            : [],

        returnSeats:
          isRoundTrip
            ? selectedReturnSeats
            : [],

        returnDate:
          isRoundTrip
            ? returnDate ||
              returnFlight?.departureTime ||
              null
            : null,

        returnSeatPrice:
          isRoundTrip
            ? returnSeatPrice
            : 0,

        returnTotal:
          isRoundTrip
            ? returnTotal
            : 0,

        // ======================================================
        // TOTAL
        // ======================================================

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h2 className="mb-3 text-2xl font-bold">
            Unable to load flight
          </h2>

          <p className="mb-6 text-red-400">
            {typeof error === "string"
              ? error
              : error?.message ||
                "Something went wrong while loading flight details."}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            <FaArrowLeft className="mr-2 inline" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO FLIGHT
  // ============================================================

  if (!fetchedFlight) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="text-center">
          <div className="mb-4 text-5xl">
            ✈️
          </div>

          <h2 className="mb-3 text-2xl font-bold">
            Flight details not found
          </h2>

          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold"
          >
            <FaArrowLeft className="mr-2 inline" />
            Back to Flights
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // AIRPORT HELPER
  // ============================================================

  const getAirportData = (flight) => {
    if (!flight) {
      return {
        fromCode: "N/A",
        fromCity: "Departure",
        fromAirportName: "",
        toCode: "N/A",
        toCity: "Arrival",
        toAirportName: "",
      };
    }

    return {
      fromCode:
        flight.departureAirport?.airportCode ||
        flight.departureAirport?.code ||
        flight.from ||
        "N/A",

      fromCity:
        flight.departureAirport?.city ||
        flight.fromCity ||
        flight.from ||
        "Departure",

      fromAirportName:
        flight.departureAirport?.airportName ||
        flight.departureAirport?.name ||
        "",

      toCode:
        flight.arrivalAirport?.airportCode ||
        flight.arrivalAirport?.code ||
        flight.to ||
        "N/A",

      toCity:
        flight.arrivalAirport?.city ||
        flight.toCity ||
        flight.to ||
        "Arrival",

      toAirportName:
        flight.arrivalAirport?.airportName ||
        flight.arrivalAirport?.name ||
        "",
    };
  };

  const departureAirport =
    getAirportData(fetchedFlight);

  const returnAirport =
    getAirportData(returnFlight);

  // ============================================================
  // DURATIONS
  // ============================================================

  const departureDuration =
    fetchedFlight.duration ||
    calculateDuration(
      fetchedFlight.departureTime,
      fetchedFlight.arrivalTime
    );

  const returnDuration =
    returnFlight?.duration ||
    calculateDuration(
      returnFlight?.departureTime,
      returnFlight?.arrivalTime
    );

  // ============================================================
  // SEAT MAPS
  // ============================================================

  const departureSeatMap = Array.isArray(
    fetchedFlight.seats
  )
    ? fetchedFlight.seats
    : [];

  const returnSeatMap = Array.isArray(
    returnFlight?.seats
  )
    ? returnFlight.seats
    : [];

  // ============================================================
  // AVAILABLE SEATS
  // ============================================================

  const departureAvailableSeats =
    Number(fetchedFlight.availableSeats);

  const returnAvailableSeats =
    Number(returnFlight?.availableSeats);

  // ============================================================
  // TOTAL SEATS
  // ============================================================

  const departureTotalSeats =
    Number(fetchedFlight.totalSeats);

  const returnTotalSeats =
    Number(returnFlight?.totalSeats);

  // ============================================================
  // FLIGHT CARD
  // ============================================================

  const FlightRouteCard = ({
    flight,
    airport,
    duration,
    title,
    dateLabel,
    isReturn = false,
  }) => {
    if (!flight) {
      return null;
    }

    const price =
      Number(flight.price) || 0;

    const totalSeats =
      isReturn
        ? returnTotalSeats
        : departureTotalSeats;

    const availableSeats =
      isReturn
        ? returnAvailableSeats
        : departureAvailableSeats;

    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">

        {/* HEADER */}

        <div className="border-b border-white/10 bg-linear-to-r from-blue-600/20 via-indigo-600/20 to-cyan-500/10 p-5 md:p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">

                {isReturn ? (
                  <FaExchangeAlt className="text-cyan-400" />
                ) : (
                  <FaPlaneDeparture className="text-blue-400" />
                )}

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                  {title}
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-extrabold">
                {flight.airline || "Airline"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {flight.flightNumber || "Flight"}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-slate-400">
                Base Fare
              </p>

              <p className="text-2xl font-extrabold">
                {formatCurrency(price)}
              </p>
            </div>

          </div>
        </div>

        {/* ROUTE */}

        <div className="p-5 md:p-7">

          {dateLabel && (
            <div className="mb-5">
              <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                📅 {dateLabel}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_auto_1fr] md:items-center">

            {/* DEPARTURE */}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Departure
              </p>

              <div className="flex items-center gap-3">

                <FaPlaneDeparture className="text-2xl text-blue-400" />

                <div>
                  <p className="text-3xl font-extrabold">
                    {airport.fromCode}
                  </p>

                  <p className="text-lg font-semibold text-slate-200">
                    {airport.fromCity}
                  </p>
                </div>

              </div>

              {airport.fromAirportName && (
                <p className="mt-2 text-xs text-slate-500">
                  {airport.fromAirportName}
                </p>
              )}

              <p className="mt-3 text-sm text-slate-300">
                {flight.departureTime
                  ? formatDateTime(
                      flight.departureTime
                    )
                  : "Time unavailable"}
              </p>
            </div>

            {/* CENTER */}

            <div className="flex flex-col items-center">

              <div className="flex w-full items-center">

                <div className="hidden flex-1 border-t-2 border-dashed border-slate-700 md:block" />

                <div className="mx-3 flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10">
                  <FaPlane className="rotate-90 text-blue-400" />
                </div>

                <div className="hidden flex-1 border-t-2 border-dashed border-slate-700 md:block" />

              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                <FaClock />
                {duration}
              </div>

              <span className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                Non-stop
              </span>

            </div>

            {/* ARRIVAL */}

            <div className="md:text-right">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Arrival
              </p>

              <div className="flex items-center gap-3 md:justify-end">

                <div>
                  <p className="text-3xl font-extrabold">
                    {airport.toCode}
                  </p>

                  <p className="text-lg font-semibold text-slate-200">
                    {airport.toCity}
                  </p>
                </div>

                <FaPlaneArrival className="text-2xl text-amber-300" />

              </div>

              {airport.toAirportName && (
                <p className="mt-2 text-xs text-slate-500">
                  {airport.toAirportName}
                </p>
              )}

              <p className="mt-3 text-sm text-slate-300">
                {flight.arrivalTime
                  ? formatDateTime(
                      flight.arrivalTime
                    )
                  : "Time unavailable"}
              </p>

            </div>

          </div>

          {/* INFO */}

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-xs text-slate-500">
                Flight
              </p>

              <p className="mt-1 font-bold">
                {flight.flightNumber || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-xs text-slate-500">
                Duration
              </p>

              <p className="mt-1 font-bold">
                {duration}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-xs text-slate-500">
                Total Seats
              </p>

              <p className="mt-1 font-bold">
                {Number.isFinite(totalSeats)
                  ? totalSeats
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
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
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen w-full bg-slate-950 px-4 py-6 text-white md:px-8 md:py-8">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* CINEMATIC LOADING */}

      {isFlying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl">

          <div className="relative">

            <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-3xl" />

            <FaPlane className="relative -rotate-45 text-7xl text-blue-400 drop-shadow-[0_0_35px_rgba(59,130,246,0.8)] animate-pulse" />

          </div>

          <div className="mt-8 text-center">

            <h2 className="bg-linear-to-r from-blue-400 to-amber-200 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Preparing Your Journey ✈️
            </h2>

            <p className="mt-3 text-sm uppercase tracking-widest text-slate-400">
              Opening passenger details
            </p>

          </div>
        </div>
      )}

      {/* MAIN */}

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6 pb-12">

        {/* BACK */}

        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <FaArrowLeft />
          Back to Flights
        </button>

        {/* HEADER */}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl md:p-8">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                Flight Selection
              </p>

              <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
                {isRoundTrip
                  ? "Select Your Journey"
                  : "Review Your Flight"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                {isRoundTrip
                  ? "Select seats for both your departure and return flights."
                  : "Review your flight and select your preferred seat."}
              </p>

            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 md:self-auto">

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

        {/* OUTBOUND */}

        <FlightRouteCard
          flight={fetchedFlight}
          airport={departureAirport}
          duration={departureDuration}
          title="Departure Flight"
          dateLabel={
            departureDate ||
            (fetchedFlight.departureTime
              ? formatDateTime(
                  fetchedFlight.departureTime
                )
              : "")
          }
        />

        {/* OUTBOUND SEATS */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">

          <div className="border-b border-white/10 p-6">

            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Departure
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Select Departure Seat
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Choose your seat for the outbound flight.
            </p>

          </div>

          <div className="p-4 md:p-6">

            <SeatSelector
              seats={departureSeatMap}
              onSelect={
                handleDepartureSeatSelection
              }
            />

          </div>
        </div>

        {/* ======================================================
            RETURN
        ======================================================= */}

        {isRoundTrip && (
          <>
            {!returnFlight ? (
              <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-center">

                <div className="text-4xl">
                  🔄
                </div>

                <h2 className="mt-3 text-xl font-bold">
                  Return Flight Not Available
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  No return flight information was received.
                  Please go back and search again.
                </p>

              </div>
            ) : (
              <>
                <div className="flex items-center justify-center py-2">

                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 backdrop-blur-xl">

                    <FaExchangeAlt className="text-cyan-400" />

                    Return Journey

                  </div>

                </div>

                {/* RETURN FLIGHT */}

                <FlightRouteCard
                  flight={returnFlight}
                  airport={returnAirport}
                  duration={returnDuration}
                  title="Return Flight"
                  isReturn
                  dateLabel={
                    returnDate ||
                    (returnFlight.departureTime
                      ? formatDateTime(
                          returnFlight.departureTime
                        )
                      : "")
                  }
                />

                {/* RETURN SEATS */}

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">

                  <div className="border-b border-white/10 p-6">

                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Return
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Select Return Seat
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Choose your seat for the return flight.
                    </p>

                  </div>

                  <div className="p-4 md:p-6">

                    <SeatSelector
                      seats={returnSeatMap}
                      onSelect={
                        handleReturnSeatSelection
                      }
                    />

                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* PRICE SUMMARY */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">

          <div className="border-b border-white/10 p-6">

            <h2 className="text-2xl font-bold">
              Journey Summary
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Review your selected flights and total fare.
            </p>

          </div>

          <div className="p-6 md:p-8">

            <div className="space-y-4">

              {/* OUTBOUND */}

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-semibold">
                    Departure
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {departureAirport.fromCode} →{" "}
                    {departureAirport.toCode}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatCurrency(
                    departureBasePrice
                  )}
                </p>

              </div>

              {/* OUTBOUND SEAT */}

              {departureSeatPrice > 0 && (
                <div className="flex justify-between">

                  <p className="text-sm text-slate-400">
                    Departure seat
                  </p>

                  <p className="text-sm">
                    {formatCurrency(
                      departureSeatPrice
                    )}
                  </p>

                </div>
              )}

              {/* RETURN */}

              {isRoundTrip &&
                returnFlight && (
                  <>
                    <div className="my-4 border-t border-white/10" />

                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="text-sm font-semibold">
                          Return
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {returnAirport.fromCode} →{" "}
                          {returnAirport.toCode}
                        </p>
                      </div>

                      <p className="font-semibold">
                        {formatCurrency(
                          returnBasePrice
                        )}
                      </p>

                    </div>

                    {returnSeatPrice > 0 && (
                      <div className="flex justify-between">

                        <p className="text-sm text-slate-400">
                          Return seat
                        </p>

                        <p className="text-sm">
                          {formatCurrency(
                            returnSeatPrice
                          )}
                        </p>

                      </div>
                    )}
                  </>
                )}

              {/* TOTAL */}

              <div className="mt-5 border-t border-white/10 pt-5">

                <div className="flex items-end justify-between gap-4">

                  <div>

                    <p className="text-sm text-slate-400">
                      Total Journey Fare
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">

                      {selectedDepartureSeats.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <FaCheckCircle />
                          Departure seat selected
                        </span>
                      )}

                      {isRoundTrip &&
                        selectedReturnSeats.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <FaCheckCircle />
                            Return seat selected
                          </span>
                        )}

                    </div>
                  </div>

                  <p className="text-3xl font-extrabold text-blue-400 md:text-4xl">
                    {formatCurrency(totalPrice)}
                  </p>

                </div>
              </div>

            </div>

            {/* SELECTED SEATS */}

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Departure Seats
                </p>

                <p className="mt-2 font-semibold">
                  {selectedDepartureSeats.length
                    ? selectedDepartureSeats.join(", ")
                    : "Not selected"}
                </p>

              </div>

              {isRoundTrip && (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Return Seats
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedReturnSeats.length
                      ? selectedReturnSeats.join(", ")
                      : "Not selected"}
                  </p>

                </div>
              )}

            </div>

            {/* CONTINUE */}

            <button
              type="button"
              onClick={handleBooking}
              disabled={
                selectedDepartureSeats.length === 0 ||
                (isRoundTrip &&
                  (!returnFlight ||
                    selectedReturnSeats.length === 0)) ||
                isFlying
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500"
            >
              {isFlying
                ? "Opening Passenger Details..."
                : "Continue to Passenger Details"}

              <FaPlane />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default FlightDetails;
