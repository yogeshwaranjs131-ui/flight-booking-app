import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaPlane,
  FaArrowLeft,
  FaUser,
  FaCheckCircle,
  FaExchangeAlt,
} from "react-icons/fa";

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // GET DATA FROM FLIGHT DETAILS PAGE
  // ============================================================

  const {
    flight,
    returnFlight = null,
    tripType = "one-way",

    selectedSeats = [],
    returnSelectedSeats = [],

    totalPrice = 0,
  } = location.state || {};

  const isRoundTrip =
    tripType === "round-trip" && !!returnFlight;

  // ============================================================
  // PASSENGER STATE
  // ============================================================

  const passengerSeatCount = selectedSeats.length;

  const [passengers, setPassengers] = useState(() =>
    Array.from(
      {
        length: passengerSeatCount,
      },
      () => ({
        name: "",
        age: "",
        gender: "Male",
      })
    )
  );

  const [isProcessing, setIsProcessing] =
    useState(false);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setPassengers((previousPassengers) =>
      previousPassengers.map(
        (passenger, passengerIndex) =>
          passengerIndex === index
            ? {
                ...passenger,
                [name]: value,
              }
            : passenger
      )
    );
  };

  // ============================================================
  // VALIDATE PASSENGERS
  // ============================================================

  const validatePassengers = () => {
    for (
      let index = 0;
      index < passengers.length;
      index++
    ) {
      const passenger = passengers[index];

      if (!passenger.name.trim()) {
        alert(
          `Please enter Passenger ${
            index + 1
          } name.`
        );

        return false;
      }

      const age = Number(passenger.age);

      if (!age || age < 1 || age > 120) {
        alert(
          `Please enter a valid age for Passenger ${
            index + 1
          }.`
        );

        return false;
      }

      if (!passenger.gender) {
        alert(
          `Please select gender for Passenger ${
            index + 1
          }.`
        );

        return false;
      }
    }

    return true;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validatePassengers()) {
      return;
    }

    // ==========================================================
    // FLIGHT VALIDATION
    // ==========================================================

    if (!flight) {
      alert(
        "Flight information is missing. Please select the flight again."
      );

      return;
    }

    // ==========================================================
    // OUTBOUND SEAT VALIDATION
    // ==========================================================

    if (
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0
    ) {
      alert(
        "Outbound seat information is missing. Please select your seats again."
      );

      return;
    }

    // ==========================================================
    // ROUND TRIP RETURN VALIDATION
    // ==========================================================

    if (isRoundTrip) {
      if (!returnFlight) {
        alert(
          "Return flight information is missing."
        );

        return;
      }

      if (
        !Array.isArray(returnSelectedSeats) ||
        returnSelectedSeats.length === 0
      ) {
        alert(
          "Return flight seats are missing. Please select your return seats again."
        );

        return;
      }
    }

    // ==========================================================
    // OUTBOUND FLIGHT ID
    // ==========================================================

    const flightId =
      flight?._id ||
      flight?.id ||
      flight?.flightId;

    if (!flightId) {
      alert(
        "Flight ID is missing. Please try again."
      );

      return;
    }

    // ==========================================================
    // RETURN FLIGHT ID
    // ==========================================================

    let returnFlightId = null;

    if (isRoundTrip) {
      returnFlightId =
        returnFlight?._id ||
        returnFlight?.id ||
        returnFlight?.flightId;

      if (!returnFlightId) {
        alert(
          "Return flight ID is missing. Please try again."
        );

        return;
      }
    }

    // ==========================================================
    // START PROCESSING
    // ==========================================================

    setIsProcessing(true);

    // ==========================================================
    // SANITIZE OUTBOUND FLIGHT
    // ==========================================================

    const sanitizedFlight = {
      ...flight,
      _id: flightId,
      id: flightId,
      flightId,
    };

    // ==========================================================
    // SANITIZE RETURN FLIGHT
    // ==========================================================

    let sanitizedReturnFlight = null;

    if (isRoundTrip) {
      sanitizedReturnFlight = {
        ...returnFlight,
        _id: returnFlightId,
        id: returnFlightId,
        flightId: returnFlightId,
      };
    }

    // ==========================================================
    // GO TO BOOKING REVIEW
    // ==========================================================

    navigate("/booking-review", {
      state: {
        // Main flight
        flight: sanitizedFlight,

        // Return flight
        returnFlight: sanitizedReturnFlight,

        // Trip type
        tripType,

        // Outbound seats
        selectedSeats,

        // Return seats
        returnSelectedSeats:

          isRoundTrip
            ? returnSelectedSeats
            : [],

        // Passenger details
        passengers,

        // Total amount
        totalPrice:
          Number(totalPrice) || 0,
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
  // MISSING DATA PROTECTION
  // ============================================================

  if (
    !flight ||
    !Array.isArray(selectedSeats) ||
    selectedSeats.length === 0
  ) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-6 text-white">

        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-2xl">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <span className="text-3xl">
              ⚠️
            </span>
          </div>

          <h2 className="mb-3 text-2xl font-bold">
            Booking Information Missing
          </h2>

          <p className="mb-7 text-slate-400">
            No flight or seat information was
            provided. Please select a flight and
            seat again.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              rounded-xl
              bg-blue-600
              px-6
              py-3
              font-bold
              text-white
              shadow-lg
              shadow-blue-600/20
              transition
              hover:bg-blue-500
            "
          >
            Go to Home ✈️
          </button>

        </div>
      </div>
    );
  }

  // ============================================================
  // OUTBOUND DISPLAY DATA
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

  const airline =
    flight?.airline || "Airline";

  const flightNumber =
    flight?.flightNumber || "Flight";

  // ============================================================
  // RETURN DISPLAY DATA
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

  const returnAirline =
    returnFlight?.airline || "Airline";

  const returnFlightNumber =
    returnFlight?.flightNumber || "Flight";

  // ============================================================
  // TOTAL
  // ============================================================

  const bookingTotal =
    Number(totalPrice) || 0;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen w-full bg-slate-950 px-4 py-6 text-white md:px-8 md:py-8">

      {/* ======================================================
          PROCESSING OVERLAY
      ====================================================== */}

      {isProcessing && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-slate-950/95 backdrop-blur-xl">

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
              Preparing Your Review... ✈️
            </h2>

            <p className="mt-3 text-sm uppercase tracking-widest text-slate-400">
              Opening booking review
            </p>

          </div>

        </div>
      )}

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="mx-auto w-full max-w-4xl pb-12">

        {/* ====================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          onClick={handleBack}
          disabled={isProcessing}
          className="
            mb-6
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
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <FaArrowLeft />
          Back to Flight Details
        </button>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">

          <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 md:p-8">

            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-100">
              Passenger Information
            </p>

            <h1 className="text-3xl font-extrabold md:text-4xl">
              Passenger Details
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              Enter the details exactly as they
              appear on the passenger's travel
              document.
            </p>

          </div>

          {/* ==================================================
              TRIP TYPE
          ================================================== */}

          <div className="border-b border-white/10 px-6 py-5 md:px-8">

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">

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

          {/* ==================================================
              OUTBOUND FLIGHT
          ================================================== */}

          <div className="p-6 md:p-8">

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FaPlane className="-rotate-45" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  {isRoundTrip
                    ? "Departure Flight"
                    : "Selected Flight"}
                </p>

                <h2 className="text-lg font-bold">
                  {airline} · {flightNumber}
                </h2>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Airline */}

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Airline
                </p>

                <p className="mt-1 font-bold">
                  {airline}
                </p>

                <p className="text-sm text-slate-400">
                  {flightNumber}
                </p>

              </div>

              {/* Route */}

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Route
                </p>

                <p className="mt-1 text-lg font-bold">
                  {fromCode}

                  <span className="mx-2 text-blue-400">
                    →
                  </span>

                  {toCode}
                </p>

              </div>

              {/* Seats */}

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Departure Seats
                </p>

                <p className="mt-1 font-bold text-blue-400">
                  {selectedSeats.join(", ")}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              RETURN FLIGHT
          ================================================== */}

          {isRoundTrip && (
            <div className="border-t border-white/10 p-6 md:p-8">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <FaPlane className="rotate-180" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Return Flight
                  </p>

                  <h2 className="text-lg font-bold">
                    {returnAirline} ·{" "}
                    {returnFlightNumber}
                  </h2>
                </div>

              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* Airline */}

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Airline
                  </p>

                  <p className="mt-1 font-bold">
                    {returnAirline}
                  </p>

                  <p className="text-sm text-slate-400">
                    {returnFlightNumber}
                  </p>

                </div>

                {/* Route */}

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Return Route
                  </p>

                  <p className="mt-1 text-lg font-bold">

                    {returnFromCode}

                    <span className="mx-2 text-amber-400">
                      →
                    </span>

                    {returnToCode}

                  </p>

                </div>

                {/* Seats */}

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Return Seats
                  </p>

                  <p className="mt-1 font-bold text-amber-400">
                    {returnSelectedSeats.join(", ")}
                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* ======================================================
            PASSENGER FORM
        ====================================================== */}

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">

          <div className="mb-8">

            <h2 className="text-2xl font-bold">
              Traveller Information
            </h2>

            <p className="mt-1 text-sm text-slate-400">

              Please enter details for{" "}

              <strong className="text-white">
                {selectedSeats.length}
              </strong>{" "}

              passenger
              {selectedSeats.length > 1
                ? "s"
                : ""}.

              {isRoundTrip && (
                <span className="ml-1">
                  These passenger details apply to
                  both flights.
                </span>
              )}

            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ==================================================
                PASSENGERS
            ================================================== */}

            {passengers.map(
              (passenger, index) => (
                <div
                  key={`${selectedSeats[index]}-${index}`}
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-slate-950/70
                    p-5
                    shadow-lg
                    md:p-6
                  "
                >

                  {/* Passenger Header */}

                  <div className="mb-5 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                        <FaUser />
                      </div>

                      <div>

                        <h3 className="font-bold text-white">
                          Passenger{" "}
                          {index + 1}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Departure Seat{" "}
                          {selectedSeats[index]}
                        </p>

                      </div>

                    </div>

                    <div className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">
                      Seat{" "}
                      {selectedSeats[index]}
                    </div>

                  </div>

                  {/* Fields */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* NAME */}

                    <div className="md:col-span-2">

                      <label
                        htmlFor={`name-${index}`}
                        className="mb-2 block text-sm font-semibold text-slate-300"
                      >
                        Full Name
                      </label>

                      <input
                        id={`name-${index}`}
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={passenger.name}
                        onChange={(e) =>
                          handleChange(
                            index,
                            e
                          )
                        }
                        autoComplete="name"
                        required
                        disabled={isProcessing}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-slate-900
                          px-4
                          py-3
                          text-white
                          outline-none
                          placeholder:text-slate-600
                          transition
                          focus:border-blue-400
                          focus:ring-2
                          focus:ring-blue-400/20
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />

                    </div>

                    {/* AGE */}

                    <div>

                      <label
                        htmlFor={`age-${index}`}
                        className="mb-2 block text-sm font-semibold text-slate-300"
                      >
                        Age
                      </label>

                      <input
                        id={`age-${index}`}
                        type="number"
                        name="age"
                        min="1"
                        max="120"
                        placeholder="Age"
                        value={passenger.age}
                        onChange={(e) =>
                          handleChange(
                            index,
                            e
                          )
                        }
                        required
                        disabled={isProcessing}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-slate-900
                          px-4
                          py-3
                          text-white
                          outline-none
                          placeholder:text-slate-600
                          transition
                          focus:border-blue-400
                          focus:ring-2
                          focus:ring-blue-400/20
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />

                    </div>

                    {/* GENDER */}

                    <div className="md:col-span-3">

                      <label
                        htmlFor={`gender-${index}`}
                        className="mb-2 block text-sm font-semibold text-slate-300"
                      >
                        Gender
                      </label>

                      <select
                        id={`gender-${index}`}
                        name="gender"
                        value={passenger.gender}
                        onChange={(e) =>
                          handleChange(
                            index,
                            e
                          )
                        }
                        disabled={isProcessing}
                        className="
                          w-full
                          cursor-pointer
                          rounded-xl
                          border
                          border-white/10
                          bg-slate-900
                          px-4
                          py-3
                          text-white
                          outline-none
                          transition
                          focus:border-blue-400
                          focus:ring-2
                          focus:ring-blue-400/20
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                  </div>

                </div>
              )
            )}

            {/* ==================================================
                PRICE SUMMARY
            ================================================== */}

            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Total Booking Amount
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-blue-400">

                    ₹
                    {bookingTotal.toLocaleString(
                      "en-IN"
                    )}

                  </p>

                </div>

                <FaCheckCircle className="text-3xl text-emerald-400" />

              </div>

              {/* ==================================================
                  OUTBOUND SEATS
              ================================================== */}

              <div className="mt-4">

                <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                  Departure Seats
                </p>

                <div className="flex flex-wrap gap-2">

                  {selectedSeats.map(
                    (seat) => (
                      <span
                        key={`outbound-${seat}`}
                        className="
                          rounded-lg
                          border
                          border-white/10
                          bg-white/5
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          text-slate-300
                        "
                      >
                        Seat {seat}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* ==================================================
                  RETURN SEATS
              ================================================== */}

              {isRoundTrip && (
                <div className="mt-4">

                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                    Return Seats
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {returnSelectedSeats.map(
                      (seat) => (
                        <span
                          key={`return-${seat}`}
                          className="
                            rounded-lg
                            border
                            border-amber-400/20
                            bg-amber-500/5
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-amber-300
                          "
                        >
                          Seat {seat}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* ==================================================
                SUBMIT
            ================================================== */}

            <button
              type="submit"
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
                px-6
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
                disabled:from-slate-800
                disabled:to-slate-800
                disabled:text-slate-500
              "
            >

              {isProcessing ? (
                <>
                  <FaPlane className="-rotate-45 animate-pulse" />

                  Opening Booking Review...
                </>
              ) : (
                <>
                  Confirm & Proceed to Review

                  <FaPlane className="-rotate-45" />
                </>
              )}

            </button>

            <p className="text-center text-xs text-slate-500">
              Please verify all passenger details
              before continuing.
            </p>

          </form>

        </div>

      </div>
    </div>
  );
}

export default PassengerDetails;