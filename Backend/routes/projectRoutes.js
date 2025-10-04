import express from 'express';
const router = express.Router();
import { createProject, getProjects,  getMyStateProjects, assignAgency, getProjectById } from '../controllers/projectController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Any request to /api/projects will first hit 'protect' middleware
// The POST request will then also hit the 'isAdmin' middleware
router.route('/')
    .get(protect, isAdmin, getProjects)
    .post(protect, isAdmin, createProject);

router.route('/mystate').get(protect, getMyStateProjects);
router.route('/:id/assign').put(protect, assignAgency);
router.route('/:id').get(protect, getProjectById); // <-- Add this new route


export default router;