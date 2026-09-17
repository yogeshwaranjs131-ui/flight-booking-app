import Flight from "../models/Flight.js";
import Airport from "../models/Airport.js";
import Booking from "../models/Booking.js";

// ============================================================
// SEARCH FLIGHTS
// ============================================================

export const searchFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    console.log(
      `[SEARCH] from=${from} to=${to} date=${date}`
    );

    // ----------------------------------------------------------
    // Validate query
    // ----------------------------------------------------------

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message:
          "Departure airport, arrival airport and travel date are required.",
        data: [],
      });
    }

    const fromCode = String(from).trim().toUpperCase();
    const toCode = String(to).trim().toUpperCase();

    // ----------------------------------------------------------
    // Find departure airport
    // ----------------------------------------------------------

    const departureAirport = await Airport.findOne({
      airportCode: fromCode,
    });

    if (!departureAirport) {
      console.log(
        `[SEARCH] Departure airport not found: ${fromCode}`
      );

      return res.status(200).json({
        success: true,
        count: 0,
        message: `Departure airport ${fromCode} not found.`,
        data: [],
      });
    }

    // ----------------------------------------------------------
    // Find arrival airport
    // ----------------------------------------------------------

    const arrivalAirport = await Airport.findOne({
      airportCode: toCode,
    });

    if (!arrivalAirport) {
      console.log(
        `[SEARCH] Arrival airport not found: ${toCode}`
      );

      return res.status(200).json({
        success: true,
        count: 0,
        message: `Arrival airport ${toCode} not found.`,
        data: [],
      });
    }

    // ----------------------------------------------------------
    // Validate date
    // ----------------------------------------------------------

    const requestedDate = String(date).trim();

    const startDate = new Date(
      `${requestedDate}T00:00:00.000Z`
    );

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid travel date.",
        data: [],
      });
    }

    const endDate = new Date(startDate);

    endDate.setUTCDate(
      endDate.getUTCDate() + 1
    );

    // ----------------------------------------------------------
    // IMPORTANT
    //
    // Your Flight model stores departureTime as STRING.
    //
    // Therefore we first search by airports.
    // Then filter the stored date safely in JavaScript.
    // ----------------------------------------------------------

    const flights = await Flight.find({
      departureAirport: departureAirport._id,
      arrivalAirport: arrivalAirport._id,
    })
      .populate("departureAirport")
      .populate("arrivalAirport")
      .sort({ departureTime: 1 });

    // ----------------------------------------------------------
    // Filter flights by requested date
    // ----------------------------------------------------------

    const matchingFlights = flights.filter(
      (flight) => {
        if (!flight.departureTime) {
          return false;
        }

        const flightDate =
          new Date(flight.departureTime);

        if (Number.isNaN(flightDate.getTime())) {
          return false;
        }

        return (
          flightDate >= startDate &&
          flightDate < endDate
        );
      }
    );

    console.log(
      `[SEARCH] ${fromCode} -> ${toCode} | Found: ${matchingFlights.length}`
    );

    // ----------------------------------------------------------
    // No flights
    // ----------------------------------------------------------

    if (matchingFlights.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No flights available from ${fromCode} to ${toCode} on ${requestedDate}.`,
        data: [],
      });
    }

    // ----------------------------------------------------------
    // Success
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      count: matchingFlights.length,
      data: matchingFlights,
    });
  } catch (error) {
    console.error(
      "Search Flights Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to search flights. Please try again.",
      data: [],
    });
  }
};

// ============================================================
// GET ALL FLIGHTS
// ============================================================

export const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find({})
      .populate("departureAirport")
      .populate("arrivalAirport")
      .sort({ departureTime: 1 });

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error(
      "Get All Flights Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
      data: [],
    });
  }
};

// ============================================================
// GET FLIGHT BY ID
// ============================================================

export const getFlightById = async (req, res) => {
  try {
    const flight =
      await Flight.findById(req.params.id)
        .populate("departureAirport")
        .populate("arrivalAirport");

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: flight,
    });
  } catch (error) {
    console.error(
      "Get Flight By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// CREATE FLIGHT
// ============================================================

export const createFlight = async (req, res) => {
  try {
    const {
      airline,
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      duration,
    } = req.body;

    if (
      !airline ||
      !flightNumber ||
      !departureAirport ||
      !arrivalAirport ||
      !departureTime ||
      !arrivalTime ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required flight details.",
      });
    }

    const maxSeats = Math.min(
      Number(totalSeats) || 120,
      180
    );

    const seats = [];

    for (let i = 0; i < maxSeats; i++) {
      const row =
        Math.floor(i / 6) + 1;

      const col =
        String.fromCharCode(
          65 + (i % 6)
        );

      seats.push({
        number: `${row}${col}`,
        isAvailable: true,
      });
    }

    const flight = await Flight.create({
      airline,
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      price,
      totalSeats: maxSeats,
      availableSeats: maxSeats,
      duration,
      seats,
    });

    return res.status(201).json({
      success: true,
      message: "Flight created successfully.",
      data: flight,
    });
  } catch (error) {
    console.error(
      "Create Flight Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// UPDATE FLIGHT
// ============================================================

export const updateFlight = async (req, res) => {
  try {
    const {
      seats,
      ...updateData
    } = req.body;

    const flight =
      await Flight.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: flight,
    });
  } catch (error) {
    console.error(
      "Update Flight Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// DELETE FLIGHT
// ============================================================

export const deleteFlight = async (req, res) => {
  try {
    const activeBookings =
      await Booking.countDocuments({
        flight: req.params.id,
        status: "CONFIRMED",
      });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete flight. There are ${activeBookings} active bookings.`,
      });
    }

    const flight =
      await Flight.findByIdAndDelete(
        req.params.id
      );

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Flight removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete Flight Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};