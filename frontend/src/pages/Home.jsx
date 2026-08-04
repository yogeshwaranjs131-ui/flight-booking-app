import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';

const popularDestinations = [
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Kerala', image: 'https://www.thomascook.in/blog//wp-content/uploads/2014/10/backwaters-in-Kerala.jpg' },
  { name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80' },
];

const featuredDeals = [
  { from: 'Delhi', to: 'Goa', price: 4500, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { from: 'Mumbai', to: 'Kerala', price: 5200, image: 'https://media.istockphoto.com/id/860528756/photo/the-bandraworli-sea-link-mumbai-india.jpg?s=612x612&w=0&k=20&c=xT9TK7oYkP6TP62lHqP0H-9mfz9cWva4OcYEnt06cjc%3D' },
  { from: 'Bangalore', to: 'Jaipur', price: 6800, image: 'https://prod-bloom-website.s3.ap-southeast-1.amazonaws.com/content/1688638707115-1440x700.jpg' },
];

function Home() {
  const navigate = useNavigate();

  const handleSearch = (searchParams) => {
    navigate(`/search-flights?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
  };

  // Safe Handler for image loading errors using local SVG data string to prevent infinite loops and connection errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if fallback also fails
    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%236b7280'>Image Not Found</text></svg>";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center h-130 flex flex-col items-center justify-center text-white text-center px-4"
        style={{ backgroundImage: "url('https://c.ndtvimg.com/2026-06/ppcqejl4_indigo-_625x300_02_June_26.png?im=FaceCrop,algorithm=dnn,width=1600,height=900')" }}
      >
        
        <div className="relative z-10 max-w-3xl">
          <span className="bg-blue-600 text-white text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block shadow-md">
            On-Time, Courteous & Hassle-Free
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            Find and Book Your Perfect Flight
          </h1>
          <p className="text-blue-100 text-base md:text-lg mb-2">
            Explore the skies with India's favorite airline experience. Best fares guaranteed!
          </p>
        </div>
      </div>

      {/* Search Form Section */}
      <div className="relative px-4 -mt-28 z-20">
        <div className="max-w-4xl mx-auto">
          <SearchForm onSearch={handleSearch} />
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className="container mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Explore Popular Destinations
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Fly to the most amazing places with our exclusive deals.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {popularDestinations.map((dest) => (
            <div key={dest.name} className="group rounded-xl overflow-hidden shadow-lg bg-white border border-gray-100">
              <div className="relative">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-72 object-cover"
                  onError={handleImageError}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-2xl font-bold">{dest.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Deals Section */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Featured Deals
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Grab these limited-time offers before they're gone!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDeals.map((deal, index) => (
              <div key={index} className="rounded-xl overflow-hidden shadow-lg bg-gray-50 border border-gray-100">
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={`Flight from ${deal.from} to ${deal.to}`}
                    className="w-full h-56 object-cover"
                    onError={handleImageError} 
                  />
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 m-3 rounded-full">DEAL</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{deal.from} &rarr; {deal.to}</h3>
                  <p className="text-2xl font-extrabold text-blue-600 mt-2">₹{deal.price.toLocaleString('en-IN')}</p>
                  <button 
                    onClick={() => navigate(`/search-flights?from=${deal.from}&to=${deal.to}&date=`)} 
                    className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore All Flights Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Discover the World
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Can't decide where to go? Browse our full list of international destinations.
          </p>
          <button
            onClick={() => navigate('/search-flights')}
            className="bg-indigo-accent text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Explore All International Flights
          </button>
        </div>
      </div>

    </div>
  );
}

export default Home;