// Backend/routes/communicationRoutes.js
import express from 'express';
import { getCommunicationLogs } from '../controllers/communicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCommunicationLogs);

export default router;