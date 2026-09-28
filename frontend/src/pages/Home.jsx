import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Globe2,
  LogOut,
  MapPin,
  Pause,
  Plane,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const brandLogo = 'https://i.pinimg.com/736x/c9/ab/03/c9ab0381554f0402e62f6e36dc1d6475.jpg';
const homeHeroImage = 'https://png.pngtree.com/thumb_back/fh260/background/20240522/pngtree-airplane-turning-before-landing-image_15693024.jpg';

const flightSlides = [
  {
    image: homeHeroImage,
    alt: 'Airplane turning as it prepares to land',
    label: 'A NEW PERSPECTIVE',
    title: 'The world, in view.',
    description: 'Find your next destination and make the journey part of the story.',
  },
  {
    image: 'https://png.pngtree.com/thumb_back/fh260/background/20250412/pngtree-airplane-on-the-airport-runway-with-a-beautiful-sunset-in-background-image_17190471.jpg',
    alt: 'Airplane on the runway at sunset',
    label: 'GOLDEN-HOUR DEPARTURES',
    title: 'A beautiful beginning.',
    description: 'Take off toward somewhere worth remembering.',
  },
  {
    image: 'https://c4.wallpaperflare.com/wallpaper/393/536/1/the-sky-clouds-flight-lights-wallpaper-preview.jpg',
    alt: 'Airplane lights above the clouds at night',
    label: 'ABOVE THE CLOUDS',
    title: 'Let the sky open up.',
    description: 'A little more wonder in every mile of your journey.',
  },
];

const sampleTravelerReviews = [
  {
    _id: 'sample-review-1',
    rating: 5,
    text: 'The booking was refreshingly simple, and every detail was easy to find. I felt ready for the trip before I even left home.',
    user: {
      name: 'Ananya Rao',
      profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      reviewLabel: 'Bengaluru to Singapore · Sample',
    },
  },
  {
    _id: 'sample-review-2',
    rating: 5,
    text: 'Clear fares, a smooth seat selection, and no surprises at checkout. The whole journey felt thoughtfully put together.',
    user: {
      name: 'Arjun Mehta',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      reviewLabel: 'Mumbai to Dubai · Sample',
    },
  },
  {
    _id: 'sample-review-3',
    rating: 5,
    text: 'I found the flight I needed in minutes. The confirmation was clear and the experience stayed calm from start to finish.',
    user: {
      name: 'Mira Thomas',
      profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
      reviewLabel: 'Chennai to London · Sample',
    },
  },
];

