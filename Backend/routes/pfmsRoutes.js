// Backend/routes/pfmsRoutes.js
import express from 'express';
const router = express.Router();
import {
    getDashboard,
    getStateData,
    syncPFMSData,
    syncWithProjects,
    syncRealData, // ADD THIS
    recordTransaction,
    getTransactions,
    getComponentBreakdown,
    getQuarterlyTrends,
    getStateComparison,
    initializeFiscalYear,
    getHealthCheck,
    exportReport
} from '../controllers/pfmsController.js';


import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Public/Common routes (require authentication)
router.route('/dashboard').get(protect, getDashboard);
router.route('/state/:state').get(protect, getStateData);
router.route('/transactions').get(protect, getTransactions);
router.route('/components').get(protect, getComponentBreakdown);
router.route('/quarterly').get(protect, getQuarterlyTrends);
router.route('/health').get(protect, getHealthCheck);

// Admin-only routes
router.route('/sync').post(protect, isAdmin, syncPFMSData);
router.route('/sync-projects').post(protect, isAdmin, syncWithProjects);
router.route('/initialize').post(protect, isAdmin, initializeFiscalYear);
router.route('/states/comparison').get(protect, isAdmin, getStateComparison);
router.route('/export').get(protect, isAdmin, exportReport);
router.route('/sync-real').post(protect, isAdmin, syncRealData);

// Transaction routes (Admin and State Officers)
router.route('/transaction').post(protect, recordTransaction);

export default router;