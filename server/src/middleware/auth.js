const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      delete user.password;
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as admin' });
  }
};

const adminOrTrainer = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'trainer' || req.user.role === 'employee' || req.user.role === 'employer')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect, admin, adminOrTrainer };
