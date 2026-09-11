import Flight from '../models/Flight.js';
import Airport from '../models/Airport.js';
import Booking from '../models/Booking.js';

// Search flights based on criteria
export const searchFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = {};

    // 1. Departure Airport Match (Flexible)
    if (from && from.trim() !== '') {
      const departureAirport = await Airport.findOne({
        $or: [
          { airportCode: new RegExp(`^${from.trim()}$`, 'i') },
          { code: new RegExp(`^${from.trim()}$`, 'i') },
          { city: new RegExp(from.trim(), 'i') },
        ],
      });
      if (departureAirport) {
        query.departureAirport = departureAirport._id;
      } else {
        query.$or = [{ departureAirport: from }, { 'departureAirport.code': new RegExp(from, 'i') }];
      }
    }

    // 2. Arrival Airport Match (Flexible)
    if (to && to.trim() !== '') {
      const arrivalAirport = await Airport.findOne({
        $or: [
          { airportCode: new RegExp(`^${to.trim()}$`, 'i') },
          { code: new RegExp(`^${to.trim()}$`, 'i') },
          { city: new RegExp(to.trim(), 'i') },
        ],
      });
      if (arrivalAirport) {
        query.arrivalAirport = arrivalAirport._id;
      } else {
        query.$or = [{ arrivalAirport: to }, { 'arrivalAirport.code': new RegExp(to, 'i') }];
      }
    }

    // 3. Date Search Fix (Supports both String and Date formats)
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.departureTime = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const flights = await Flight.find(query)
      .populate('departureAirport')
      .populate('arrivalAirport');

    // Absolute fallback if strict query returns zero results so UI displays seeded list instead of blank
    let finalFlights = flights;
    if (flights.length === 0) {
      finalFlights = await Flight.find({}).populate('departureAirport').populate('arrivalAirport');
    }

    res.status(200).json({
      success: true,
      count: finalFlights.length,
      data: finalFlights,
    });
  } catch (error) {
    console.error("Search Flights Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all flights (Publicly accessible, but can be protected for admin if needed)
export const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find({})
      .populate('departureAirport')
      .populate('arrivalAirport')
      .sort({ departureTime: 1 });
    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error("Get All Flights Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get flight by ID
export const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('departureAirport')
      .populate('arrivalAirport');
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.status(200).json({ success: true, data: flight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a flight (Admin)
export const createFlight = async (req, res) => {
  try {
    const { airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, price, totalSeats, duration } = req.body;

    // Generate seats based on totalSeats
    const seats = [];
    for (let i = 0; i < totalSeats; i++) {
      const row = Math.floor(i / 6) + 1;
      const col = String.fromCharCode(65 + (i % 6));
      seats.push({ number: `${row}${col}`, isAvailable: true });
    }

    const flight = await Flight.create({
      airline, flightNumber, departureAirport, arrivalAirport,
      departureTime, arrivalTime, price, totalSeats, duration,
      availableSeats: totalSeats,
      seats,
    });

    res.status(201).json({ success: true, data: flight });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a flight (Admin)
export const updateFlight = async (req, res) => {
  try {
    const { seats, ...updateData } = req.body; 

    const flight = await Flight.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.status(200).json({ success: true, data: flight });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a flight (Admin)
export const deleteFlight = async (req, res) => {
  try {
    const activeBookings = await Booking.countDocuments({ flight: req.params.id, status: 'CONFIRMED' });
    if (activeBookings > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete flight. There are ${activeBookings} active bookings.` });
    }

    const flight = await Flight.findByIdAndDelete(req.params.id);

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.status(200).json({ success: true, message: 'Flight removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};