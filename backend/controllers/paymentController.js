import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { BOOKING_STATUS } from "../utils/constants.js";

/**
 * @desc    Create Payment
 * @route   POST /api/payments
 * @access  Private
 */
export const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and Payment Method are required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check Booking Owner
    if (
      booking.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Prevent Duplicate Payment
    const existingPayment =
      await Payment.findOne({
        booking: booking._id,
      });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message:
          "Payment already completed for this booking",
      });
    }

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalPrice,
      paymentMethod,
      transactionId:
        "TXN" + Date.now(),
      paymentStatus: "Success",
      paidAt: new Date(),
    });

    booking.status =
      BOOKING_STATUS.CONFIRMED;

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Payment successful",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get Payment By Id
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentById = async (
  req,
  res
) => {
  try {
    const payment = await Payment.findById(
      req.params.id
    )
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: {
          path: "flight",
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Owner or Admin
    if (
      payment.user._id.toString() !==
        req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get My Payments
 * @route   GET /api/payments
 * @access  Private
 */
export const getMyPayments = async (
  req,
  res
) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
    })
      .populate({
        path: "booking",
        populate: {
          path: "flight",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get All Payments
 * @route   GET /api/payments/admin/all
 * @access  Admin
 */
export const getAllPayments = async (
  req,
  res
) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
