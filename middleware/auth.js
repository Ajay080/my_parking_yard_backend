import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

// Middleware to check if user is staff or admin
export const requireStaff = (req, res, next) => {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Staff privileges required.' });
    }
    next();
};
