// Backend/routes/alertRoutes.js

import express from 'express';
const router = express.Router();
import { 
    getMyAlerts, 
    acknowledgeAlert, 
    snoozeAlert, 
    generateAlerts // Make sure this is imported
} from '../controllers/alertController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Routes for fetching and managing alerts
router.route('/').get(protect, getMyAlerts);
router.route('/:id/acknowledge').put(protect, acknowledgeAlert);
router.route('/:id/snooze').put(protect, snoozeAlert);

// --- THIS IS THE ROUTE TO CHECK ---
// It should be a POST route and protected by admin middleware
router.route('/generate').post(protect, isAdmin, generateAlerts);

export default router;