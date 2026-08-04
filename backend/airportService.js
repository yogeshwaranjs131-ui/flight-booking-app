import api from './api';

const airportService = {
  // Get all airports
  getAirports: () => api.get('/airports'),
  // You can add more airport-related services here if needed
  // getAirportById: (id) => api.get(`/airports/${id}`),
};

export default airportService;