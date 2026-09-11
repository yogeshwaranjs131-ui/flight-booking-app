import api from './api';

/**
 * Fetches all users. (For Admin)
 * @returns {Promise<object>} A list of all users.
 */
const getAllUsers = () => {
  return api.get('/users');
};

/**
 * Deletes a user by their ID. (For Admin)
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<object>} The response from the API.
 */
const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

/**
 * Fetches the profile of the currently authenticated user.
 * @returns {Promise<object>} The user's profile data.
 */
const getMyProfile = () => {
  return api.get('/auth/profile');
};

/**
 * Uploads or updates the profile image.
 * @param {FormData} formData - The form data containing the profile image file.
 * @returns {Promise<object>} The response from the API.
 */
const uploadProfileImage = (formData) => {
  return api.post('/users/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Disables Two-Factor Authentication for the user.
 * @returns {Promise<object>} The response from the API.
 */
const disable2FA = () => {
  return api.post('/auth/disable-2fa');
};

export const userService = {
  getAllUsers,
  deleteUser,
  getMyProfile,
  uploadProfileImage,
  disable2FA,
};

export default userService;