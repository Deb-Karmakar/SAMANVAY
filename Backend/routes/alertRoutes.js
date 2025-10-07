// Backend/routes/alertRoutes.js
import express from 'express';
const router = express.Router();
import { 
    getMyAlerts, 
    acknowledgeAlert, 
    snoozeAlert, 
    generateAlerts,
    triggerEscalation,
    runNightlyJob,
    getEscalationStats
} from '../controllers/alertController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// User alert management routes
router.route('/').get(protect, getMyAlerts);
router.route('/:id/acknowledge').put(protect, acknowledgeAlert);
router.route('/:id/snooze').put(protect, snoozeAlert);

// Admin-only routes
router.route('/generate').post(protect, isAdmin, generateAlerts);

// NEW: Manual escalation testing routes (admin only)
router.route('/escalate').post(protect, isAdmin, triggerEscalation);
router.route('/nightly-job').post(protect, isAdmin, runNightlyJob);
router.route('/escalation-stats').get(protect, isAdmin, getEscalationStats);

export default router;