import React, { useState, useEffect } from "react";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaExchangeAlt,
} from "react-icons/fa";
import axios from "axios";

function SearchForm({ onSearch }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [airports, setAirports] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(true);

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

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
        } else if (Array.isArray(result.data)) {
          setAirports(result.data);
        } else if (Array.isArray(result.airports)) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!from || !to || !date) {
      alert("Please select departure, arrival and travel date.");
      return;
    }

    if (from === to) {
      alert("Departure and arrival airports cannot be the same.");
      return;
    }

    // Send only airport codes + date
    onSearch({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      date,
    });
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-6">
      {/* ================= AIRPORT SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

        {/* FROM */}
        <div className="md:col-span-2 relative">
          <label
            htmlFor="from"
            className="block text-sm font-semibold text-white/90 mb-1 tracking-wide"
          >
            From — Departure Airport
          </label>

          <div className="relative">
            <FaPlaneDeparture className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 z-10 text-lg" />

            <select
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={loadingAirports}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-inner cursor-pointer disabled:opacity-60"
              required
            >
              <option value="" className="bg-slate-900 text-slate-400">
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
                  {airport.city} ({airport.airportCode}) -{" "}
                  {airport.airportName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SWAP */}
        <div className="text-center flex justify-center items-center">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!from && !to}
            className="mt-6 p-3 rounded-full bg-white/10 hover:bg-blue-600 text-white border border-white/20 transition-all duration-300 shadow-lg cursor-pointer transform hover:rotate-180 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Swap Airports"
          >
            <FaExchangeAlt className="transform rotate-90 md:rotate-0 text-amber-200" />
          </button>
        </div>

        {/* TO */}
        <div className="md:col-span-2 relative">
          <label
            htmlFor="to"
            className="block text-sm font-semibold text-white/90 mb-1 tracking-wide"
          >
            To — Arrival Airport
          </label>

          <div className="relative">
            <FaPlaneArrival className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-300 z-10 text-lg" />

            <select
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loadingAirports}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-inner cursor-pointer disabled:opacity-60"
              required
            >
              <option value="" className="bg-slate-900 text-slate-400">
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
                  {airport.city} ({airport.airportCode}) -{" "}
                  {airport.airportName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= DATE + SEARCH ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

        {/* DATE */}
        <div className="relative">
          <label
            htmlFor="date"
            className="block text-sm font-semibold text-white/90 mb-1 tracking-wide"
          >
            Departure Date
          </label>

          <div className="relative">
            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-200 text-lg" />

            <input
              type="date"
              id="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-inner cursor-pointer"
              required
            />
          </div>
        </div>

        {/* SEARCH */}
        <div>
          <button
            type="submit"
            disabled={loadingAirports}
            className="w-full bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-300 shadow-xl shadow-blue-600/40 border border-blue-400/30 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Search Flights ✈️
          </button>
        </div>
      </div>
    </form>
  );
}

export default SearchForm;