// Backend/routes/fundRoutes.js

import express from 'express';
const router = express.Router();
import { getFundSummary, generateFundReport } from '../controllers/fundController.js'; // Import new function
import { protect, isAdmin } from '../middleware/authMiddleware.js';

router.route('/summary').get(protect, isAdmin, getFundSummary);
router.route('/report/download').get(protect, isAdmin, generateFundReport); // Add the new route

export default router;