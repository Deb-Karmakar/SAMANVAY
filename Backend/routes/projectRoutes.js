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
    updateChecklistItem
} from '../controllers/projectController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, isAdmin, getProjects)
    .post(protect, isAdmin, createProject);

router.route('/mystate').get(protect, getMyStateProjects);
router.route('/myagency').get(protect, getMyAgencyProjects); // New route
router.route('/:id/assign').put(protect, assignAgency);
router.route('/:id').get(protect, getProjectById); 
router.route('/:id/assignments').post(protect, addAssignmentsToProject);
router.route('/:projectId/checklist/:assignmentIndex/:checklistIndex').put(protect, updateChecklistItem); // New route

export default router;