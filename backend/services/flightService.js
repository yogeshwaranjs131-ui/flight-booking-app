import api from './api';

const flightService = {
  // Get all flights (for admin)
  getAllFlights: () => api.get('/flights'),

  // Search for flights based on criteria
  searchFlights: (arg) => {
    const signal = arg?.signal;
    const params = arg?.params || arg;
    
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