// Backend/routes/projectRoutes.js
import express from 'express';
const router = express.Router();
import { 
    createProject, 
    getProjects, 
    getMyStateProjects, 
    assignAgency, 
    getProjectById, 
    addAssignmentsToProject,
    getMyAgencyProjects,
    submitMilestoneForReview,
    reviewMilestone,
    getProjectsWithPendingReviews
} from '../controllers/projectController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, isAdmin, getProjects)
    .post(protect, isAdmin, createProject);

router.route('/mystate').get(protect, getMyStateProjects);
router.route('/myagency').get(protect, getMyAgencyProjects);
router.route('/pending-reviews').get(protect, getProjectsWithPendingReviews);

router.route('/:id/assign').put(protect, assignAgency);
router.route('/:id').get(protect, getProjectById); 
router.route('/:id/assignments').post(protect, addAssignmentsToProject);

// New milestone routes
router.route('/:projectId/checklist/:assignmentIndex/:checklistIndex/submit')
    .put(protect, submitMilestoneForReview);
router.route('/:projectId/checklist/:assignmentIndex/:checklistIndex/review')
    .put(protect, reviewMilestone);

export default router;