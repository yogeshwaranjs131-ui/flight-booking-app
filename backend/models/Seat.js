import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },

    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },

    classType: {
      type: String,
      enum: ["Economy", "Premium Economy", "Business", "First Class"],
      default: "Economy",
    },

    isBooked: {
      type: Boolean,
      default: false,
    },

    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Seat = mongoose.model("Seat", seatSchema);

export default Seat;