// Backend/routes/projectRoutes.js (Corrected)

import express from 'express';
const router = express.Router();
import {
    createProject,
    getProjects,
    getMyStateProjects,
    getProjectById,
    assignAgency, // <-- Make sure this is imported
    addAssignmentsToProject,
    getMyAgencyProjects,
    submitMilestoneForReview,
    reviewMilestone,
    getProjectsWithPendingReviews,
    getProjectLocations,
    getProjectLocationsForState
} from '../controllers/projectController.js';
import { protect, isAdmin, isStateOfficer, isExecutingAgency } from '../middleware/authMiddleware.js';

// Admin Routes
router.route('/').post(protect, isAdmin, createProject).get(protect, isAdmin, getProjects);

// --- Static routes must come BEFORE dynamic routes with :id ---
router.route('/locations').get(protect, isAdmin, getProjectLocations);
router.route('/mystate').get(protect, isStateOfficer, getMyStateProjects);
router.route('/myagency').get(protect, isExecutingAgency, getMyAgencyProjects);
router.route('/pending-reviews').get(protect, isStateOfficer, getProjectsWithPendingReviews);

// State Officer Routes
router.route('/:id/assign').put(protect, isStateOfficer, assignAgency); // <-- ADDED THIS MISSING ROUTE
router.route('/:id/assignments').post(protect, isStateOfficer, addAssignmentsToProject);
router.route('/:projectId/checklist/:assignmentIndex/:checklistIndex/review').put(protect, isStateOfficer, reviewMilestone);

// Agency Routes
router.route('/:projectId/checklist/:assignmentIndex/:checklistIndex/submit').put(protect, isExecutingAgency, submitMilestoneForReview);

// --- Dynamic :id route is now last ---
router.route('/:id').get(protect, getProjectById);

router.route('/locations/mystate').get(protect, isStateOfficer, getProjectLocationsForState);



export default router;