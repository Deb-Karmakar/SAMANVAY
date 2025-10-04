import express from 'express';
const router = express.Router();
import { createAgency, getAgencies, getMyStateAgencies } from '../controllers/agencyController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js'; // <-- FIX: Added the missing import

// For /api/agencies
router.route('/')
    .get(getAgencies)
    .post(protect, isAdmin, createAgency); // Assumes only admins can create agencies

// For /api/agencies/mystate
router.route('/mystate').get(protect, getMyStateAgencies);

export default router;