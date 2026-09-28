
import React, { useEffect, useState } from "react";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaExchangeAlt,
  FaRoute,
} from "react-icons/fa";
import axios from "axios";

function SearchForm({ onSearch }) {
  // ============================================================
  // STATES
  // ============================================================

  const [tripType, setTripType] = useState("one-way");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [airports, setAirports] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(true);

  // ============================================================
  // TODAY
  // ============================================================

  const today = new Date().toISOString().split("T")[0];

  // ============================================================
  // LOAD AIRPORTS
  // ============================================================

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setLoadingAirports(true);

        const response = await axios.get(
          "https://flight-booking-app-6z55.onrender.com/api/airports"
        );

        const result = response.data;

        if (Array.isArray(result)) {
          setAirports(result);
        } else if (Array.isArray(result?.data)) {
          setAirports(result.data);
        } else if (Array.isArray(result?.airports)) {
          setAirports(result.airports);
        } else {
          setAirports([]);
        }
      } catch (error) {
        console.error("Airport API Error:", error);

        setAirports([]);
      } finally {
        setLoadingAirports(false);
      }
    };

    fetchAirports();
  }, []);

  // ============================================================
  // TRIP TYPE CHANGE
  // ============================================================

  const handleTripTypeChange = (type) => {
    setTripType(type);

    // If changing to one-way,
    // clear return date.
    if (type === "one-way") {
      setReturnDate("");
    }
  };

  // ============================================================
  // SWAP AIRPORTS
  // ============================================================

  const handleSwap = () => {
    const currentFrom = from;

    setFrom(to);
    setTo(currentFrom);
  };

  // ============================================================
  // SEARCH SUBMIT
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    // ==========================================================
    // BASIC VALIDATION
    // ==========================================================

    if (!from || !to || !date) {
      alert(
        "Please select departure airport, arrival airport and departure date."
      );

      return;
    }

    if (from === to) {
      alert(
        "Departure and arrival airports cannot be the same."
      );

      return;
    }

    // ==========================================================
    // ROUND TRIP VALIDATION
    // ==========================================================

    if (tripType === "round-trip" && !returnDate) {
      alert(
        "Please select your return date for a round trip."
      );

      return;
    }

    if (
      tripType === "round-trip" &&
      returnDate &&
      returnDate < date
    ) {
      alert(
        "Return date cannot be earlier than departure date."
      );

      return;
    }

    // ==========================================================
    // SEARCH DATA
    // ==========================================================

    const searchData = {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      date,
      tripType,
      returnDate:
        tripType === "round-trip"
          ? returnDate
          : null,
    };

    console.log(
      "========================================"
    );

    console.log("SEARCH DATA:", searchData);

    console.log(
      "Trip Type:",
      searchData.tripType
    );

    console.log(
      "From:",
      searchData.from
    );

    console.log(
      "To:",
      searchData.to
    );

    console.log(
      "Departure Date:",
      searchData.date
    );

    console.log(
      "Return Date:",
      searchData.returnDate
    );

    console.log(
      "========================================"
    );

    // ==========================================================
    // SEND TO HOME.JSX
    // ==========================================================

    onSearch(searchData);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-2"
    >
      {/* ======================================================
          TRIP TYPE
      ======================================================= */}

      <div className="flex justify-center">
        <div
          className="
            flex
            w-full
            max-w-md
            rounded-2xl
            border
            border-white/15
            bg-slate-950/70
            p-1
            shadow-lg
          "
        >
          {/* ONE WAY */}

          <button
            type="button"
            onClick={() =>
              handleTripTypeChange("one-way")
            }
            className={`
              flex-1
              rounded-xl
              px-4
              py-3
              text-sm
              font-bold
              transition-all
              duration-300
              ${
                tripType === "one-way"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-300 hover:bg-white/10"
              }
            `}
          >
            <span className="mr-2">
              ✈️
            </span>

            One Way
          </button>

          {/* ROUND TRIP */}

          <button
            type="button"
            onClick={() =>
              handleTripTypeChange("round-trip")
            }
            className={`
              flex-1
              rounded-xl
              px-4
              py-3
              text-sm
              font-bold
              transition-all
              duration-300
              ${
                tripType === "round-trip"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-300 hover:bg-white/10"
              }
            `}
          >
            <span className="mr-2">
              🔄
            </span>

            Round Trip
          </button>
        </div>
      </div>

      {/* ======================================================
          AIRPORT SECTION
      ======================================================= */}

      <div
        className="
          grid
          grid-cols-1
          items-center
          gap-4
          md:grid-cols-5
        "
      >
        {/* FROM */}

        <div className="relative md:col-span-2">
          <label
            htmlFor="from"
            className="
              mb-1
              block
              text-sm
              font-semibold
              tracking-wide
              text-white/90
            "
          >
            From — Departure Airport
          </label>

          <div className="relative">
            <FaPlaneDeparture
              className="
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-lg
                text-blue-400
              "
            />

            <select
              id="from"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
              disabled={loadingAirports}
              className="
                w-full
                cursor-pointer
                rounded-xl
                border
                border-white/30
                bg-slate-900/90
                py-3.5
                pl-12
                pr-4
                text-white
                shadow-inner
                transition
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-400
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              required
            >
              <option
                value=""
                className="bg-slate-900 text-slate-400"
              >
                {loadingAirports
                  ? "Loading airports..."
                  : "Select Departure Airport"}
              </option>

              {airports.map((airport) => (
                <option
                  key={airport._id}
                  value={airport.airportCode}
                  className="bg-slate-900 text-white"
                >
                  {airport.city} (
                  {airport.airportCode}) -{" "}
                  {airport.airportName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SWAP */}

        <div className="flex items-center justify-center text-center">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!from && !to}
            className="
              mt-6
              cursor-pointer
              rounded-full
              border
              border-white/20
              bg-white/10
              p-3
              text-white
              shadow-lg
              transition-all
              duration-300
              hover:rotate-180
              hover:bg-blue-600
              disabled:cursor-not-allowed
              disabled:opacity-40
              md:rotate-0
            "
            title="Swap Airports"
          >
            <FaExchangeAlt
              className="
                rotate-90
                text-amber-200
                md:rotate-0
              "
            />
          </button>
        </div>

        {/* TO */}

        <div className="relative md:col-span-2">
          <label
            htmlFor="to"
            className="
              mb-1
              block
              text-sm
              font-semibold
              tracking-wide
              text-white/90
            "
          >
            To — Arrival Airport
          </label>

          <div className="relative">
            <FaPlaneArrival
              className="
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-lg
                text-amber-300
              "
            />

            <select
              id="to"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
              disabled={loadingAirports}
              className="
                w-full
                cursor-pointer
                rounded-xl
                border
                border-white/30
                bg-slate-900/90
                py-3.5
                pl-12
                pr-4
                text-white
                shadow-inner
                transition
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-400
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              required
            >
              <option
                value=""
                className="bg-slate-900 text-slate-400"
              >
                {loadingAirports
                  ? "Loading airports..."
                  : "Select Arrival Airport"}
              </option>

              {airports.map((airport) => (
                <option
                  key={airport._id}
                  value={airport.airportCode}
                  className="bg-slate-900 text-white"
                >
                  {airport.city} (
                  {airport.airportCode}) -{" "}
                  {airport.airportName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================
          DATE SECTION
      ======================================================= */}

      <div
        className={`
          grid
          grid-cols-1
          gap-4
          ${
            tripType === "round-trip"
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
          }
        `}
      >
        {/* DEPARTURE DATE */}

        <div className="relative">
          <label
            htmlFor="date"
            className="
              mb-1
              block
              text-sm
              font-semibold
              tracking-wide
              text-white/90
            "
          >
            Departure Date
          </label>

          <div className="relative">
            <FaCalendarAlt
              className="
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-lg
                text-amber-200
              "
            />

            <input
              type="date"
              id="date"
              value={date}
              min={today}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="
                w-full
                cursor-pointer
                rounded-xl
                border
                border-white/30
                bg-slate-900/90
                py-3.5
                pl-12
                pr-4
                text-white
                shadow-inner
                transition
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-400
              "
              required
            />
          </div>
        </div>

        {/* RETURN DATE */}

        {tripType === "round-trip" && (
          <div className="relative">
            <label
              htmlFor="returnDate"
              className="
                mb-1
                block
                text-sm
                font-semibold
                tracking-wide
                text-white/90
              "
            >
              Return Date
            </label>

            <div className="relative">
              <FaCalendarAlt
                className="
                  absolute
                  left-4
                  top-1/2
                  z-10
                  -translate-y-1/2
                  text-lg
                  text-indigo-300
                "
              />

              <input
                type="date"
                id="returnDate"
                value={returnDate}
                min={date || today}
                onChange={(e) =>
                  setReturnDate(
                    e.target.value
                  )
                }
                className="
                  w-full
                  cursor-pointer
                  rounded-xl
                  border
                  border-white/30
                  bg-slate-900/90
                  py-3.5
                  pl-12
                  pr-4
                  text-white
                  shadow-inner
                  transition
                  focus:border-indigo-400
                  focus:ring-2
                  focus:ring-indigo-400
                "
                required
              />
            </div>
          </div>
        )}

        {/* SEARCH BUTTON */}

        <div
          className={
            tripType === "round-trip"
              ? "md:col-span-1"
              : ""
          }
        >
          <label className="mb-1 block text-sm font-semibold text-transparent">
            Search
          </label>

          <button
            type="submit"
            disabled={loadingAirports}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-blue-400/30
              bg-linear-to-r
              from-blue-600
              via-indigo-600
              to-blue-700
              px-6
              py-3.5
              text-base
              font-bold
              text-white
              shadow-xl
              shadow-blue-600/40
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:from-blue-500
              hover:to-indigo-500
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:translate-y-0
            "
          >
            <FaRoute />

            Search Flights
          </button>
        </div>
      </div>

      {/* ======================================================
          ROUND TRIP INFO
      ======================================================= */}

      {tripType === "round-trip" && (
        <div
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-indigo-400/20
            bg-indigo-500/10
            px-4
            py-3
            text-center
            text-xs
            text-indigo-200
            sm:text-sm
          "
        >
          <span>🔄</span>

          <span>
            Round Trip:{" "}
            {from || "From"} →{" "}
            {to || "To"} →{" "}
            {from || "From"}
          </span>
        </div>
      )}
    </form>
  );
}

export default SearchForm;
