import Booking from '../models/Booking.js';
import Flight from '../models/flight.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import generateTicketPDF from '../utils/generateTicketPDF.js';
import { generatePNR } from '../utils/pnrUtils.js';

export const createBooking = async (req, res) => {
  try {
    const { flightId, passengers, seats, totalPrice, paymentDetails } = req.body;
    const userId = req.user._id;

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    if (paymentDetails) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed.' });
      }
    }
    
    const normalizedSeats = seats.map(seatItem => 
      typeof seatItem === 'object' && seatItem !== null ? (seatItem.number || seatItem.seatNumber || seatItem.id) : seatItem
    );

    const finalTotalPrice = totalPrice && !isNaN(totalPrice) ? Number(totalPrice) : normalizedSeats.length * 6500;

    const newBooking = new Booking({
      user: userId,
      flight: flightId,
      passengers,
      seats: normalizedSeats,
      totalPrice: finalTotalPrice,
      pnr: generatePNR(),
    });

    const savedBooking = await newBooking.save();
    const populatedBooking = await Booking.findById(savedBooking._id).populate('user', 'name email').populate({ path: 'flight', populate: [{ path: 'departureAirport' }, { path: 'arrivalAirport' }] });

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email').populate({ path: 'flight', populate: [{ path: 'departureAirport' }, { path: 'arrivalAirport' }] });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadTicket = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email').populate({ path: 'flight', populate: [{ path: 'departureAirport' }, { path: 'arrivalAirport' }] });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const pdfBuffer = await generateTicketPDF(booking);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.pnr}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate({ path: 'flight', populate: [{ path: 'departureAirport' }, { path: 'arrivalAirport' }] }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // findByIdAndUpdate மூலம் ஸ்டேட்டஸை மாற்றும்போது ஸ்கீமா வேலிடேஷன் எரர் வராது
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId, 
      { status: 'Cancelled' }, 
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Booking cancelled successfully', 
      data: updatedBooking 
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};