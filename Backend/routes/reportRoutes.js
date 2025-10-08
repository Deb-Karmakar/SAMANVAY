// Backend/routes/reportRoutes.js

import express from 'express';
const router = express.Router();
import {
    generateFundUtilizationReport,
    generateProjectStatusReport,
    generateAgencyPerformanceReport,
    generateAlertSummaryReport,
    generateComponentWiseReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

// All report routes require authentication and Admin/CentralAdmin role
router.use(protect);
router.use((req, res, next) => {
    // Accept both Admin and CentralAdmin roles
    const allowedRoles = ['Admin', 'CentralAdmin'];
    
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
            message: 'Not authorized - Admin only',
            userRole: req.user?.role || 'No role found'
        });
    }
    next();
});

// Report generation endpoints
router.post('/fund-utilization', generateFundUtilizationReport);
router.post('/project-status', generateProjectStatusReport);
router.post('/agency-performance', generateAgencyPerformanceReport);
router.post('/alert-summary', generateAlertSummaryReport);
router.post('/component-wise', generateComponentWiseReport);

export default router;