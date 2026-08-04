import api from './api';

const adminService = {
  // Get dashboard statistics
  getStats: () => api.get('/admin/stats'),
};

export default adminService;