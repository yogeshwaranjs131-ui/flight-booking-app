const admin = (req, res, next) => {
  // This middleware should be used after the 'protect' middleware
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export { admin };