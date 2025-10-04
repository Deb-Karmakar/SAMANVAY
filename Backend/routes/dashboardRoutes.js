import express from 'express';
const router = express.Router();
import { getAdminStats, getProjectStatusChartData, getRecentActivity } from '../controllers/dashboardController.js';

router.get('/stats', getAdminStats);
router.get('/project-status-chart', getProjectStatusChartData);
router.get('/recent-activity', getRecentActivity);

export default router;