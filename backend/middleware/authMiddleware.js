import jwt from 'jsonwebtoken';
import User from '../Models/User.js'; 

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');

      // Check if role is admin or owner
      if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
        next(); 
      } else {
        res.status(403).json({ message: 'Access denied. Admins and owners only.' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Token failed or expired.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No token provided.' });
  }
};