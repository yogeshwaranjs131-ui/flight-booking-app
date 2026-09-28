import User from '../models/User.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private (requires token)
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile image
 * @route   POST /api/users/profile-image
 * @access  Private (requires token)
 */
export const uploadProfileImage = async (req, res) => {
  try {
    const image = req.body?.image;
    const imageMatch = typeof image === 'string'
      ? image.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/)
      : null;

    if (!imageMatch) {
      return res.status(400).json({
        message: 'Upload a JPG, PNG, or WEBP image.',
      });
    }

    if (Buffer.byteLength(imageMatch[2], 'base64') > 1024 * 1024) {
      return res.status(413).json({
        message: 'Profile images must be 1 MB or smaller.',
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.profileImage = image;
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