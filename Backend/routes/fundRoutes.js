// Backend/routes/fundRoutes.js (Updated)

import express from 'express';
const router = express.Router();
import { 
    getFundSummary, 
    generateFundReport,
    getFundSummaryForState,      // <-- Import new
    generateFundReportForState   // <-- Import new
} from '../controllers/fundController.js';
import { protect, isAdmin, isStateOfficer } from '../middleware/authMiddleware.js'; // <-- Import new

// Admin Routes
router.route('/summary').get(protect, isAdmin, getFundSummary);
router.route('/report/download').get(protect, isAdmin, generateFundReport);

// State Officer Routes
router.route('/summary/mystate').get(protect, isStateOfficer, getFundSummaryForState);
router.route('/report/download/mystate').get(protect, isStateOfficer, generateFundReportForState);

export default router;