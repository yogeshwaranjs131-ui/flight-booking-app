import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';

const royalFlightCarouselImages = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN-23gqCcqF2ERNoNYOos9Cx4OFzmgc1Z-x_MyIuLlWQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG_59wSibE7wAR7ILcuDvfHKWBfpakXRQyhbA1AyMk0AesPCKlGdW766AC&s=10',
  'https://cdn.pixabay.com/photo/2026/07/17/10/58/10-58-34-253_640.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQCSQ-CXPEUYF-2O7ipKtAGP9lYs89cPiW9dFMWYYHaTs8dhvGk8BdVSM&s=10'
];

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
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((index) => (index + 1) % royalFlightCarouselImages.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (searchParams) => {
    navigate(`/search-flights?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%236b7280'>Image Not Found</text></svg>";
  };

  return (
    <div className="home-royal-page">
      <section className="home-royal-hero">
        <div className="home-hero-background" style={{ backgroundImage: `url('${royalFlightCarouselImages[carouselIndex]}')` }} />
        <div className="home-hero-scrim" />
        <div className="home-hero-content">
          <span className="home-hero-tag">IndiGo Select • Royal Air Journey</span>
          <h1>Find your next graceful escape</h1>
          <p>Explore India with a curated airline experience built for comfort, speed and timeless journeys.</p>
          <div className="home-hero-actions">
            <button onClick={() => navigate('/search-flights')} className="home-hero-primary">Plan Your Flight</button>
            <button onClick={() => navigate('/search-flights')} className="home-hero-secondary">View Destinations</button>
          </div>
          <div className="home-hero-stats">
            <div>
              <span className="stat-value">350+</span>
              <span className="stat-label">Destinations</span>
            </div>
            <div>
              <span className="stat-value">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div>
              <span className="stat-value">₹499</span>
              <span className="stat-label">Smart Fare</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-search-wrap">
        <SearchForm onSearch={handleSearch} />
      </section>

      <section className="popular-destination-section">
        <div className="section-heading-wrap center-heading">
          <span className="section-kicker">Curated Experiences</span>
          <h2>Explore Popular Destinations</h2>
          <p>Fly to the most connected places and let every arrival feel like a royal welcome.</p>
        </div>
        <div className="destination-grid">
          {popularDestinations.map((dest) => (
            <div key={dest.name} className="destination-card">
              <img src={dest.image} alt={dest.name} className="destination-image" onError={handleImageError} />
              <div className="destination-overlay">
                <span className="destination-name">{dest.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-deals-section">
        <div className="section-heading-wrap center-heading">
          <span className="section-kicker">Special Fare Window</span>
          <h2>Featured Deals</h2>
          <p>Grab these limited-time offers before they disappear from the sky.</p>
        </div>
        <div className="featured-deals-grid">
          {featuredDeals.map((deal, index) => (
            <article key={index} className="deal-card">
              <div className="deal-image-wrap">
                <img src={deal.image} alt={`${deal.from} to ${deal.to}`} onError={handleImageError} />
                <span className="deal-badge">Deal</span>
              </div>
              <div className="deal-content">
                <h3>{deal.from} <span>→</span> {deal.to}</h3>
                <p className="deal-fare">₹{deal.price.toLocaleString('en-IN')}</p>
                <button className="deal-button" onClick={() => navigate(`/search-flights?from=${deal.from}&to=${deal.to}&date=`)}>
                  Book Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="explore-section">
        <div className="explore-inner">
          <h2>Discover the world beyond the ordinary.</h2>
          <p>Browse domestic and international routes crafted for a smoother takeoff.</p>
          <button onClick={() => navigate('/search-flights')} className="explore-button">Explore All International Flights</button>
        </div>
      </section>
    </div>
  );
}

export default Home;