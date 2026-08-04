import api from './api'; // axios instance ஐ நேரடியாகப் பயன்படுத்துவதற்குப் பதிலாக, api.js இலிருந்து இறக்குமதி செய்யவும்

// API URL ஆனது api.js இல் உள்ள axios instance இலிருந்து தானாகவே கையாளப்படும்.
const AUTH_URL = "/auth"; // அடிப்படை URL க்குப் பதிலாக, auth endpoint ஐ மட்டும் குறிப்பிடவும்

// 1. Register
const register = async (userData) => {
  const response = await api.post(`${AUTH_URL}/register`, userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// 2. Login
const login = async (userData) => {
  const response = await api.post(`${AUTH_URL}/login`, userData);
  if (response.data && !response.data.twoFactorRequired) { // Only set user if 2FA is not required
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// 3. Logout
const logout = () => {
  localStorage.removeItem("user");
};

// 4. Verify 2FA token during login
const verifyTwoFactorToken = async (data) => {
  const response = await api.post(`${AUTH_URL}/verify-2fa`, data);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const authService = {
  register,
  logout,
  login,
  verifyTwoFactorToken,
};

export default authService;