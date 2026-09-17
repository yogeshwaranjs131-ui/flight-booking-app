import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import SearchForm from "../components/SearchForm";
import flightService from "../services/flightService";

function Home() {
  const navigate = useNavigate();

  // ============================================================
  // REFS
  // ============================================================

  const planeRef = useRef(null);
  const heroContentRef = useRef(null);

  // ============================================================
  // STATES
  // ============================================================

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ============================================================
  // LOAD USER
  // ============================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("User data parse error:", error);

      setUser({
        name: "User",
      });
    }
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setDropdownOpen(false);

    navigate("/");
  };

  // ============================================================
  // SEARCH FLIGHTS
  //
  // ONE WAY:
  //
  // From → To
  // Departure Date
  //
  // ROUND TRIP:
  //
  // From → To
  // Departure Date
  // Return Date
  //
  // ============================================================

  const handleSearch = async (searchParams) => {
    const {
      from,
      to,
      date,
      returnDate,
      tripType,
    } = searchParams || {};

    // ==========================================================
    // BASIC VALIDATION
    // ==========================================================

    if (!from || !to || !date) {
      alert(
        "Please select departure airport, arrival airport and travel date."
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

    const isRoundTrip =
      tripType === "round-trip";

    if (isRoundTrip && !returnDate) {
      alert(
        "Please select your return date for a round trip."
      );
      return;
    }

    if (
      isRoundTrip &&
      returnDate &&
      new Date(returnDate) < new Date(date)
    ) {
      alert(
        "Return date cannot be earlier than the departure date."
      );
      return;
    }

    try {
      setIsSearching(true);

      console.log("=================================");
      console.log("FLIGHT SEARCH");
      console.log("Trip Type:", tripType);
      console.log("From:", from);
      console.log("To:", to);
      console.log("Departure Date:", date);
      console.log("Return Date:", returnDate || "N/A");
      console.log("=================================");

      // ========================================================
      // SEARCH DEPARTURE FLIGHT
      // ========================================================

      const departureResult =
        await flightService.searchFlights({
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          date,
        });

      console.log(
        "Departure Search Response:",
        departureResult
      );

      // ========================================================
      // NORMALIZE DEPARTURE RESPONSE
      // ========================================================

      let departureFlights = [];

      if (Array.isArray(departureResult)) {
        departureFlights = departureResult;
      } else if (
        Array.isArray(departureResult?.data)
      ) {
        departureFlights =
          departureResult.data;
      } else if (
        Array.isArray(departureResult?.flights)
      ) {
        departureFlights =
          departureResult.flights;
      } else if (
        Array.isArray(
          departureResult?.data?.data
        )
      ) {
        departureFlights =
          departureResult.data.data;
      }

      // ========================================================
      // NO DEPARTURE FLIGHTS
      // ========================================================

      if (departureFlights.length === 0) {
        alert(
          `No flights found from ${from.toUpperCase()} to ${to.toUpperCase()} on ${date}.`
        );

        return;
      }

      // ========================================================
      // SELECT FIRST DEPARTURE FLIGHT
      //
      // Later we can show ALL flights.
      // ========================================================

      const departureFlight =
        departureFlights[0];

      const departureFlightId =
        departureFlight?._id ||
        departureFlight?.id ||
        departureFlight?.flightId;

      if (!departureFlightId) {
        console.error(
          "Departure flight ID missing:",
          departureFlight
        );

        alert(
          "Departure flight information is incomplete."
        );

        return;
      }

      // ========================================================
      // ONE WAY
      // ========================================================

      if (!isRoundTrip) {
        console.log(
          "One Way Flight Selected:",
          departureFlight
        );

        navigate(
          `/flight-details/${departureFlightId}`,
          {
            state: {
              flight: departureFlight,
              tripType: "one-way",
              returnDate: null,
            },
          }
        );

        return;
      }

      // ========================================================
      // ROUND TRIP
      //
      // Search reverse route:
      //
      // IDR → AMD
      //
      // using return date.
      // ========================================================

      console.log("Searching RETURN flight...");

      const returnResult =
        await flightService.searchFlights({
          from: to.toUpperCase(),
          to: from.toUpperCase(),
          date: returnDate,
        });

      console.log(
        "Return Search Response:",
        returnResult
      );

      // ========================================================
      // NORMALIZE RETURN RESPONSE
      // ========================================================

      let returnFlights = [];

      if (Array.isArray(returnResult)) {
        returnFlights = returnResult;
      } else if (
        Array.isArray(returnResult?.data)
      ) {
        returnFlights =
          returnResult.data;
      } else if (
        Array.isArray(returnResult?.flights)
      ) {
        returnFlights =
          returnResult.flights;
      } else if (
        Array.isArray(
          returnResult?.data?.data
        )
      ) {
        returnFlights =
          returnResult.data.data;
      }

      // ========================================================
      // NO RETURN FLIGHTS
      // ========================================================

      if (returnFlights.length === 0) {
        alert(
          `No return flights found from ${to.toUpperCase()} to ${from.toUpperCase()} on ${returnDate}.`
        );

        return;
      }

      // ========================================================
      // SELECT FIRST RETURN FLIGHT
      // ========================================================

      const returnFlight =
        returnFlights[0];

      const returnFlightId =
        returnFlight?._id ||
        returnFlight?.id ||
        returnFlight?.flightId;

      if (!returnFlightId) {
        console.error(
          "Return flight ID missing:",
          returnFlight
        );

        alert(
          "Return flight information is incomplete."
        );

        return;
      }

      // ========================================================
      // ROUND TRIP DATA
      // ========================================================

      console.log(
        "Departure Flight:",
        departureFlight
      );

      console.log(
        "Return Flight:",
        returnFlight
      );

      console.log(
        "Departure Flight ID:",
        departureFlightId
      );

      console.log(
        "Return Flight ID:",
        returnFlightId
      );

      // ========================================================
      // NAVIGATE
      //
      // We pass BOTH flights.
      // ========================================================

      navigate(
        `/flight-details/${departureFlightId}`,
        {
          state: {
            flight: departureFlight,

            returnFlight: returnFlight,

            tripType: "round-trip",

            departureDate: date,

            returnDate: returnDate,

            departureFlightId,

            returnFlightId,
          },
        }
      );
    } catch (error) {
      console.error(
        "Flight Search Error:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to search flights. Please try again.";

      alert(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // ============================================================
  // CLOSE PROFILE DROPDOWN
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileMenu =
        event.target.closest(
          "[data-profile-menu]"
        );

      if (!profileMenu) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // 3D AIRPLANE ANIMATION
  // ============================================================

  useEffect(() => {
    if (!planeRef.current) {
      return;
    }

    const animation = gsap.to(
      planeRef.current,
      {
        y: -20,
        rotation: 3,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      }
    );

    return () => {
      animation.kill();
    };
  }, []);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="
        relative
        flex
        h-screen
        min-h-screen
        w-screen
        flex-col
        overflow-hidden
        bg-slate-950
        text-white
      "
    >
      {/* ======================================================
          SEARCHING OVERLAY
      ======================================================= */}

      {isSearching && (
        <div
          className="
            fixed
            inset-0
            z-100
            flex
            items-center
            justify-center
            bg-slate-950/90
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              w-[90%]
              max-w-md
              flex-col
              items-center
              rounded-3xl
              border
              border-white/10
              bg-slate-900/90
              px-8
              py-10
              text-center
              shadow-2xl
            "
          >
            <div
              className="
                mb-5
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-blue-600/20
                ring-1
                ring-blue-400/30
              "
            >
              <span className="animate-bounce text-5xl">
                ✈️
              </span>
            </div>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-white
              "
            >
              Searching Flights
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-300
              "
            >
              Finding the best available flights
              for your journey...
            </p>

            <div
              className="
                mt-6
                flex
                items-center
                gap-2
              "
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />

              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:200ms]" />

              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:400ms]" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <nav
        className="
          absolute
          left-0
          top-0
          z-40
          flex
          w-full
          items-center
          justify-between
          border-b
          border-white/10
          bg-slate-950/40
          px-4
          py-4
          backdrop-blur-md
          sm:px-6
          lg:px-10
        "
      >
        {/* LOGO */}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            flex
            cursor-pointer
            items-center
            gap-2
            text-lg
            font-bold
            tracking-wider
            text-blue-400
            transition
            hover:text-blue-300
            sm:text-xl
          "
        >
          <span className="text-xl">
            ✈️
          </span>

          <span>
            AeroCinematic
          </span>
        </button>

        {/* NAVIGATION */}

        <div
          className="
            flex
            items-center
            gap-1
            sm:gap-3
            md:gap-5
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate("/search-flights")
            }
            className="
              hidden
              rounded-xl
              px-3
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-white/10
              md:block
            "
          >
            ✈️ Flights
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/search-flights")
            }
            className="
              hidden
              rounded-xl
              px-3
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-white/10
              md:block
            "
          >
            🏷️ Offers
          </button>

          {/* USER */}

          {user ? (
            <div
              className="relative"
              data-profile-menu
            >
              <button
                type="button"
                onClick={() =>
                  setDropdownOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  backdrop-blur-md
                  transition
                  hover:bg-white/20
                "
              >
                👤{" "}
                {user.name || "Profile"}{" "}
                ▾
              </button>

              {dropdownOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-56
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-slate-950/95
                    shadow-2xl
                    backdrop-blur-xl
                  "
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/my-bookings");
                    }}
                    className="
                      w-full
                      px-4
                      py-3
                      text-left
                      text-sm
                      text-white
                      transition
                      hover:bg-white/10
                    "
                  >
                    🎫 My Bookings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="
                      w-full
                      px-4
                      py-3
                      text-left
                      text-sm
                      text-white
                      transition
                      hover:bg-white/10
                    "
                  >
                    ⚙️ Account Settings
                  </button>

                  <div className="border-t border-white/10" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full
                      px-4
                      py-3
                      text-left
                      text-sm
                      text-red-300
                      transition
                      hover:bg-red-500/10
                    "
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                👤 Login
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
                className="
                  hidden
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                  transition
                  hover:bg-blue-500
                  sm:block
                "
              >
                📝 Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ======================================================
          HERO
      ======================================================= */}

      <main
        ref={heroContentRef}
        className="
          relative
          flex
          h-full
          w-full
          flex-col
          items-center
          justify-end
          bg-cover
          bg-center
          px-4
          pb-10
          text-center
          sm:pb-12
          md:pb-14
        "
        style={{
          backgroundImage:
            "url('https://www.traveltrendstoday.in/storage/posts/c8c03a14b880e1993c74db74663b0cf1.jpg')",
        }}
      >
        {/* BACKGROUND */}

        <div
          className="
            absolute
            inset-0
            bg-linear-to-t
            from-slate-950
            via-slate-950/60
            to-slate-950/70
          "
        />

        {/* HERO CONTENT */}

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            w-full
            max-w-5xl
            flex-col
            items-center
          "
        >
          {/* BADGE */}

          <span
            className="
              mb-3
              inline-flex
              items-center
              rounded-full
              border
              border-blue-400/40
              bg-blue-600/30
              px-4
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-blue-200
              shadow-lg
              backdrop-blur-md
              sm:text-xs
              md:text-sm
            "
          >
            ✨ Cinematic 3D Flight Experience
          </span>

          {/* TITLE */}

          <h1
            className="
              mb-3
              max-w-4xl
              text-3xl
              font-extrabold
              leading-tight
              tracking-tight
              text-white
              drop-shadow-2xl
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            "
          >
            Find and Book Your{" "}
            <span
              className="
                bg-linear-to-r
                from-blue-400
                via-amber-200
                to-indigo-300
                bg-clip-text
                text-transparent
              "
            >
              Perfect Flight
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mb-5
              max-w-2xl
              text-xs
              leading-6
              text-slate-200
              drop-shadow
              sm:text-sm
              md:mb-7
              md:text-base
            "
          >
            Discover flights, explore destinations,
            and experience seamless booking with
            our modern cinematic travel platform.
          </p>

          {/* SEARCH FORM */}

          <div
            className="
              w-full
              max-w-4xl
              rounded-3xl
              border
              border-white/20
              bg-slate-900/85
              p-4
              text-white
              shadow-[0_25px_60px_rgba(0,0,0,0.9)]
              ring-1
              ring-blue-400/10
              backdrop-blur-3xl
              sm:p-6
              md:p-8
            "
          >
            <SearchForm
              onSearch={handleSearch}
            />
          </div>
        </div>
      </main>

      {/* ======================================================
          FLOATING AIRPLANE
      ======================================================= */}

      <div
        ref={planeRef}
        className="
          pointer-events-none
          fixed
          bottom-16
          -left-20
          z-30
          sm:bottom-20
          sm:-left-24
        "
      >
        <img
          src="https://img.pikbest.com/png-images/3d-flying-airplane-isolated-on-white-background_10648593.png!w700wp"
          alt="3D Flying Airplane"
          className="
            h-32
            w-32
            object-contain
            -rotate-12
            drop-shadow-[0_20px_40px_rgba(251,191,36,0.8)]
            sm:h-40
            sm:w-40
            md:h-44
            md:w-44
          "
        />
      </div>
    </div>
  );
}

export default Home;