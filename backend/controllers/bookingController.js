
import Stripe from "stripe";

import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import generateTicketPDF from "../utils/generateTicketPDF.js";
import { generatePNR } from "../utils/pnrUtils.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================
// COMMON FLIGHT POPULATE
// ============================================================

const flightPopulate = [
  {
    path: "departureAirport",
  },
  {
    path: "arrivalAirport",
  },
];

// ============================================================
// POPULATE BOOKING
// ============================================================

const populateBooking = (query) => {
  return query
    .populate("user", "name email")
    .populate({
      path: "flight",
      populate: flightPopulate,
    })
    .populate({
      path: "returnFlight",
      populate: flightPopulate,
    });
};

// ============================================================
// NORMALIZE SEAT
// ============================================================

const normalizeSeat = (seatItem) => {
  if (typeof seatItem === "object" && seatItem !== null) {
    return (
      seatItem.number ||
      seatItem.seatNumber ||
      seatItem.id ||
      ""
    );
  }

  return String(seatItem || "").trim();
};

// ============================================================
// NORMALIZE SEATS
// ============================================================

const normalizeSeats = (seats = []) => {
  if (!Array.isArray(seats)) {
    return [];
  }

  return seats
    .map(normalizeSeat)
    .map((seat) => seat.trim())
    .filter(Boolean);
};

// ============================================================
// DUPLICATE SEAT CHECK
// ============================================================

const hasDuplicateSeats = (seats) => {
  const normalized = seats.map((seat) =>
    String(seat).trim().toUpperCase()
  );

  return new Set(normalized).size !== normalized.length;
};

// ============================================================
// VALIDATE SEAT MAP
// ============================================================

const validateSeatMap = (flight, requestedSeats) => {
  // If this flight does not yet have a seat map,
  // we only validate availableSeats below.
  if (!Array.isArray(flight.seats) || flight.seats.length === 0) {
    return {
      valid: true,
      message: null,
    };
  }

  for (const requestedSeat of requestedSeats) {
    const seat = flight.seats.find(
      (item) =>
        String(item.number).toUpperCase() ===
        String(requestedSeat).toUpperCase()
    );

    if (!seat) {
      return {
        valid: false,
        message: `Seat ${requestedSeat} does not exist`,
      };
    }

    if (!seat.isAvailable) {
      return {
        valid: false,
        message: `Seat ${requestedSeat} is already booked`,
      };
    }
  }

  return {
    valid: true,
    message: null,
  };
};

// ============================================================
// MARK SEATS UNAVAILABLE
// ============================================================

const markSeatsUnavailable = async (flightId, seats) => {
  if (!seats.length) return;

  const flight = await Flight.findById(flightId);

  if (!flight) return;

  if (!Array.isArray(flight.seats) || flight.seats.length === 0) {
    return;
  }

  const selectedSeatSet = new Set(
    seats.map((seat) => String(seat).toUpperCase())
  );

  flight.seats.forEach((seat) => {
    if (
      selectedSeatSet.has(
        String(seat.number).toUpperCase()
      )
    ) {
      seat.isAvailable = false;
    }
  });

  await flight.save();
};

// ============================================================
// RESTORE SEATS
// ============================================================

const restoreSeats = async (flightId, seats) => {
  if (!flightId || !seats.length) return;

  const flight = await Flight.findById(flightId);

  if (!flight) return;

  if (!Array.isArray(flight.seats) || flight.seats.length === 0) {
    return;
  }

  const selectedSeatSet = new Set(
    seats.map((seat) => String(seat).toUpperCase())
  );

  flight.seats.forEach((seat) => {
    if (
      selectedSeatSet.has(
        String(seat.number).toUpperCase()
      )
    ) {
      seat.isAvailable = true;
    }
  });

  await flight.save();
};

// ============================================================
// VERIFY STRIPE PAYMENT
// ============================================================

const verifyStripePayment = async ({
  paymentDetails,
  expectedAmount,
}) => {
  if (!paymentDetails) {
    throw new Error("Payment details are required");
  }

  const paymentIntentId =
    paymentDetails.stripe_payment_intent_id;

  if (!paymentIntentId) {
    throw new Error(
      "Stripe Payment Intent ID is required"
    );
  }

  const paymentIntent =
    await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

  if (!paymentIntent) {
    throw new Error("Stripe payment not found");
  }

  if (paymentIntent.status !== "succeeded") {
    throw new Error(
      `Stripe payment is not completed. Current status: ${paymentIntent.status}`
    );
  }

  const expectedAmountInPaise = Math.round(
    Number(expectedAmount) * 100
  );

  if (
    Number(paymentIntent.amount) !==
    expectedAmountInPaise
  ) {
    throw new Error(
      "Stripe payment amount does not match booking amount"
    );
  }

  if (
    String(paymentIntent.currency).toLowerCase() !==
    "inr"
  ) {
    throw new Error(
      "Invalid payment currency"
    );
  }

  return paymentIntent;
};

// ============================================================
// GET BOOKING BY PNR
// ============================================================

