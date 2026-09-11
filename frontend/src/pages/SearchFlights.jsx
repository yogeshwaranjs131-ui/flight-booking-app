import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlightCard from "../components/FlightCard.jsx";
import Loader from "../components/Loader.jsx";
import flightService from "../services/flightService";
import { formatDate } from "../utils/formatDate";
import { formatCurrency } from "../utils/formatCurrency.js";
import { FaExclamationCircle } from "react-icons/fa";

function SearchFlights() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fromParam = (queryParams.get("from") || "").toUpperCase();
  const toParam = (queryParams.get("to") || "").toUpperCase();
  const dateParam = queryParams.get("date") || "";

  const [sortBy, setSortBy] = useState(queryParams.get('sortBy') || 'price');
  const [filters, setFilters] = useState({
    airline: queryParams.get('airline') || 'all',
    stops: queryParams.get('stops') || 'all',
  });
  const [maxPrice, setMaxPrice] = useState(Number(queryParams.get('maxPrice')) || 100000);
  const [timeFilters, setTimeFilters] = useState(queryParams.get('times')?.split(',').filter(Boolean) || []);

  // API Call - Only runs when search parameters change
  useEffect(() => {
    let isMounted = true;
    const fetchFlightsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await flightService.searchFlights({ from: fromParam, to: toParam, date: dateParam });
        if (isMounted) {
          setResponseData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch flights");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFlightsData();

    return () => {
      isMounted = false;
    };
  }, [fromParam, toParam, dateParam]);

  const flights = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData.data)) return responseData.data;
    if (Array.isArray(responseData.flights)) return responseData.flights;
    if (responseData.data && Array.isArray(responseData.data.data)) return responseData.data.data;
    
    const possibleArray = Object.values(responseData).find(val => Array.isArray(val));
    return possibleArray || [];
  }, [responseData]);

  const priceRange = useMemo(() => {
    if (!flights || flights.length === 0) return { min: 0, max: 50000 };
    const prices = flights.map(f => f.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [flights]);

  const durationToMinutes = (duration) => {
    if (!duration) return 0;
    const parts = duration.match(/(\d+)h\s*(\d+)m/);
    if (parts) {
      const hours = parseInt(parts[1], 10);
      const minutes = parseInt(parts[2], 10);
      return hours * 60 + minutes;
    }
    return 0;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleTimeFilterChange = (e) => {
    const { value, checked } = e.target;
    setTimeFilters(prev => 
        checked ? [...prev, value] : prev.filter(time => time !== value)
    );
  };

  const handleClearFilters = () => {
    setFilters({
      airline: 'all',
      stops: 'all',
    });
    setSortBy('price');
    setTimeFilters([]);
    if (priceRange.max > 0) {
      setMaxPrice(priceRange.max);
    }
  };

  const uniqueAirlines = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    return [...new Set(flights.map(f => f.airline).filter(Boolean))];
  }, [flights]);

  useEffect(() => {
    if (priceRange.max > 0 && !queryParams.has('maxPrice')) {
      setMaxPrice(priceRange.max);
    }
  }, [priceRange.max]);

  const filteredAndSortedFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    
    const filteredFlights = flights.filter((flight) => {
      if (timeFilters.length > 0 && flight.departureTime) {
        const departureDate = new Date(flight.departureTime);
        if (!isNaN(departureDate.getTime())) {
          const departureHour = departureDate.getHours();
          const matchesTime = timeFilters.some(slot => {
            if (slot === 'morning' && departureHour >= 5 && departureHour < 12) return true;
            if (slot === 'afternoon' && departureHour >= 12 && departureHour < 17) return true;
            if (slot === 'evening' && departureHour >= 17 && departureHour < 21) return true;
            if (slot === 'night' && (departureHour >= 21 || departureHour < 5)) return true;
            return false;
          });
          if (!matchesTime) return false;
        }
      }

      const airlineFilter = filters.airline === 'all' || (flight.airline && flight.airline.toLowerCase() === filters.airline.toLowerCase());
      const stopsFilter = filters.stops === 'all' || (filters.stops === 'direct' && (flight.stops === 0 || !flight.stops || flight.stops === '0'));
      const priceFilter = (flight.price || 0) <= maxPrice;
      
      return airlineFilter && stopsFilter && priceFilter;
    });

    const sortableFlights = [...filteredFlights];

    if (sortBy === 'price') {
      sortableFlights.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'duration') {
      sortableFlights.sort((a, b) => 
        durationToMinutes(a.duration) - durationToMinutes(b.duration)
      );
    }

    return sortableFlights;
  }, [flights, sortBy, filters, maxPrice, timeFilters]);

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 via-sky-300 to-blue-500 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              {fromParam && toParam ? (
                <>
                  <p className="text-sm text-slate-600">Showing flights for</p>
                  <h1 className="text-3xl font-extrabold text-blue-900">
                    {fromParam} &rarr; {toParam}
                  </h1>
                  <p className="text-slate-700">{dateParam ? formatDate(dateParam) : ''}</p>
                </>
              ) : (
                <h1 className="text-3xl font-bold text-blue-900">Showing All Available Flights</h1>
              )}
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all cursor-pointer shadow-lg"
            >
              Modify Search ✈️
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-2xl sticky top-6">
              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                <h3 className="text-xl font-bold text-slate-900">Filters</h3>
                <button onClick={handleClearFilters} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                  Clear All
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Stops</h4>
                  <select value={filters.stops} onChange={(e) => handleFilterChange('stops', e.target.value)} className="w-full px-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer">
                    <option value="all">All Stops</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Departure Time</h4>
                  <div className="space-y-2">
                    {['Morning (5am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-9pm)', 'Night (9pm-5am)'].map(time => {
                      const value = time.split(' ')[0].toLowerCase();
                      return (
                        <label key={value} className="flex items-center text-sm text-slate-700 cursor-pointer">
                          <input type="checkbox" value={value} checked={timeFilters.includes(value)} onChange={handleTimeFilterChange} className="h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer" />
                          <span className="ml-2">{time}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Airlines</h4>
                  <select value={filters.airline} onChange={(e) => handleFilterChange('airline', e.target.value)} className="w-full px-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer">
                    <option value="all">All Airlines</option>
                    {uniqueAirlines.map(airline => (
                      <option key={airline} value={airline}>{airline}</option>
                    ))}
                  </select>
                </div>
                {flights && flights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Max Price</h4>
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="text-sm text-blue-900 text-right mt-1 font-semibold">Up to {formatCurrency(maxPrice)}</div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            {loading ? (
              <div className="text-center py-16 bg-white/50 rounded-2xl border border-white/40 shadow-xl">
                <h1 className="text-2xl font-bold text-blue-900 animate-pulse mb-4">Searching for flights...</h1>
                <Loader />
              </div>
            ) : (
              <>
                {filteredAndSortedFlights && filteredAndSortedFlights.length > 0 && (
                  <div className="flex justify-end items-center mb-6">
                    <label htmlFor="sort" className="text-sm font-medium text-slate-800 mr-2">Sort by:</label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer shadow-sm"
                    >
                      <option value="price">Price (Low to High)</option>
                      <option value="duration">Duration (Shortest)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-6 pb-12">
                  {error && (
                    <div className="text-center bg-red-100 border border-red-300 text-red-800 p-8 rounded-2xl shadow-xl backdrop-blur-md">
                      <FaExclamationCircle className="mx-auto text-4xl mb-4 text-red-500" />
                      <p className="font-semibold text-lg">An error occurred while fetching flights.</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  {!error && filteredAndSortedFlights && filteredAndSortedFlights.length > 0 ? (
                    filteredAndSortedFlights.map((flight) => <FlightCard key={flight._id || flight.id} flight={flight} />)
                  ) : (
                    !error && (
                      <div className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-2xl border border-white/40 shadow-2xl">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No flights found</h3>
                        <p className="text-slate-600 mb-6">We couldn't find any flights matching your search criteria. Please try different airports or dates.</p>
                        <button
                          onClick={() => navigate('/')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg cursor-pointer"
                        >
                          Book Another Flight ✈️
                        </button>
                      </div>
                    )
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