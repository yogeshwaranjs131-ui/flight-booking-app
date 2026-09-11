import User from '../models/User.js';

/**
 * @desc    Update user profile image
 * @route   POST /api/users/profile-image
 * @access  Private (requires token)
 */
export const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Get image URL or path from the request body
      user.profileImage = req.body.image || user.profileImage;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        message: 'Profile image updated successfully',
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};