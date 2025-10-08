// Backend/routes/projectRoutes.js - COMPLETE FIXED VERSION

import express from 'express';
const router = express.Router();
import {
    createProject,
    getProjects,
    getMyStateProjects,
    getProjectById,
    assignAgency,
    addAssignmentsToProject,
    getMyAgencyProjects,
    submitMilestoneForReview,
    reviewMilestone,
    getProjectsWithPendingReviews,
    getProjectLocations,
    getProjectLocationsForState
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

// ============================================
// CREATE PROJECT - Admin only
// ============================================
router.post('/', protect, async (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, createProject);

// ============================================
// GET ALL PROJECTS - Role-based access
// ============================================
router.get('/', protect, async (req, res, next) => {
    // Admin sees all projects
    if (req.user.role === 'Admin') {
        return next();
    }
    
    // State Officer sees only their state's projects
    if (req.user.role === 'StateOfficer') {
        return getMyStateProjects(req, res);
    }
    
    // Agency sees only their projects
    if (req.user.role === 'ExecutingAgency') {
        return getMyAgencyProjects(req, res);
    }
    
    return res.status(403).json({ message: 'Not authorized' });
}, getProjects);

// ============================================
// STATIC ROUTES (must come before :id routes)
// ============================================

// Get project locations for map (Admin only)
router.get('/locations', protect, async (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, getProjectLocations);

// Get project locations for state officer's state
router.get('/locations/mystate', protect, async (req, res, next) => {
    if (req.user.role !== 'StateOfficer') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, getProjectLocationsForState);

// Get state officer's projects
router.get('/mystate', protect, async (req, res, next) => {
    if (req.user.role !== 'StateOfficer') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, getMyStateProjects);

// Get agency's projects
router.get('/myagency', protect, async (req, res, next) => {
    if (req.user.role !== 'ExecutingAgency') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, getMyAgencyProjects);

// Get projects with pending reviews (State Officer)
router.get('/pending-reviews', protect, async (req, res, next) => {
    if (req.user.role !== 'StateOfficer') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, getProjectsWithPendingReviews);

// ============================================
// PROJECT ASSIGNMENT ROUTES
// ============================================

// Assign agency to project (State Officer or Admin)
router.put('/:id/assign', protect, async (req, res, next) => {
    if (req.user.role !== 'StateOfficer' && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, assignAgency);

// Add assignments to project (State Officer or Admin)
router.post('/:id/assignments', protect, async (req, res, next) => {
    if (req.user.role !== 'StateOfficer' && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, addAssignmentsToProject);

// ============================================
// MILESTONE ROUTES
// ============================================

// Submit milestone for review (Agency)
router.put('/:projectId/checklist/:assignmentIndex/:checklistIndex/submit', 
    protect, 
    async (req, res, next) => {
        if (req.user.role !== 'ExecutingAgency') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        next();
    },
    submitMilestoneForReview
);

// Review milestone (State Officer)
router.put('/:projectId/checklist/:assignmentIndex/:checklistIndex/review', 
    protect,
    async (req, res, next) => {
        if (req.user.role !== 'StateOfficer') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        next();
    },
    reviewMilestone
);

// ============================================
// DYNAMIC ROUTES (must come last)
// ============================================

// Get single project by ID
router.get('/:id', protect, getProjectById);

export default router;