import mongoose from "mongoose";
import { passengerSchema } from "./Passenger.js";
import { BOOKING_STATUS } from "../utils/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },

    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one passenger is required",
      },
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one seat is required",
      },
    },

    pnr: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
