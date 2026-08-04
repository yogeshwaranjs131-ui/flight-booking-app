import mongoose from "mongoose";
import { GENDER } from "../utils/constants.js";

export const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: GENDER,
      required: true,
    },

    // The seat is related to a specific booking, not a permanent
    // attribute of a passenger, so it's better placed in the booking context.
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
    },
  },
  {
    _id: false,
  }
);
