import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Read the JWT from the 'Authorization' header (e.g., 'Bearer <token>')
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user id (supports both decoded.id and decoded.userId to prevent null errors)
      const userId = decoded.id || decoded.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Not authorized, token payload invalid' });
      }

      // Get user from the token and attach it to the request object
      req.user = await User.findById(userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };