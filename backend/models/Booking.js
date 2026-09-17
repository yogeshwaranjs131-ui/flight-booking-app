import mongoose from "mongoose";
import { passengerSchema } from "./Passenger.js";
import { BOOKING_STATUS } from "../utils/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    // =========================================================
    // USER
    // =========================================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================================================
    // TRIP TYPE
    // =========================================================
    tripType: {
      type: String,
      enum: ["one-way", "round-trip"],
      default: "one-way",
      required: true,
    },

    // =========================================================
    // OUTBOUND FLIGHT
    // =========================================================
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },

    // =========================================================
    // RETURN FLIGHT
    // Required only for round-trip
    // =========================================================
    returnFlight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: function () {
        return this.tripType === "round-trip";
      },
      default: null,
    },

    // =========================================================
    // PASSENGERS
    // Same passengers travel on both legs
    // =========================================================
    passengers: {
      type: [passengerSchema],
      required: true,

      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length > 0
          );
        },

        message:
          "At least one passenger is required",
      },
    },

    // =========================================================
    // OUTBOUND SEATS
    // =========================================================
    seats: {
      type: [String],
      required: true,

      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length > 0
          );
        },

        message:
          "At least one outbound seat is required",
      },
    },

    // =========================================================
    // RETURN SEATS
    // Required only for round-trip
    // =========================================================
    returnSeats: {
      type: [String],
      default: [],

      validate: {
        validator: function (value) {
          if (this.tripType === "round-trip") {
            return (
              Array.isArray(value) &&
              value.length > 0
            );
          }

          return true;
        },

        message:
          "At least one return seat is required for round-trip",
      },
    },

    // =========================================================
    // TOTAL PRICE
    // =========================================================
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================================================
    // PNR
    // =========================================================
    pnr: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    // =========================================================
    // PAYMENT DETAILS
    // =========================================================
    paymentDetails: {
      stripe_payment_intent_id: {
        type: String,
        default: null,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Success",
          "Failed",
          "Refunded",
        ],
        default: "Pending",
      },
    },

    // =========================================================
    // BOOKING STATUS
    // =========================================================
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
  },

  // ===========================================================
  // TIMESTAMPS
  // ===========================================================
  {
    timestamps: true,
  }
);

// =============================================================
// MODEL
// =============================================================

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;