const destinations = [
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    code: 'DXB',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85',
    fare: 'From INR 12,490',
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    code: 'SIN',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=85',
    fare: 'From INR 14,250',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    code: 'LHR',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85',
    fare: 'From INR 38,900',
  },
];

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [activeFlightSlide, setActiveFlightSlide] = useState(0);
  const [isFlightCarouselPaused, setIsFlightCarouselPaused] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState('one-way');
  const [airports, setAirports] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(true);
  const [airportError, setAirportError] = useState('');
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState(sampleTravelerReviews);
  const [showingSampleReviews, setShowingSampleReviews] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    if (isFlightCarouselPaused) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveFlightSlide((current) => (current + 1) % flightSlides.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [isFlightCarouselPaused]);

  useEffect(() => {
    let active = true;

    api.get('/airports')
      .then(({ data }) => {
        const airportList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.airports)
              ? data.airports
              : [];

        if (active) {
          setAirports(airportList);
          if (airportList.length === 0) {
            setAirportError('No airports are available right now.');
          }
        }
      })
      .catch(() => {
        if (active) {
          setAirportError('Airports could not be loaded. Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoadingAirports(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    api.get('/reviews')
      .then(({ data }) => {
        if (active) {
          const storedReviews = Array.isArray(data?.data) ? data.data : [];
          setReviews(storedReviews.length > 0 ? storedReviews : sampleTravelerReviews);
          setShowingSampleReviews(storedReviews.length === 0);
        }
      })
      .catch(() => {
        if (active) {
          setReviews(sampleTravelerReviews);
          setShowingSampleReviews(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const text = reviewText.trim();
    if (text.length < 8 || text.length > 600) {
      setReviewError('Write a review between 8 and 600 characters.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const { data } = await api.post('/reviews', {
        rating: reviewRating,
        text,
      });

      if (!data?.data?._id) {
        throw new Error('Your review could not be saved. Please try again.');
      }

      setReviews((currentReviews) => (
        showingSampleReviews
          ? [data.data]
          : [data.data, ...currentReviews]
      ));
      setShowingSampleReviews(false);
      setReviewText('');
      setReviewRating(5);
      setReviewSuccess('Your review has been shared.');
    } catch (submitError) {
      setReviewError(
        submitError.response?.data?.message ||
          submitError.message ||
          'Your review could not be saved. Please try again.'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!from || !to || !date) {
      setError('Choose your departure, destination and travel date to continue.');
      return;
    }

    if (from === to) {
      setError('Departure and destination must be different cities.');
      return;
    }

    if (tripType === 'round-trip' && (!returnDate || returnDate < date)) {
      setError('Choose a return date on or after your departure date.');
      return;
    }

    const searchParams = new URLSearchParams({
      from,
      to,
      date,
      tripType,
    });
    if (tripType === 'round-trip') searchParams.set('returnDate', returnDate);
    navigate(`/search-flights?${searchParams.toString()}`);
  };

  const swapAirports = () => {
    setFrom(to);
    setTo(from);
    setError('');
  };

  const selectDestination = (code) => {
    setTo(code);
    setError('');
    document.getElementById('flight-search')?.scrollIntoView({ behavior: 'smooth' });
  };

  const today = new Date();
  const minDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  return (
    <main className="voyage-home">
      <div className="voyage-topline">
        <span><Globe2 size={14} /> A world of journeys, thoughtfully connected</span>
        <span className="voyage-topline-right">English (IN) <span aria-hidden="true">·</span> INR ₹</span>
      </div>

      <header className="voyage-nav">
        <a className="voyage-brand" href="/" aria-label="Aero home">
          <img className="voyage-brand-logo" src={brandLogo} alt="Aero logo" />
          <span>AERO<span className="voyage-brand-period">.</span></span>
        </a>
        <nav className={`voyage-nav-links${isAuthenticated ? ' has-account-links' : ''}`} aria-label="Main navigation">
          <a className="is-active" href="#flight-search">Book a flight</a>
          <a href="#destinations">Explore</a>
          <a href="#travel-promise">Our promise</a>
          {isAuthenticated && (
            <>
              <NavLink to="/my-bookings">My bookings</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
        </nav>
        {isAuthenticated ? (
          <button className="voyage-login" type="button" onClick={() => { logout(); navigate('/'); }}>
            Sign out <LogOut size={15} />
          </button>
        ) : (
          <button className="voyage-login" type="button" onClick={() => navigate('/login')}>
            Sign in <ArrowUpRight size={15} />
          </button>
        )}
      </header>

      <section className="voyage-hero" aria-labelledby="voyage-title">
        <div className="voyage-hero-image" style={{ backgroundImage: `url("${homeHeroImage}")` }} aria-hidden="true" />
        <div className="voyage-hero-shade" aria-hidden="true" />
        <div className="voyage-hero-inner">
          <div className="voyage-hero-copy">
            <p className="voyage-eyebrow"><span /> A better way to get there</p>
            <h1 id="voyage-title">Go beyond<br />the <em>ordinary.</em></h1>
            <p className="voyage-hero-description">
              Thoughtful fares, smoother journeys, and a little more world in every trip.
            </p>
            <a className="voyage-explore-link" href="#flight-search">
              Find your next flight <ArrowRight size={17} />
            </a>
          </div>

        </div>
      </section>

      <section className="voyage-search-wrap" id="flight-search" aria-labelledby="search-title">
        <div className="voyage-search-heading">
          <div>
            <p className="voyage-section-kicker">YOUR JOURNEY STARTS HERE</p>
            <h2 id="search-title">Where would you like to go?</h2>
          </div>
          <div className="voyage-trip-toggle" role="group" aria-label="Trip type">
            <button type="button" className={tripType === 'one-way' ? 'is-selected' : ''} aria-pressed={tripType === 'one-way'} onClick={() => { setTripType('one-way'); setReturnDate(''); setError(''); }}>
              <Plane size={14} /> One way
            </button>
            <button type="button" className={tripType === 'round-trip' ? 'is-selected' : ''} aria-pressed={tripType === 'round-trip'} onClick={() => { setTripType('round-trip'); setError(''); }}>
              <ArrowRight size={14} /> Round trip
            </button>
          </div>
        </div>
        <form className={`voyage-search-form${tripType === 'round-trip' ? ' is-round-trip' : ''}`} onSubmit={handleSearch} noValidate>
          <div className="voyage-field voyage-location-field">
            <label htmlFor="departure-city">FROM</label>
            <div className="voyage-input-line">
              <MapPin size={17} />
              <select id="departure-city" className="voyage-airport-select" value={from} disabled={loadingAirports || airports.length === 0} onChange={(event) => { setFrom(event.target.value); setError(''); }} required>
                <option value="">{loadingAirports ? 'Loading airports...' : 'Select airport'}</option>
                {airports.map((airport) => <option key={airport._id || airport.airportCode} value={airport.airportCode}>{airport.city} ({airport.airportCode}) · {airport.airportName}</option>)}
              </select>
            </div>
            <span className="voyage-field-hint">{airports.length} airports available</span>
          </div>
          <button className="voyage-swap" type="button" onClick={swapAirports} aria-label="Swap departure and destination">
            <ArrowRight size={16} />
          </button>
          <div className="voyage-field voyage-location-field">
            <label htmlFor="arrival-city">TO</label>
            <div className="voyage-input-line">
              <MapPin size={17} />
              <select id="arrival-city" className="voyage-airport-select" value={to} disabled={loadingAirports || airports.length === 0} onChange={(event) => { setTo(event.target.value); setError(''); }} required>
                <option value="">{loadingAirports ? 'Loading airports...' : 'Select airport'}</option>
                {airports.map((airport) => <option key={airport._id || airport.airportCode} value={airport.airportCode}>{airport.city} ({airport.airportCode}) · {airport.airportName}</option>)}
              </select>
            </div>
            <span className="voyage-field-hint">Choose your destination</span>
          </div>
          <div className="voyage-field voyage-date-field">
            <label htmlFor="departure-date">DEPARTURE</label>
            <div className="voyage-input-line">
              <CalendarDays size={17} />
              <input id="departure-date" type="date" min={minDate} value={date} onChange={(event) => { setDate(event.target.value); setError(''); if (returnDate && returnDate < event.target.value) setReturnDate(''); }} required />
            </div>
            <span className="voyage-field-hint">Select a date</span>
          </div>
          {tripType === 'round-trip' && <div className="voyage-field voyage-date-field">
            <label htmlFor="return-date">RETURN</label>
            <div className="voyage-input-line">
              <CalendarDays size={17} />
              <input id="return-date" type="date" min={date || minDate} value={returnDate} onChange={(event) => { setReturnDate(event.target.value); setError(''); }} required />
            </div>
            <span className="voyage-field-hint">Select a return date</span>
          </div>}
          <button className="voyage-search-button" type="submit"><Search size={18} /> Search flights</button>
        </form>
        {airportError && <p className="voyage-search-error" role="status">{airportError}</p>}
        {error && <p className="voyage-search-error" role="alert">{error}</p>}
        <div className="voyage-search-footnote"><ShieldCheck size={14} /> No hidden fees. Just better ways to fly.</div>
      </section>

      <section className="flight-carousel-section" aria-label="Flight highlights">
        <div className="flight-carousel-frame">
          <img
            key={flightSlides[activeFlightSlide].image}
            className="flight-carousel-photo"
            src={flightSlides[activeFlightSlide].image}
            alt={flightSlides[activeFlightSlide].alt}
          />
          <div className="flight-carousel-shade" />
          <div className="flight-carousel-content">
            <header className="flight-carousel-header">
              <p className="flight-carousel-label">AERO JOURNEY COLLECTION</p>
              <span className="carousal-count">{String(activeFlightSlide + 1).padStart(2, '0')} / 03</span>
            </header>
            <div className="flight-carousel-copy" aria-live="polite">
              <span className="flight-carousel-kicker">{flightSlides[activeFlightSlide].label}</span>
              <h2>{flightSlides[activeFlightSlide].title}</h2>
              <p className="flight-carousel-description">{flightSlides[activeFlightSlide].description}</p>
              <a className="flight-carousel-cta" href="#flight-search">Find your flight <ArrowRight size={17} /></a>
            </div>
            <div className="flight-carousel-controls" aria-label="Flight image carousel controls">
              <button type="button" className="flight-carousel-arrow" aria-label="Previous image" onClick={() => setActiveFlightSlide((current) => (current + flightSlides.length - 1) % flightSlides.length)}>
                <ChevronLeft size={19} />
              </button>
              <div className="flight-carousel-pagination" role="group" aria-label="Choose flight image">
                {flightSlides.map((slide, index) => (
                  <button
                    key={slide.image}
                    type="button"
                    className={`flight-carousel-dot${activeFlightSlide === index ? ' is-active' : ''}`}
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={activeFlightSlide === index}
                    onClick={() => setActiveFlightSlide(index)}
                  />
                ))}
              </div>
              <button type="button" className="flight-carousel-arrow" aria-label="Next image" onClick={() => setActiveFlightSlide((current) => (current + 1) % flightSlides.length)}>
                <ChevronRight size={19} />
              </button>
              <button type="button" className="flight-carousel-arrow" aria-label={isFlightCarouselPaused ? 'Play carousel' : 'Pause carousel'} onClick={() => setIsFlightCarouselPaused((paused) => !paused)}>
                {isFlightCarouselPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="voyage-promise" id="travel-promise" aria-label="Why book with Aero">
        <div><span className="voyage-promise-icon"><Globe2 size={17} /></span><span><strong>More of the world</strong><small>200+ destinations to discover</small></span></div>
        <i />
        <div><span className="voyage-promise-icon"><ShieldCheck size={17} /></span><span><strong>Peace of mind</strong><small>Clear fares, secure booking</small></span></div>
        <i />
        <div><span className="voyage-promise-icon"><Sparkles size={17} /></span><span><strong>Little details, considered</strong><small>Travel that feels effortless</small></span></div>
      </section>

      <section className="voyage-reviews" aria-labelledby="voyage-reviews-title">
        <div className="voyage-reviews-heading">
          <div>
            <p className="voyage-section-kicker">
              {showingSampleReviews ? 'TRAVELER STORIES · SAMPLE' : 'CUSTOMER REVIEWS'}
            </p>
            <h2 id="voyage-reviews-title">A better journey, <em>in their words.</em></h2>
          </div>
          <span>Thoughtful details make all the difference.</span>
        </div>
        {reviews.length > 0 ? (
          <div className="voyage-review-grid">
            {reviews.map((review) => {
              const authorName = review.user?.name || 'Aero customer';
              const avatar = review.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=244b7a&color=fff&size=96`;

              return (
                <article className="voyage-review" key={review._id}>
                  <div className="voyage-review-rating" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={14} fill="currentColor" className={index < review.rating ? '' : 'is-unfilled'} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>“{review.text}”</blockquote>
                  <div className="voyage-review-author">
                    <img src={avatar} alt={`${authorName} profile`} loading="lazy" />
                    <div>
                      <strong>{authorName}</strong>
                      <span>{review.user?.reviewLabel || 'Aero customer'}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="voyage-reviews-message" role="status">
            {reviewError || 'No reviews yet. Be the first to share your experience.'}
          </p>
        )}

        <div className="voyage-review-compose">
          <div>
            <p className="voyage-review-compose-kicker">YOUR EXPERIENCE</p>
            <h3>Write a review</h3>
            <p>Your saved profile photo will appear beside your review.</p>
          </div>
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit}>
              <div className="voyage-review-compose-rating" role="radiogroup" aria-label="Your rating">
                {Array.from({ length: 5 }, (_, index) => {
                  const rating = index + 1;
                  return (
                    <button
                      key={rating}
                      type="button"
                      role="radio"
                      aria-checked={reviewRating === rating}
                      aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                      onClick={() => setReviewRating(rating)}
                    >
                      <Star size={21} fill="currentColor" className={rating <= reviewRating ? '' : 'is-unfilled'} />
                    </button>
                  );
                })}
              </div>
              <label className="sr-only" htmlFor="customer-review">Your review</label>
              <textarea
                id="customer-review"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="How was your booking experience?"
                minLength={8}
                maxLength={600}
                rows={3}
                required
              />
              <div className="voyage-review-compose-footer">
                <span>{reviewText.length}/600</span>
                <button type="submit" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Sharing...' : 'Share review'}
                </button>
              </div>
              {reviewError && <p className="voyage-review-feedback is-error" role="alert">{reviewError}</p>}
              {reviewSuccess && <p className="voyage-review-feedback" role="status">{reviewSuccess}</p>}
            </form>
          ) : (
            <NavLink className="voyage-review-signin" to="/login">Sign in to write a review <ArrowRight size={16} /></NavLink>
          )}
        </div>
      </section>

      <section className="voyage-destinations" id="destinations" aria-labelledby="destinations-title">
        <div className="voyage-destinations-heading">
          <div>
            <p className="voyage-section-kicker">A CHANGE OF SCENERY</p>
            <h2 id="destinations-title">The world, <em>within reach.</em></h2>
          </div>
          <span className="voyage-destinations-note">A few places worth taking the long way for.</span>
        </div>
        <div className="voyage-destination-grid">
          {destinations.map((destination, index) => (
            <article className={`voyage-destination voyage-destination-${index + 1}`} key={destination.code}>
              <img src={destination.image} alt={`${destination.city}, ${destination.country}`} loading="lazy" />
              <div className="voyage-destination-overlay" />
              <div className="voyage-destination-content">
                <span className="voyage-destination-code">{destination.code}</span>
                <div className="voyage-destination-bottom">
                  <div><h3>{destination.city}</h3><p>{destination.country}</p><span>{destination.fare}</span></div>
                  <button type="button" onClick={() => selectDestination(destination.code)} aria-label={`Search flights to ${destination.city}`}><ArrowUpRight size={19} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}

export default Home;