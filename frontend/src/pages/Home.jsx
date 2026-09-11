import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import gsap from 'gsap';

function Home() {
  const navigate = useNavigate();
  const planeRef = useRef(null);
  const heroContentRef = useRef(null);

  // User state check (لogin status)
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // localStorage அல்லது உங்கள் Auth state-ல் இருந்து யூசர் டேட்டாவை எடுக்கிறது
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser({ name: 'User' });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (searchParams) => {
    if (!planeRef.current || !heroContentRef.current) {
      navigate(`/search-flights?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
      return;
    }

    const tl = gsap.timeline();

    tl.to(heroContentRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in"
    })
    .to(planeRef.current, {
      x: window.innerWidth + 600,
      y: -500,
      rotation: 20,
      duration: 1.2,
      ease: "power3.inOut"
    }, "-=0.3")
    .to("body", {
      scale: 1.05,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        navigate(`/search-flights?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
      }
    });
  };

  return (
    <div className="bg-slate-950 text-white w-screen h-screen relative overflow-hidden m-0 p-0 box-border flex flex-col justify-between">
      
      {/* Top Full-Width Navigation Bar */}
      <div className="absolute top-0 left-0 w-full z-30 px-6 py-4 flex justify-between items-center bg-slate-950/40 backdrop-blur-md border-b border-white/10">
        <div className="text-xl font-bold tracking-wider text-blue-400 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          ✈️ AeroCinematic
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => navigate('/search-flights')} 
            className="hover:text-blue-400 text-slate-200 text-sm font-semibold transition cursor-pointer"
          >
            ✈️ Flights
          </button>
          <button 
            onClick={() => navigate('/search-flights')} 
            className="hover:text-blue-400 text-slate-200 text-sm font-semibold transition cursor-pointer"
          >
            🏷️ Offers
          </button>

          {/* User Logged In Check */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-bold px-5 py-2 rounded-full transition border border-white/10 cursor-pointer flex items-center gap-2"
              >
                👤 Profile ▾
              </button>

              {/* Profile Dropdown Menu containing My Bookings & Logout */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate('/my-bookings'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-600/30 hover:text-blue-300 transition"
                  >
                    🎫 My Bookings
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-600/30 hover:text-blue-300 transition border-b border-white/10"
                  >
                    ⚙️ Account Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300 transition font-semibold"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-bold px-5 py-2 rounded-full transition border border-white/10 cursor-pointer"
              >
                👤 Login
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold px-5 py-2 rounded-full transition shadow-lg shadow-blue-600/40 cursor-pointer"
              >
                📝 Register
              </button>
            </>
          )}
        </div>
      </div>

      {/* Full Screen Cinematic Hero Section */}
      <div 
        ref={heroContentRef}
        className="relative w-full h-full bg-cover bg-center flex flex-col items-center justify-end pb-12 text-center px-4"
        style={{ backgroundImage: "url('https://www.traveltrendstoday.in/storage/posts/c8c03a14b880e1993c74db74663b0cf1.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-slate-950/70"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
          
          <span className="bg-blue-600/40 border border-blue-400/50 text-blue-200 text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 inline-block shadow-lg backdrop-blur-md">
            ✨ Cinematic 3D Flight & Glassmorphism
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight drop-shadow-2xl">
            Find and Book Your <span className="bg-linear-to-r from-blue-400 via-amber-200 to-indigo-300 bg-clip-text text-transparent">Perfect Flight</span>
          </h1>
          <p className="text-slate-200 text-sm md:text-base mb-6 drop-shadow max-w-xl">
            Explore the skies with immersive 3D motion graphics and smooth cinematic transitions.
          </p>

          {/* Search Form Box */}
          <div className="w-full max-w-4xl bg-slate-900/85 backdrop-blur-3xl p-6 md:p-8 rounded-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-amber-200/20 text-white">
            <SearchForm onSearch={handleSearch} />
          </div>

        </div>
      </div>

      {/* Flying Airplane Graphic Element with Pikbest 3D Image for GSAP Animation */}
      <div ref={planeRef} className="fixed bottom-20 -left-62.5 z-50 pointer-events-none">
        <img 
          src="https://img.pikbest.com/png-images/3d-flying-airplane-isolated-on-white-background_10648593.png!w700wp" 
          alt="3D Flying Airplane" 
          className="w-44 h-44 object-contain transform rotate-45 drop-shadow-[0_20px_40px_rgba(251,191,36,0.8)]"
        />
      </div>

    </div>
  );
}

export default Home;