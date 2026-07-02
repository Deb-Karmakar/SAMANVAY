import asyncHandler from 'express-async-handler';
import projectService from '../services/projectService.js';

// @desc   Create a new project
// @route  POST /api/projects
const createProject = async (req, res) => {
    try {
        const result = await projectService.createProject(req.body, req.user);
        res.status(201).json(result);
    } catch (error) {
        console.error("Project creation failed:", error);
        res.status(400).json({ message: "Failed to create project", error: error.message });
    }
};

// @desc   Get all projects (for admin)
// @route  GET /api/projects
const getProjects = async (req, res) => {
    try {
        const projects = await projectService.getProjects();
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch projects", error: error.message });
    }
};

// @desc   Get projects for the logged-in state officer's state
// @route  GET /api/projects/mystate
const getMyStateProjects = async (req, res) => {
    try {
        const projects = await projectService.getMyStateProjects(req.user.state);
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch state projects", error: error.message });
    }
};

// @desc   Get a single project by ID
// @route  GET /api/projects/:id
const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id, req.user);
        res.status(200).json(project);
    } catch (error) {
        if (error.message === 'Project not found') {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(400).json({ message: "Failed to fetch project", error: error.message });
    }
};

// @desc   Assign agencies and milestones to a project
// @route  PUT /api/projects/:id/assign
const assignAgency = async (req, res) => {
    try {
        const updatedProject = await projectService.assignAgency(req.params.id, req.body.assignments, req.user);
        res.status(200).json(updatedProject);
    } catch (error) {
        if (error.message === 'Project not found') return res.status(404).json({ message: error.message });
        if (error.message === 'Not authorized for this project') return res.status(403).json({ message: error.message });
        res.status(400).json({ message: "Failed to assign agency", error: error.message });
    }
};

// @desc   Add new assignments to existing project
// @route  POST /api/projects/:id/assignments
const addAssignmentsToProject = async (req, res) => {
    try {
        const result = await projectService.addAssignmentsToProject(req.params.id, req.body.assignments, req.user);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Project not found') return res.status(404).json({ message: error.message });
        if (error.message === 'Not authorized') return res.status(403).json({ message: error.message });
        res.status(400).json({ message: "Failed to add assignments", error: error.message });
    }
};

// @desc   Get projects assigned to the logged-in agency
// @route  GET /api/projects/myagency
const getMyAgencyProjects = async (req, res) => {
    try {
        const projects = await projectService.getMyAgencyProjects(req.user);
        res.status(200).json(projects);
    } catch (error) {
        if (error.message === 'Not authorized') return res.status(403).json({ message: error.message });
        res.status(400).json({ message: "Failed to fetch agency projects", error: error.message });
    }
};

// @desc   Submit milestone for review (with images)
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/submit
const submitMilestoneForReview = async (req, res) => {
    try {
        const { projectId, assignmentIndex, checklistIndex } = req.params;
        const { proofImages } = req.body;
        
        const project = await projectService.submitMilestoneForReview(projectId, assignmentIndex, checklistIndex, proofImages, req.user);
        res.status(200).json(project);
    } catch (error) {
        if (error.message === 'Project not found') return res.status(404).json({ message: error.message });
        if (error.message === 'Not authorized') return res.status(403).json({ message: error.message });
        res.status(400).json({ message: "Failed to submit milestone", error: error.message });
    }
};

// @desc   Review milestone (approve/reject) - State Officer only
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/review
const reviewMilestone = asyncHandler(async (req, res) => {
    const { projectId, assignmentIndex, checklistIndex } = req.params;
    const { action, comments } = req.body;

    try {
        const project = await projectService.reviewMilestone(projectId, assignmentIndex, checklistIndex, action, comments, req.user);
        res.status(200).json(project);
    } catch (error) {
        if (error.message.includes('authorized') || error.message.includes('Only state officers')) {
            res.status(403);
            throw new Error(error.message);
        }
        if (error.message.includes('not found')) {
            res.status(404);
            throw new Error(error.message);
        }
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc   Get projects with pending reviews (for State Officer)
// @route  GET /api/projects/pending-reviews
const getProjectsWithPendingReviews = async (req, res) => {
    try {
        const projects = await projectService.getProjectsWithPendingReviews(req.user);
        res.status(200).json(projects);
    } catch (error) {
        if (error.message === 'Not authorized') return res.status(403).json({ message: error.message });
        res.status(400).json({ message: "Failed to fetch projects", error: error.message });
    }
};

const getProjectLocations = asyncHandler(async (req, res) => {
    try {
        const projects = await projectService.getProjectLocations(req.user);
        res.json(projects);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
});

const getProjectLocationsForState = asyncHandler(async (req, res) => {
    const projects = await projectService.getProjectLocationsForState(req.user);
    res.json(projects);
});

// @desc   Get project locations for logged-in agency
// @route  GET /api/projects/locations/myagency
const getProjectLocationsForAgency = asyncHandler(async (req, res) => {
    try {
        const projects = await projectService.getProjectLocationsForAgency(req.user);
        res.json(projects);
    } catch (error) {
        if (error.message.includes('executing agencies')) return res.status(403).json({ message: error.message });
        if (error.message === 'Agency ID not found') return res.status(400).json({ message: error.message });
        res.status(400).json({ message: error.message });
    }
});

export { 
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
    getProjectLocationsForState,
    getProjectLocationsForAgency
};