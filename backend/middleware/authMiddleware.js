import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes for logged-in users
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    // Fallback for native browser downloads
    token = req.query.token;
  }

  if (token) {
    try {

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, token value is empty' });
      }

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');

      // Fetch user from db, exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
};

// Check if role is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, administrator privileges required' });
  }
};

// Check if role is delivery executive
const delivery = (req, res, next) => {
  if (req.user && (req.user.role === 'delivery' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, delivery executive privileges required' });
  }
};

export { protect, admin, delivery };
