import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    airline: {
      type: String,
      required: true,
    },
    flightNumber: {
      type: String,
      required: true,
      unique: true,
    },
    departureAirport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airport',
      required: true,
    },
    arrivalAirport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airport',
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 180,
    },
    availableSeats: {
      type: Number,
      required: true,
      default: 180,
    },
    seats: [
      {
        number: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Flight = mongoose.models.Flight || mongoose.model("Flight", flightSchema);

export default Flight;