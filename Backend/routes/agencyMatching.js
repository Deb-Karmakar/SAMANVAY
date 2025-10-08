import express from 'express';
import { getAgencyRecommendations } from '../controllers/agencyMatchingController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only state officers can access
router.post(
  '/recommendations',
  protect,
  restrictTo('StateOfficer'),
  getAgencyRecommendations
);

export default router;