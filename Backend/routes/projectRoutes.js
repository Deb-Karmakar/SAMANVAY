// Backend/routes/projectRoutes.js - COMPLETELY FIXED VERSION

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

// Helper function to check if user is admin
const isAdmin = (role) => role === 'Admin' || role === 'CentralAdmin';

// ============================================
// STATIC ROUTES (MUST BE FIRST - before :id routes)
// ============================================

// Get project locations for map (Admin only)
router.get('/locations', protect, getProjectLocations);

// Get project locations for state officer's state
router.get('/locations/mystate', protect, getProjectLocationsForState);

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
// CREATE PROJECT - Admin only
// ============================================
router.post('/', protect, async (req, res, next) => {
    console.log('🔒 CREATE PROJECT - User role:', req.user.role);
    
    // ✅ FIXED: Use OR operator and correct logic
    if (!isAdmin(req.user.role)) {
        console.log('❌ Authorization failed - User is not admin');
        return res.status(403).json({ message: 'Not authorized - Admin access required' });
    }
    
    console.log('✅ Authorization passed');
    next();
}, createProject);

// ============================================
// GET ALL PROJECTS - Role-based access
// ============================================
router.get('/', protect, async (req, res, next) => {
    console.log('🔒 GET PROJECTS - User role:', req.user.role);
    
    // ✅ FIXED: Use OR operator for admin check
    if (isAdmin(req.user.role)) {
        console.log('✅ Admin access - showing all projects');
        return next();
    }
    
    // State Officer sees only their state's projects
    if (req.user.role === 'StateOfficer') {
        console.log('✅ State Officer access - showing state projects');
        return getMyStateProjects(req, res);
    }
    
    // Agency sees only their projects
    if (req.user.role === 'ExecutingAgency') {
        console.log('✅ Agency access - showing agency projects');
        return getMyAgencyProjects(req, res);
    }
    
    console.log('❌ Authorization failed - Invalid role');
    return res.status(403).json({ message: 'Not authorized' });
}, getProjects);

// ============================================
// PROJECT ASSIGNMENT ROUTES
// ============================================

// Assign agency to project (State Officer or Admin)
router.put('/:id/assign', protect, async (req, res, next) => {
    // ✅ FIXED: Cleaner logic
    if (req.user.role !== 'StateOfficer' && !isAdmin(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}, assignAgency);

// Add assignments to project (State Officer or Admin)
router.post('/:id/assignments', protect, async (req, res, next) => {
    // ✅ FIXED: Cleaner logic
    if (req.user.role !== 'StateOfficer' && !isAdmin(req.user.role)) {
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
// DYNAMIC ROUTES (MUST BE LAST)
// ============================================

// Get single project by ID
router.get('/:id', protect, getProjectById);

export default router;