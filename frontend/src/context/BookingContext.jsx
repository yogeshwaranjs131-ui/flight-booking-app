import { createContext, useState, useContext, useCallback } from 'react';
import bookingService from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchMyBookings = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your bookings.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createNewBooking = async (bookingData) => {
    setLoading(true);
    try {
      const response = await bookingService.createBooking(bookingData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    bookings,
    loading,
    error,
    fetchMyBookings,
    createNewBooking,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};