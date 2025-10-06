// Backend/routes/alertRoutes.js
import express from 'express';
import { getMyAlerts, acknowledgeAlert, snoozeAlert, generateAlerts } from '../controllers/alertController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyAlerts);
router.put('/:id/acknowledge', protect, acknowledgeAlert);
router.put('/:id/snooze', protect, snoozeAlert);
router.post('/generate', protect, isAdmin, generateAlerts);

export default router;