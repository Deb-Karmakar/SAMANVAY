import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            
            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }
            
            console.log('✅ Authenticated user:', req.user.email, 'Role:', req.user.role);
            next();
        } catch (error) {
            console.error('❌ Token verification failed:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        console.error('❌ No token provided');
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'CentralAdmin' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

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

// ✅ Flexible role-based access control
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authenticated. Please log in.' 
            });
        }

        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            console.log(`❌ Access denied for ${req.user.email}. Required: ${roles.join(' or ')}, Got: ${req.user.role}`);
            return res.status(403).json({ 
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}` 
            });
        }

        console.log(`✅ Access granted for ${req.user.email} with role ${req.user.role}`);
        next();
    };
};

export { protect, isAdmin, isStateOfficer, isExecutingAgency, restrictTo };