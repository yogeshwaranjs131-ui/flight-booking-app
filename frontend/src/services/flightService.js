import api from './api';

const flightService = {
  // Get all flights (for admin)
  getAllFlights: () => api.get('/flights'),

  // Search for flights based on criteria (Handles both signal and params correctly)
  searchFlights: (arg) => {
    const signal = arg?.signal;
    // If params are passed inside an object or directly
    const params = arg?.params || (arg?.signal ? {} : arg);
    
    // Clean up signal if it got mixed into params
    if (params && params.signal) {
      delete params.signal;
    }

    return api.get('/flights/search', { params, signal });
  },

  // Get a single flight by its ID
  getFlightById: (id) => api.get(`/flights/${id}`),

  // Admin: Create a new flight
  createFlight: (flightData) => api.post('/flights', flightData),

  // Admin: Update an existing flight
  updateFlight: (id, flightData) => api.put(`/flights/${id}`, flightData),

  // Admin: Delete a flight
  deleteFlight: (id) => api.delete(`/flights/${id}`),
};

export default flightService; 