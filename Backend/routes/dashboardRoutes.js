// Backend/routes/dashboardRoutes.js
import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    // Admin endpoints
    getAdminStats,
    getProjectStatusChartData,
    getRecentActivity,
    getStatePerformance,
    getBudgetTrends,
    getComponentBreakdown,
    getTopAgencies,
    
    // State endpoints
    getStateStats,
    getPendingApprovals,
    getDistrictBreakdown,
    
    // Agency endpoints
    getAgencyStats,
    getUpcomingDeadlines,
    getAgencyBudget
} from '../controllers/dashboardController.js';

// ============================================
// ADMIN DASHBOARD ROUTES
// ============================================
router.get('/stats', protect, getAdminStats);
router.get('/project-status-chart', protect, getProjectStatusChartData);
router.get('/recent-activity', protect, getRecentActivity);
router.get('/state-performance', protect, getStatePerformance);
router.get('/budget-trends', protect, getBudgetTrends);
router.get('/component-breakdown', protect, getComponentBreakdown);
router.get('/top-agencies', protect, getTopAgencies);

// ============================================
// STATE DASHBOARD ROUTES
// ============================================
router.get('/state-stats', protect, getStateStats);
router.get('/pending-approvals', protect, getPendingApprovals);
router.get('/district-breakdown', protect, getDistrictBreakdown);

// ============================================
// AGENCY DASHBOARD ROUTES
// ============================================
router.get('/agency-stats', protect, getAgencyStats);
router.get('/upcoming-deadlines', protect, getUpcomingDeadlines);
router.get('/agency-budget', protect, getAgencyBudget);

export default router;