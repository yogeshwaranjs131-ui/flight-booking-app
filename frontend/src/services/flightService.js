
import api from "./api";

const flightService = {
  // ============================================================
  // GET ALL FLIGHTS
  // ============================================================

  getAllFlights: async () => {
    const response = await api.get("/flights");
    return response.data;
  },

  // ============================================================
  // SEARCH FLIGHTS
  // ============================================================

  searchFlights: async ({ from, to, date, signal } = {}) => {
    try {
      const response = await api.get("/flights/search", {
        params: {
          from,
          to,
          date,
        },
        signal,
      });

      return response.data;
    } catch (error) {
      console.error(
        "Flight Search API Error:",
        error.response?.data || error.message
      );

      // Do NOT return fake flight data.
      // Let SearchFlights.jsx handle the error safely.
      throw error;
    }
  },

  // ============================================================
  // GET SINGLE FLIGHT
  // ============================================================

  getFlightById: async (id) => {
    const response = await api.get(`/flights/${id}`);
    return response.data;
  },

  // ============================================================
  // ADMIN - CREATE FLIGHT
  // ============================================================

  createFlight: async (flightData) => {
    const response = await api.post("/flights", flightData);
    return response.data;
  },

  // ============================================================
  // ADMIN - UPDATE FLIGHT
  // ============================================================

  updateFlight: async (id, flightData) => {
    const response = await api.put(
      `/flights/${id}`,
      flightData
    );

    return response.data;
  },

  // ============================================================
  // ADMIN - DELETE FLIGHT
  // ============================================================

  deleteFlight: async (id) => {
    const response = await api.delete(`/flights/${id}`);
    return response.data;
  },
};

export default flightService;
