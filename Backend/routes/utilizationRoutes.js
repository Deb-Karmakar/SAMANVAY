// Backend/routes/utilizationRoutes.js (Updated)

import express from 'express';
const router = express.Router();
import { 
    submitUtilizationReport,
    getPendingReportsForState,  // <-- Import new
    reviewUtilizationReport     // <-- Import new
} from '../controllers/utilizationController.js';
import { protect, isStateOfficer, isExecutingAgency } from '../middleware/authMiddleware.js';
import { uploadCertificate } from '../middleware/uploadMiddleware.js';

// Agency Route
router.route('/submit').post(
    protect,
    isExecutingAgency,
    uploadCertificate.single('certificate'),
    submitUtilizationReport
);

// State Officer Routes
router.route('/pending').get(protect, isStateOfficer, getPendingReportsForState);
router.route('/:id/review').put(protect, isStateOfficer, reviewUtilizationReport);

export default router;