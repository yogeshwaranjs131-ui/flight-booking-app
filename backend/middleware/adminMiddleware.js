const admin = (req, res, next) => {
  // This middleware should be used after the 'protect' middleware,
  // as it depends on req.user being set.
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed to the next middleware/controller
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export { admin };