export const getBookingByPnr = async (req, res) => {
  try {
    const rawPnr = String(
      req.params.pnr || ""
    )
      .trim()
      .toUpperCase();

    if (!rawPnr) {
      return res.status(400).json({
        success: false,
        message: "PNR is required",
      });
    }

    const booking = await populateBooking(
      Booking.findOne({
        pnr: rawPnr,
      })
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "PNR not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
      status: booking.status,
      pnr: booking.pnr,
      message: "PNR status fetched successfully",
    });
  } catch (error) {
    console.error(
      "Get Booking By PNR Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch booking",
    });
  }
};

// ============================================================
// CREATE BOOKING
// ============================================================

export const createBooking = async (req, res) => {
  try {
    const {
      flightId,
      returnFlightId,
      tripType = "one-way",
      passengers,
      seats,
      returnSeats = [],
      totalPrice,
      paymentDetails,
    } = req.body;

    const userId = req.user?._id;

    // ========================================================
    // AUTH CHECK
    // ========================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ========================================================
    // TRIP TYPE
    // ========================================================

    if (
      !["one-way", "round-trip"].includes(
        tripType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip type",
      });
    }

    // ========================================================
    // BASIC VALIDATION
    // ========================================================

    if (!flightId) {
      return res.status(400).json({
        success: false,
        message: "Flight ID is required",
      });
    }

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one passenger is required",
      });
    }

    if (
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one outbound seat is required",
      });
    }

    // ========================================================
    // NORMALIZE SEATS
    // ========================================================

    const normalizedSeats =
      normalizeSeats(seats);

    const normalizedReturnSeats =
      normalizeSeats(returnSeats);

    if (normalizedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid outbound seat selection",
      });
    }

    if (
      tripType === "round-trip" &&
      normalizedReturnSeats.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one return seat is required",
      });
    }

    // ========================================================
    // DUPLICATE SEAT CHECK
    // ========================================================

    if (hasDuplicateSeats(normalizedSeats)) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate outbound seats are not allowed",
      });
    }

    if (
      tripType === "round-trip" &&
      hasDuplicateSeats(normalizedReturnSeats)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate return seats are not allowed",
      });
    }

    // ========================================================
    // FIND OUTBOUND FLIGHT
    // ========================================================

    const flight =
      await Flight.findById(flightId);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message:
          "Outbound flight not found",
      });
    }

    // ========================================================
    // AVAILABLE SEATS CHECK
    // ========================================================

    if (
      Number(flight.availableSeats) <
      normalizedSeats.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough seats available on outbound flight",
      });
    }

    // ========================================================
    // OUTBOUND SEAT MAP VALIDATION
    // ========================================================

    const outboundSeatValidation =
      validateSeatMap(
        flight,
        normalizedSeats
      );

    if (!outboundSeatValidation.valid) {
      return res.status(400).json({
        success: false,
        message:
          outboundSeatValidation.message,
      });
    }

    // ========================================================
    // ROUND TRIP
    // ========================================================

    let returnFlight = null;

    if (tripType === "round-trip") {
      if (!returnFlightId) {
        return res.status(400).json({
          success: false,
          message:
            "Return flight is required for round-trip booking",
        });
      }

      if (
        normalizedReturnSeats.length !==
        normalizedSeats.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Outbound and return passenger seat counts must match",
        });
      }

      returnFlight =
        await Flight.findById(
          returnFlightId
        );

      if (!returnFlight) {
        return res.status(404).json({
          success: false,
          message:
            "Return flight not found",
        });
      }

      if (
        Number(returnFlight.availableSeats) <
        normalizedReturnSeats.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Not enough seats available on return flight",
        });
      }

      const returnSeatValidation =
        validateSeatMap(
          returnFlight,
          normalizedReturnSeats
        );

      if (!returnSeatValidation.valid) {
        return res.status(400).json({
          success: false,
          message:
            returnSeatValidation.message,
        });
      }
    }

    // ========================================================
    // SERVER-SIDE PRICE CALCULATION
    // ========================================================

    const outboundBasePrice =
      Number(flight.price || 0) *
      normalizedSeats.length;

    const returnBasePrice =
      tripType === "round-trip"
        ? Number(returnFlight?.price || 0) *
          normalizedReturnSeats.length
        : 0;

    const basePrice =
      outboundBasePrice +
      returnBasePrice;

    // Current project GST/tax calculation
    const tax = basePrice * 0.18;

    const calculatedTotal =
      Number((basePrice + tax).toFixed(2));

    // ========================================================
    // FRONTEND TOTAL VALIDATION
    // ========================================================

    const frontendTotal =
      Number(totalPrice);

    if (
      !Number.isFinite(frontendTotal) ||
      frontendTotal <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking amount",
      });
    }

    if (
      Math.abs(
        frontendTotal - calculatedTotal
      ) > 0.01
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking amount does not match server calculation",
        expectedTotal: calculatedTotal,
        receivedTotal: frontendTotal,
      });
    }

    // ========================================================
    // STRIPE PAYMENT VERIFICATION
    // ========================================================

    let verifiedPayment;

    try {
      verifiedPayment =
        await verifyStripePayment({
          paymentDetails,
          expectedAmount:
            calculatedTotal,
        });
    } catch (paymentError) {
      return res.status(400).json({
        success: false,
        message:
          paymentError.message ||
          "Payment verification failed",
      });
    }

    // ========================================================
    // GENERATE PNR
    // ========================================================

    const pnr = await generatePNR();

    // ========================================================
    // CREATE BOOKING
    // ========================================================

    const newBooking = new Booking({
      user: userId,

      tripType,

      flight: flightId,

      returnFlight:
        tripType === "round-trip"
          ? returnFlightId
          : null,

      passengers,

      seats: normalizedSeats,

      returnSeats:
        tripType === "round-trip"
          ? normalizedReturnSeats
          : [],

      totalPrice:
        calculatedTotal,

      pnr,

      paymentDetails: {
        stripe_payment_intent_id:
          verifiedPayment.id,

        status:
          verifiedPayment.status,

        amount:
          verifiedPayment.amount,

        currency:
          verifiedPayment.currency,
      },
    });

    // ========================================================
    // SAVE BOOKING
    // ========================================================

    const savedBooking =
      await newBooking.save();

    // ========================================================
    // UPDATE OUTBOUND AVAILABLE SEATS
    // ========================================================

    flight.availableSeats =
      Number(flight.availableSeats) -
      normalizedSeats.length;

    await flight.save();

    // ========================================================
    // MARK OUTBOUND SEATS UNAVAILABLE
    // ========================================================

    await markSeatsUnavailable(
      flightId,
      normalizedSeats
    );

    // ========================================================
    // UPDATE RETURN FLIGHT
    // ========================================================

    if (
      tripType === "round-trip" &&
      returnFlight
    ) {
      returnFlight.availableSeats =
        Number(
          returnFlight.availableSeats
        ) -
        normalizedReturnSeats.length;

      await returnFlight.save();

      await markSeatsUnavailable(
        returnFlightId,
        normalizedReturnSeats
      );
    }

    // ========================================================
    // POPULATE BOOKING
    // ========================================================

    const populatedBooking =
      await populateBooking(
        Booking.findById(
          savedBooking._id
        )
      );

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,
      data: populatedBooking,
      message:
        tripType === "round-trip"
          ? "Round-trip booking created successfully"
          : "Booking created successfully",
    });
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Booking creation failed",
    });
  }
};

