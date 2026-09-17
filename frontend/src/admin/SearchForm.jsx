import { useEffect, useState } from "react";

function SearchForm({ onSearch }) {
  // ============================================================
  // STATES
  // ============================================================

  const [tripType, setTripType] = useState("round-trip");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // ============================================================
  // TODAY
  // ============================================================

  const today = new Date().toISOString().split("T")[0];

  // ============================================================
  // WHEN SWITCHING TO ONE WAY
  // ============================================================

  useEffect(() => {
    if (tripType === "one-way") {
      setReturnDate("");
    }
  }, [tripType]);

  // ============================================================
  // SWAP AIRPORTS
  // ============================================================

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  // ============================================================
  // RETURN DATE VALIDATION
  // ============================================================

  const handleReturnDateChange = (value) => {
    if (date && value < date) {
      alert(
        "Return date cannot be earlier than departure date."
      );
      return;
    }

    setReturnDate(value);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!from || !to || !date) {
      alert(
        "Please select From, To and Departure Date."
      );
      return;
    }

    // ----------------------------------------------------------
    // SAME AIRPORT
    // ----------------------------------------------------------

    if (
      from.trim().toUpperCase() ===
      to.trim().toUpperCase()
    ) {
      alert(
        "Departure and arrival airports cannot be the same."
      );
      return;
    }

    // ----------------------------------------------------------
    // ROUND TRIP VALIDATION
    // ----------------------------------------------------------

    if (tripType === "round-trip" && !returnDate) {
      alert(
        "Please select a return date for your round trip."
      );
      return;
    }

    // ----------------------------------------------------------
    // RETURN DATE CHECK
    // ----------------------------------------------------------

    if (
      tripType === "round-trip" &&
      returnDate < date
    ) {
      alert(
        "Return date cannot be earlier than departure date."
      );
      return;
    }

    // ----------------------------------------------------------
    // SEARCH DATA
    // ----------------------------------------------------------

    const searchData = {
      tripType,

      from: from.trim().toUpperCase(),

      to: to.trim().toUpperCase(),

      date,

      returnDate:
        tripType === "round-trip"
          ? returnDate
          : null,
    };

    console.log(
      "================================="
    );

    console.log(
      "SEARCH FORM DATA:",
      searchData
    );

    console.log(
      "================================="
    );

    onSearch(searchData);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        rounded-3xl
        border
        border-white/20
        bg-white/10
        p-4
        shadow-2xl
        backdrop-blur-2xl
        sm:p-5
        md:p-6
      "
    >
      {/* ======================================================
          TRIP TYPE
      ======================================================= */}

      <div className="mb-5 flex justify-center">
        <div
          className="
            inline-flex
            rounded-full
            border
            border-white/20
            bg-black/20
            p-1
            shadow-lg
            backdrop-blur-xl
          "
        >
          {/* ONE WAY */}

          <button
            type="button"
            onClick={() =>
              setTripType("one-way")
            }
            className={`
              rounded-full
              px-5
              py-2.5
              text-sm
              font-semibold
              transition-all
              duration-300
              ${
                tripType === "one-way"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            One Way
          </button>

          {/* ROUND TRIP */}

          <button
            type="button"
            onClick={() =>
              setTripType("round-trip")
            }
            className={`
              rounded-full
              px-5
              py-2.5
              text-sm
              font-semibold
              transition-all
              duration-300
              ${
                tripType === "round-trip"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            Round Trip
          </button>
        </div>
      </div>

      {/* ======================================================
          SEARCH FIELDS
      ======================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          lg:grid-cols-12
          lg:items-end
        "
      >
        {/* ==================================================
            FROM
        =================================================== */}

        <div className="lg:col-span-3">
          <label
            htmlFor="from"
            className="
              mb-2
              block
              text-left
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-300
            "
          >
            From
          </label>

          <div
            className="
              relative
              flex
              items-center
              rounded-2xl
              border
              border-white/20
              bg-white/10
              transition
              focus-within:border-blue-400/60
              focus-within:bg-white/15
              focus-within:ring-2
              focus-within:ring-blue-400/20
            "
          >
            <span className="pl-4 text-xl">
              🛫
            </span>

            <input
              type="text"
              id="from"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
              placeholder="AMD"
              maxLength={3}
              autoComplete="off"
              className="
                w-full
                bg-transparent
                px-3
                py-3.5
                text-sm
                font-semibold
                uppercase
                text-white
                outline-none
                placeholder:text-slate-400
              "
            />
          </div>
        </div>

        {/* ==================================================
            SWAP
        =================================================== */}

        <div
          className="
            flex
            items-center
            justify-center
            lg:col-span-1
          "
        >
          <button
            type="button"
            onClick={handleSwap}
            title="Swap airports"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-white/10
              text-lg
              text-white
              shadow-lg
              backdrop-blur-md
              transition-all
              duration-300
              hover:rotate-180
              hover:bg-blue-600/30
              hover:border-blue-400/50
            "
          >
            ⇄
          </button>
        </div>

        {/* ==================================================
            TO
        =================================================== */}

        <div className="lg:col-span-3">
          <label
            htmlFor="to"
            className="
              mb-2
              block
              text-left
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-300
            "
          >
            To
          </label>

          <div
            className="
              relative
              flex
              items-center
              rounded-2xl
              border
              border-white/20
              bg-white/10
              transition
              focus-within:border-blue-400/60
              focus-within:bg-white/15
              focus-within:ring-2
              focus-within:ring-blue-400/20
            "
          >
            <span className="pl-4 text-xl">
              🛬
            </span>

            <input
              type="text"
              id="to"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
              placeholder="IDR"
              maxLength={3}
              autoComplete="off"
              className="
                w-full
                bg-transparent
                px-3
                py-3.5
                text-sm
                font-semibold
                uppercase
                text-white
                outline-none
                placeholder:text-slate-400
              "
            />
          </div>
        </div>

        {/* ==================================================
            DEPARTURE DATE
        =================================================== */}

        <div className="lg:col-span-2">
          <label
            htmlFor="date"
            className="
              mb-2
              block
              text-left
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-300
            "
          >
            Departure
          </label>

          <div
            className="
              flex
              items-center
              rounded-2xl
              border
              border-white/20
              bg-white/10
              transition
              focus-within:border-blue-400/60
              focus-within:bg-white/15
              focus-within:ring-2
              focus-within:ring-blue-400/20
            "
          >
            <span className="pl-4 text-lg">
              📅
            </span>

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
                bg-transparent
                px-3
                py-3.5
                text-sm
                font-semibold
                text-white
                outline-none
              "
            />
          </div>
        </div>

        {/* ==================================================
            RETURN DATE
        =================================================== */}

        {tripType === "round-trip" && (
          <div className="lg:col-span-2">
            <label
              htmlFor="returnDate"
              className="
                mb-2
                block
                text-left
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-slate-300
              "
            >
              Return
            </label>

            <div
              className="
                flex
                items-center
                rounded-2xl
                border
                border-blue-400/30
                bg-blue-500/10
                transition
                focus-within:border-blue-400/60
                focus-within:bg-blue-500/15
                focus-within:ring-2
                focus-within:ring-blue-400/20
              "
            >
              <span className="pl-4 text-lg">
                🔄
              </span>

              <input
                type="date"
                id="returnDate"
                value={returnDate}
                min={date || today}
                onChange={(e) =>
                  handleReturnDateChange(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  px-3
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  outline-none
                "
              />
            </div>
          </div>
        )}

        {/* ==================================================
            SEARCH BUTTON
        =================================================== */}

        <div
          className={`
            ${
              tripType === "round-trip"
                ? "lg:col-span-1"
                : "lg:col-span-3"
            }
          `}
        >
          <button
            type="submit"
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              px-5
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-xl
              shadow-blue-600/30
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-blue-500
              hover:shadow-blue-500/40
              active:translate-y-0
            "
          >
            <span className="text-lg">
              🔍
            </span>

            <span>
              Search
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================
          TRIP INFO
      ======================================================= */}

      <div
        className="
          mt-5
          flex
          flex-wrap
          items-center
          justify-center
          gap-x-5
          gap-y-2
          border-t
          border-white/10
          pt-4
          text-[11px]
          text-slate-400
          sm:text-xs
        "
      >
        <span className="flex items-center gap-1.5">
          ✓ Secure booking
        </span>

        <span className="flex items-center gap-1.5">
          ✓ Real-time flight availability
        </span>

        <span className="flex items-center gap-1.5">
          ✓ Instant confirmation
        </span>
      </div>
    </form>
  );
}

export default SearchForm;