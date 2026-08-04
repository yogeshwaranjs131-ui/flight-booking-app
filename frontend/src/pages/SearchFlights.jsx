import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlightCard from "../components/FlightCard.jsx";
import Loader from "../components/Loader.jsx";
import flightService from "../services/flightService";
import { useFetch } from "../hooks/useFetch";
import { formatDate } from "../utils/formatDate";
import { formatCurrency } from "../utils/formatCurrency.js";
import { FaExclamationCircle } from "react-icons/fa";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchFlights() {
  const queryParams = useQuery();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState(queryParams.get('sortBy') || 'price');
  const [filters, setFilters] = useState({
    airline: queryParams.get('airline') || 'all',
    stops: queryParams.get('stops') || 'all',
  });
  const [maxPrice, setMaxPrice] = useState(Number(queryParams.get('maxPrice')) || 100000);
  const [timeFilters, setTimeFilters] = useState(queryParams.get('times')?.split(',').filter(Boolean) || []);

  const searchParams = useMemo(() => ({
    from: queryParams.get("from") || "",
    to: queryParams.get("to") || "",
    date: queryParams.get("date") || "",
  }), [queryParams]);

  const { data: responseData, loading, error } = useFetch(() => {
    return flightService.searchFlights(searchParams);
  }, [searchParams.from, searchParams.to, searchParams.date]);

  const flights = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData.flights)) return responseData.flights;
    if (Array.isArray(responseData.data)) return responseData.data;
    return [];
  }, [responseData]);

  const priceRange = useMemo(() => {
    if (!flights || flights.length === 0) return { min: 0, max: 50000 };
    const prices = flights.map(f => f.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [flights]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchParams.from) params.set('from', searchParams.from);
    if (searchParams.to) params.set('to', searchParams.to);
    if (searchParams.date) params.set('date', searchParams.date);

    if (sortBy !== 'price') params.set('sortBy', sortBy);
    if (filters.airline !== 'all') params.set('airline', filters.airline);
    if (filters.stops !== 'all') params.set('stops', filters.stops);
    if (timeFilters.length > 0) params.set('times', timeFilters.join(','));
    
    if (priceRange.max > 0 && maxPrice < priceRange.max) {
      params.set('maxPrice', maxPrice);
    }

    navigate(`?${params.toString()}`, { replace: true });
  }, [sortBy, filters, timeFilters, maxPrice, searchParams.from, searchParams.to, searchParams.date, priceRange.max, navigate]);

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
    if (priceRange.max > 0) {
      if (!queryParams.has('maxPrice')) {
        setMaxPrice(priceRange.max);
      }
    }
  }, [priceRange.max, queryParams]);

  const filteredAndSortedFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    
    const filteredFlights = flights.filter((flight) => {
      // Time filter (Only apply if timeFilters are selected and departureTime exists)
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold text-gray-500 animate-pulse">Searching for flights...</h1>
        </div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            {searchParams.from && searchParams.to ? (
              <>
                <p className="text-sm text-gray-500">Showing flights for</p>
                <h1 className="text-3xl font-bold text-indigo-900">
                  {searchParams.from.toUpperCase()} &rarr; {searchParams.to.toUpperCase()}
                </h1>
                <p className="text-gray-600">{searchParams.date ? formatDate(searchParams.date) : ''}</p>
              </>
            ) : (
              <h1 className="text-3xl font-bold text-indigo-900">Showing All Available Flights</h1>
            )}
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-100 text-indigo-900 px-4 py-2 rounded-md font-semibold hover:bg-indigo-200 transition-colors self-start md:self-center cursor-pointer"
          >
            Modify Search
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-gray-800">Filters</h3>
              <button onClick={handleClearFilters} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">
                Clear All
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Stops</h4>
                <select value={filters.stops} onChange={(e) => handleFilterChange('stops', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="all">All Stops</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Departure Time</h4>
                <div className="space-y-2">
                  {['Morning (5am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-9pm)', 'Night (9pm-5am)'].map(time => {
                    const value = time.split(' ')[0].toLowerCase();
                    return (
                      <label key={value} className="flex items-center text-sm text-gray-600">
                        <input type="checkbox" value={value} checked={timeFilters.includes(value)} onChange={handleTimeFilterChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="ml-2">{time}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Airlines</h4>
                <select value={filters.airline} onChange={(e) => handleFilterChange('airline', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="all">All Airlines</option>
                  {uniqueAirlines.map(airline => (
                    <option key={airline} value={airline}>{airline}</option>
                  ))}
                </select>
              </div>
              {flights && flights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Max Price</h4>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-sm text-gray-600 text-right mt-1">Up to {formatCurrency(maxPrice)}</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="w-full lg:w-3/4">
          {filteredAndSortedFlights && filteredAndSortedFlights.length > 0 && (
            <div className="flex justify-end items-center mb-6">
              <label htmlFor="sort" className="text-sm font-medium text-gray-600 mr-2">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="price">Price (Low to High)</option>
                <option value="duration">Duration (Shortest)</option>
              </select>
            </div>
          )}

          <div className="space-y-6">
            {error && (
              <div className="text-center bg-red-50 border border-red-200 text-red-700 p-8 rounded-lg shadow-md">
                <FaExclamationCircle className="mx-auto text-4xl mb-4" />
                <p className="font-semibold">An error occurred while fetching flights.</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {!error && filteredAndSortedFlights && filteredAndSortedFlights.length > 0 ? (
              filteredAndSortedFlights.map((flight) => <FlightCard key={flight._id || flight.id} flight={flight} />)
            ) : (
              !loading && !error && (
                <div className="text-center bg-white p-12 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">No flights found</h3>
                  <p className="text-gray-500 mb-6">We couldn't find any flights matching your filters. Please try modifying your search or filters.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Book Another Flight
                  </button>
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SearchFlights;