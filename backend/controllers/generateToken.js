import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // You can also set the token in an HTTP-Only cookie for better security
  return token;
};

export default generateToken;