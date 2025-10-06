// Backend/middleware/authMiddleware.js (Updated)

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler'; // Recommended for error handling

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'CentralAdmin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// --- NEW MIDDLEWARE ---
const isStateOfficer = (req, res, next) => {
    if (req.user && req.user.role === 'StateOfficer' && req.user.state) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a state officer' });
    }
};
 const isExecutingAgency = (req, res, next) => {
    if (req.user && req.user.role === 'ExecutingAgency' && req.user.agencyId) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an executing agency' });
    }
};

// Update the exports at the bottom of the file
export { protect, isAdmin, isStateOfficer, isExecutingAgency };