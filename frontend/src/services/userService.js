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

export const userService = {
  getAllUsers,
  deleteUser,
  getMyProfile,
};

export default userService;