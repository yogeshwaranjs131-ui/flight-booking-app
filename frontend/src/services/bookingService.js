import api from './api';

/**
 * Creates a new booking.
 */
const createBooking = (bookingData) => {
  return api.post('/bookings', bookingData);
};

/**
 * Fetches all bookings for the currently logged-in user.
 */
const getMyBookings = () => {
  return api.get('/bookings/mybookings');
};

/**
 * Fetches all bookings in the system. (For Admin)
 */
const getAllBookings = () => {
  return api.get('/admin/bookings');
};

/**
 * Cancels a booking by its ID.
 */
const cancelBooking = (id) => {
  return api.put(`/bookings/${id}/cancel`);
};

/**
 * Downloads the booking ticket as a PDF.
 */
const getBookingByPnr = (pnr) => {
  return api.get(`/bookings/pnr/${encodeURIComponent(pnr)}`);
};

const downloadTicket = (id) => {
  return api.get(`/bookings/${id}/download`, { responseType: 'blob' });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingByPnr,
  cancelBooking,
  downloadTicket,
};

export default bookingService;