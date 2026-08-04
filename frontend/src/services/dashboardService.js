import api from './api';

/**
 * Fetches dashboard statistics.
 * @returns {Promise<object>} An object containing stats like total users, flights, bookings, and revenue.
 */
const getStats = () => {
  return api.get('/dashboard/stats');
};

export const dashboardService = {
  getStats,
};

export default dashboardService;