// ============================================================
// GET BOOKING BY ID
// ============================================================

export const getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await populateBooking(
        Booking.findById(
          req.params.id
        )
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(
      "Get Booking By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch booking",
    });
  }
};

// ============================================================
// DOWNLOAD TICKET
// ============================================================

export const downloadTicket = async (
  req,
  res
) => {
  try {
    const booking =
      await populateBooking(
        Booking.findById(
          req.params.id
        )
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    // ========================================================
    // GENERATE PDF
    // ========================================================

    const pdfBuffer =
      await generateTicketPDF(
        booking
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${booking.pnr}.pdf`
    );

    res.setHeader(
      "Content-Length",
      pdfBuffer.length
    );

    return res.send(pdfBuffer);
  } catch (error) {
    console.error(
      "Download Ticket Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate ticket",
    });
  }
};

// ============================================================
// GET MY BOOKINGS
// ============================================================

export const getMyBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        user: req.user._id,
      })
        .populate({
          path: "flight",
          populate: flightPopulate,
        })
        .populate({
          path: "returnFlight",
          populate: flightPopulate,
        })
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(
      "Get My Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch bookings",
    });
  }
};

// ============================================================
// CANCEL BOOKING
// ============================================================

export const cancelBooking = async (
  req,
  res
) => {
  try {
    const bookingId =
      req.params.id;

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    if (
      booking.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already cancelled",
      });
    }

    // ========================================================
    // RESTORE OUTBOUND AVAILABLE SEATS
    // ========================================================

    const flight =
      await Flight.findById(
        booking.flight
      );

    if (flight) {
      flight.availableSeats =
        Number(
          flight.availableSeats
        ) +
        booking.seats.length;

      await flight.save();

      await restoreSeats(
        booking.flight,
        booking.seats
      );
    }

    // ========================================================
    // RESTORE RETURN AVAILABLE SEATS
    // ========================================================

    if (
      booking.tripType ===
        "round-trip" &&
      booking.returnFlight
    ) {
      const returnFlight =
        await Flight.findById(
          booking.returnFlight
        );

      if (returnFlight) {
        returnFlight.availableSeats =
          Number(
            returnFlight.availableSeats
          ) +
          booking.returnSeats.length;

        await returnFlight.save();

        await restoreSeats(
          booking.returnFlight,
          booking.returnSeats
        );
      }
    }

    // ========================================================
    // UPDATE BOOKING STATUS
    // ========================================================

    booking.status =
      "Cancelled";

    await booking.save();

    // ========================================================
    // POPULATE UPDATED BOOKING
    // ========================================================

    const updatedBooking =
      await populateBooking(
        Booking.findById(
          booking._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error(
      "Cancel Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to cancel booking",
    });
  }
};
