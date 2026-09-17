import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlightCard from "../components/FlightCard.jsx";
import Loader from "../components/Loader.jsx";
import flightService from "../services/flightService";
import { formatDate } from "../utils/formatDate";
import { formatCurrency } from "../utils/formatCurrency.js";

function SearchFlights() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const fromParam = (queryParams.get("from") || "").toUpperCase();
  const toParam = (queryParams.get("to") || "").toUpperCase();
  const dateParam = queryParams.get("date") || "";

  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [sortBy, setSortBy] = useState(
    queryParams.get("sortBy") || "price"
  );

  const [filters, setFilters] = useState({
    airline: queryParams.get("airline") || "all",
    stops: queryParams.get("stops") || "all",
  });

  const [maxPrice, setMaxPrice] = useState(
    Number(queryParams.get("maxPrice")) || 100000
  );

  const [timeFilters, setTimeFilters] = useState(
    queryParams.get("times")?.split(",").filter(Boolean) || []
  );

  // =========================================================
  // FETCH FLIGHTS
  // =========================================================

  useEffect(() => {
    const fetchFlightsData = async () => {
      if (!fromParam || !toParam || !dateParam) {
        setResponseData([]);
        setErrorMessage("Please select departure, arrival and travel date.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const result = await flightService.searchFlights({
          from: fromParam,
          to: toParam,
          date: dateParam,
        });

        console.log("Flight Search Response:", result);

        /*
          Backend response:

          {
            success: true,
            count: 1,
            data: [...]
          }
        */

        if (result?.success === false) {
          setResponseData([]);
          setErrorMessage(
            result.message || "Unable to search flights."
          );
          return;
        }

        setResponseData(result || []);
      } catch (error) {
        console.error("Flight Search Error:", error);

        setResponseData([]);

        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response?.status === 404) {
          setErrorMessage("Flight search route was not found.");
        } else if (error.response?.status === 500) {
          setErrorMessage("Server error. Please try again.");
        } else {
          setErrorMessage(
            "Unable to connect to the flight server. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFlightsData();
  }, [fromParam, toParam, dateParam]);

  // =========================================================
  // NORMALIZE API RESPONSE
  // =========================================================

  const flights = useMemo(() => {
    if (!responseData) {
      return [];
    }

    // Direct array
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // Backend response: { data: [...] }
    if (Array.isArray(responseData.data)) {
      return responseData.data;
    }

    // Alternative response: { flights: [...] }
    if (Array.isArray(responseData.flights)) {
      return responseData.flights;
    }

    // Nested response
    if (
      responseData.data &&
      Array.isArray(responseData.data.data)
    ) {
      return responseData.data.data;
    }

    return [];
  }, [responseData]);

  // =========================================================
  // PRICE RANGE
  // =========================================================

  const priceRange = useMemo(() => {
    if (!flights.length) {
      return {
        min: 0,
        max: 50000,
      };
    }

    const prices = flights
      .map((flight) => Number(flight.price) || 0)
      .filter((price) => price > 0);

    if (!prices.length) {
      return {
        min: 0,
        max: 50000,
      };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [flights]);

  // =========================================================
  // DURATION HELPER
  // =========================================================

  const durationToMinutes = (duration) => {
    if (!duration) return 0;

    const match = String(duration).match(
      /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i
    );

    if (!match) return 0;

    const hours = Number(match[1]) || 0;
    const minutes = Number(match[2]) || 0;

    return hours * 60 + minutes;
  };

  // =========================================================
  // FILTER HANDLERS
  // =========================================================

  const handleFilterChange = (filterName, value) => {
    setFilters((previous) => ({
      ...previous,
      [filterName]: value,
    }));
  };

  const handleTimeFilterChange = (event) => {
    const { value, checked } = event.target;

    setTimeFilters((previous) => {
      if (checked) {
        return [...previous, value];
      }

      return previous.filter((time) => time !== value);
    });
  };

  const handleClearFilters = () => {
    setFilters({
      airline: "all",
      stops: "all",
    });

    setSortBy("price");
    setTimeFilters([]);

    if (priceRange.max > 0) {
      setMaxPrice(priceRange.max);
    }
  };

  // =========================================================
  // AIRLINES
  // =========================================================

  const uniqueAirlines = useMemo(() => {
    if (!flights.length) {
      return [];
    }

    return [
      ...new Set(
        flights
          .map((flight) => flight.airline)
          .filter(Boolean)
      ),
    ];
  }, [flights]);

  // =========================================================
  // SET INITIAL MAX PRICE
  // =========================================================

  useEffect(() => {
    if (
      priceRange.max > 0 &&
      !queryParams.has("maxPrice")
    ) {
      setMaxPrice(priceRange.max);
    }
  }, [priceRange.max, queryParams]);

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredAndSortedFlights = useMemo(() => {
    if (!flights.length) {
      return [];
    }

    const filteredFlights = flights.filter((flight) => {
      // -----------------------------
      // TIME FILTER
      // -----------------------------

      if (
        timeFilters.length > 0 &&
        flight.departureTime
      ) {
        const departureDate = new Date(
          flight.departureTime
        );

        if (!Number.isNaN(departureDate.getTime())) {
          const departureHour =
            departureDate.getHours();

          const matchesTime = timeFilters.some(
            (slot) => {
              if (
                slot === "morning" &&
                departureHour >= 5 &&
                departureHour < 12
              ) {
                return true;
              }

              if (
                slot === "afternoon" &&
                departureHour >= 12 &&
                departureHour < 17
              ) {
                return true;
              }

              if (
                slot === "evening" &&
                departureHour >= 17 &&
                departureHour < 21
              ) {
                return true;
              }

              if (
                slot === "night" &&
                (departureHour >= 21 ||
                  departureHour < 5)
              ) {
                return true;
              }

              return false;
            }
          );

          if (!matchesTime) {
            return false;
          }
        }
      }

      // -----------------------------
      // AIRLINE
      // -----------------------------

      const airlineFilter =
        filters.airline === "all" ||
        (
          flight.airline &&
          flight.airline.toLowerCase() ===
            filters.airline.toLowerCase()
        );

      // -----------------------------
      // STOPS
      // -----------------------------

      const stopsFilter =
        filters.stops === "all" ||
        (
          filters.stops === "direct" &&
          (
            flight.stops === 0 ||
            flight.stops === "0" ||
            flight.stops === undefined ||
            flight.stops === null
          )
        );

      // -----------------------------
      // PRICE
      // -----------------------------

      const priceFilter =
        (Number(flight.price) || 0) <= maxPrice;

      return (
        airlineFilter &&
        stopsFilter &&
        priceFilter
      );
    });

    // Clone before sorting
    const sortableFlights = [
      ...filteredFlights,
    ];

    // -----------------------------
    // PRICE SORT
    // -----------------------------

    if (sortBy === "price") {
      sortableFlights.sort(
        (a, b) =>
          (Number(a.price) || 0) -
          (Number(b.price) || 0)
      );
    }

    // -----------------------------
    // DURATION SORT
    // -----------------------------

    if (sortBy === "duration") {
      sortableFlights.sort(
        (a, b) =>
          durationToMinutes(a.duration) -
          durationToMinutes(b.duration)
      );
    }

    return sortableFlights;
  }, [
    flights,
    sortBy,
    filters,
    maxPrice,
    timeFilters,
  ]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 via-sky-300 to-blue-500 text-slate-900 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-2xl mb-8">

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

            <div>
              {fromParam && toParam ? (
                <>
                  <p className="text-sm text-slate-600">
                    Showing flights for
                  </p>

                  <h1 className="text-3xl font-extrabold text-blue-900">
                    {fromParam} → {toParam}
                  </h1>

                  <p className="text-slate-700">
                    {dateParam
                      ? formatDate(dateParam)
                      : ""}
                  </p>
                </>
              ) : (
                <h1 className="text-3xl font-bold text-blue-900">
                  Showing All Available Flights
                </h1>
              )}
            </div>

            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all cursor-pointer shadow-lg"
            >
              Modify Search ✈️
            </button>

          </div>
        </div>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ================================================= */}
          {/* FILTER SIDEBAR */}
          {/* ================================================= */}

          <aside className="w-full lg:w-1/4">

            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-2xl sticky top-6">

              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">

                <h3 className="text-xl font-bold text-slate-900">
                  Filters
                </h3>

                <button
                  onClick={handleClearFilters}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  Clear All
                </button>

              </div>

              <div className="space-y-6">

                {/* STOPS */}

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Stops
                  </h4>

                  <select
                    value={filters.stops}
                    onChange={(e) =>
                      handleFilterChange(
                        "stops",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                  >
                    <option value="all">
                      All Stops
                    </option>

                    <option value="direct">
                      Direct
                    </option>
                  </select>
                </div>

                {/* DEPARTURE TIME */}

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Departure Time
                  </h4>

                  <div className="space-y-2">

                    {[
                      "Morning (5am-12pm)",
                      "Afternoon (12pm-5pm)",
                      "Evening (5pm-9pm)",
                      "Night (9pm-5am)",
                    ].map((time) => {

                      const value =
                        time
                          .split(" ")[0]
                          .toLowerCase();

                      return (
                        <label
                          key={value}
                          className="flex items-center text-sm text-slate-700 cursor-pointer"
                        >

                          <input
                            type="checkbox"
                            value={value}
                            checked={timeFilters.includes(
                              value
                            )}
                            onChange={
                              handleTimeFilterChange
                            }
                            className="h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer"
                          />

                          <span className="ml-2">
                            {time}
                          </span>

                        </label>
                      );
                    })}

                  </div>
                </div>

                {/* AIRLINES */}

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Airlines
                  </h4>

                  <select
                    value={filters.airline}
                    onChange={(e) =>
                      handleFilterChange(
                        "airline",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                  >
                    <option value="all">
                      All Airlines
                    </option>

                    {uniqueAirlines.map(
                      (airline) => (
                        <option
                          key={airline}
                          value={airline}
                        >
                          {airline}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* MAX PRICE */}

                {flights.length > 0 && (
                  <div>

                    <h4 className="font-semibold text-slate-700 mb-2">
                      Max Price
                    </h4>

                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(
                          Number(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="text-sm text-blue-900 text-right mt-1 font-semibold">
                      Up to{" "}
                      {formatCurrency(maxPrice)}
                    </div>

                  </div>
                )}

              </div>
            </div>
          </aside>

          {/* ================================================= */}
          {/* RESULTS */}
          {/* ================================================= */}

          <main className="w-full lg:w-3/4">

            {/* LOADING */}

            {loading && (
              <div className="text-center py-16 bg-white/50 rounded-2xl border border-white/40 shadow-xl">

                <h1 className="text-2xl font-bold text-blue-900 animate-pulse mb-4">
                  Searching for flights...
                </h1>

                <Loader />

              </div>
            )}

            {/* ERROR */}

            {!loading && errorMessage && (
              <div className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-2xl border border-red-200 shadow-2xl">

                <div className="text-5xl mb-4">
                  ⚠️
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Flight Search Failed
                </h3>

                <p className="text-slate-600 mb-6">
                  {errorMessage}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">

                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg cursor-pointer"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Modify Search
                  </button>

                </div>
              </div>
            )}

            {/* RESULTS */}

            {!loading &&
              !errorMessage && (
                <>

                  {/* SORT */}

                  {filteredAndSortedFlights.length > 0 && (
                    <div className="flex justify-between items-center mb-6">

                      <div className="text-sm text-slate-700 font-medium">
                        {filteredAndSortedFlights.length}{" "}
                        flight
                        {filteredAndSortedFlights.length !==
                        1
                          ? "s"
                          : ""}{" "}
                        found
                      </div>

                      <div className="flex items-center">

                        <label
                          htmlFor="sort"
                          className="text-sm font-medium text-slate-800 mr-2"
                        >
                          Sort by:
                        </label>

                        <select
                          id="sort"
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(e.target.value)
                          }
                          className="px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer shadow-sm"
                        >
                          <option value="price">
                            Price (Low to High)
                          </option>

                          <option value="duration">
                            Duration (Shortest)
                          </option>
                        </select>

                      </div>
                    </div>
                  )}

                  {/* FLIGHT CARDS */}

                  <div className="space-y-6 pb-12">

                    {filteredAndSortedFlights.length >
                    0 ? (
                      filteredAndSortedFlights.map(
                        (flight) => (
                          <FlightCard
                            key={
                              flight._id ||
                              flight.id
                            }
                            flight={flight}
                          />
                        )
                      )
                    ) : (
                      <div className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-2xl border border-white/40 shadow-2xl">

                        <div className="text-5xl mb-4">
                          ✈️
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                          No flights found
                        </h3>

                        <p className="text-slate-600 mb-6">
                          We couldn't find any
                          flights matching your
                          search criteria. Please
                          try another airport or
                          travel date.
                        </p>

                        <button
                          onClick={() =>
                            navigate("/")
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg cursor-pointer"
                        >
                          Book Another Flight ✈️
                        </button>

                      </div>
                    )}

                  </div>
                </>
              )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default SearchFlights;