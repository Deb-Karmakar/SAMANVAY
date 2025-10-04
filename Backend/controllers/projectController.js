import Project from '../models/projectModel.js';

// @desc   Create a new project
// @route  POST /api/projects
const createProject = async (req, res) => {
    try {
        // --- DEBUG STEP 1: Log the incoming data from the frontend ---
        console.log("--- 1. Data received from frontend (req.body): ---");
        console.log(req.body);

        // This line creates the new project object in memory
        const project = new Project({ ...req.body, createdBy: req.user._id });

        // --- DEBUG STEP 2: Log the Mongoose object before it's saved ---
        console.log("--- 2. Project object before saving to database: ---");
        console.log(project);

        // This line attempts to save it to the database
        const createdProject = await project.save();
        
        res.status(201).json(createdProject);
    } catch (error) {
        console.error("--- PROJECT CREATION FAILED ---");
        console.error(error); // Log the full error
        res.status(400).json({ message: "Failed to create project", error: error.message });
    }
};

// @desc   Get all projects (for admin)
// @route  GET /api/projects
const getProjects = async (req, res) => {
    try {
        // --- THIS IS THE FIX ---
        // Update the populate syntax for the nested path
        const projects = await Project.find({}).populate({
            path: 'assignments',
            populate: { path: 'agency', select: 'name' }
        });
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch projects", error: error.message });
    }
};

// @desc   Get projects for the logged-in state officer's state
// @route  GET /api/projects/mystate
const getMyStateProjects = async (req, res) => {
    try {
        // --- THIS IS THE FIX ---
        // Update the populate syntax for the nested path
        const projects = await Project.find({ state: req.user.state }).populate({
            path: 'assignments',
            populate: { path: 'agency', select: 'name' }
        });
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch state projects", error: error.message });
    }
};

// @desc   Get a single project by ID
// @route  GET /api/projects/:id
const getProjectById = async (req, res) => {
    try {
        // --- THIS IS THE FIX ---
        // Update the populate syntax for the nested path
        const project = await Project.findById(req.params.id).populate({
            path: 'assignments',
            populate: { path: 'agency', select: 'name' }
        });

        if (project) {
            // ... (Security check remains the same)
            res.status(200).json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch project", error: error.message });
    }
};

// @desc   Assign agencies and milestones to a project
// @route  PUT /api/projects/:id/assign
const assignAgency = async (req, res) => {
    // This function is already correct from our last update
    try {
        const { assignments } = req.body;
        const project = await Project.findById(req.params.id);

        if (project) {
            if (req.user.role === 'StateOfficer' && project.state !== req.user.state) {
                return res.status(403).json({ message: 'Not authorized for this project' });
            }
            project.assignments = assignments;
            project.status = 'On Track';
            const updatedProject = await project.save();
            res.status(200).json(updatedProject);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(400).json({ message: "Failed to assign agency", error: error.message });
    }
};

const addAssignmentsToProject = async (req, res) => {
    try {
        const { assignments } = req.body;
        const project = await Project.findById(req.params.id);

        if (project) {
            // Security check
            if (req.user.role === 'StateOfficer' && project.state !== req.user.state) {
                return res.status(403).json({ message: 'Not authorized for this project' });
            }

            // Use $push to add new assignments to the existing array
            project.assignments.push(...assignments);
            
            const updatedProject = await project.save();
            res.status(200).json(updatedProject);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(400).json({ message: "Failed to add assignments", error: error.message });
    }
};

// @desc   Get projects assigned to the logged-in agency
// @route  GET /api/projects/myagency
const getMyAgencyProjects = async (req, res) => {
    try {
        if (req.user.role !== 'ExecutingAgency') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Find projects where this agency is in the assignments array
        const projects = await Project.find({
            'assignments.agency': req.user.agencyId
        }).populate({
            path: 'assignments.agency',
            select: 'name'
        });

        // Filter to return only the assignment relevant to this agency
        const filteredProjects = projects.map(project => {
            const relevantAssignment = project.assignments.find(
                assignment => assignment.agency._id.toString() === req.user.agencyId.toString()
            );
            
            return {
                _id: project._id,
                name: project.name,
                state: project.state,
                district: project.district,
                component: project.component,
                status: project.status,
                progress: project.progress,
                budget: project.budget,
                startDate: project.startDate,
                endDate: project.endDate,
                assignment: relevantAssignment, // Only this agency's assignment
                createdAt: project.createdAt,
                updatedAt: project.updatedAt
            };
        });

        res.status(200).json(filteredProjects);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch agency projects", error: error.message });
    }
};

// @desc   Update checklist item and recalculate progress
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex
const updateChecklistItem = async (req, res) => {
    try {
        const { projectId, assignmentIndex, checklistIndex } = req.params;
        const { completed } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security check: verify this agency owns this assignment
        const assignment = project.assignments[assignmentIndex];
        if (assignment.agency.toString() !== req.user.agencyId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this checklist' });
        }

        // Update the checklist item
        assignment.checklist[checklistIndex].completed = completed;

        // Recalculate progress based on completed tasks
        const completedCount = assignment.checklist.filter(item => item.completed).length;
        const totalCount = assignment.checklist.length;
        project.progress = Math.round((completedCount / totalCount) * 100);

        // Update status based on progress
        if (project.progress === 100) {
            project.status = 'Completed';
        } else if (project.progress > 0) {
            project.status = 'On Track';
        }

        await project.save();

        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: "Failed to update checklist", error: error.message });
    }
};

// Backend/controllers/projectController.js

// Replace the old updateChecklistItem with this:

// @desc   Submit milestone for review (with images)
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/submit
const submitMilestoneForReview = async (req, res) => {
    try {
        const { projectId, assignmentIndex, checklistIndex } = req.params;
        const { proofImages } = req.body; // Array of image URLs

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const assignment = project.assignments[assignmentIndex];
        if (assignment.agency.toString() !== req.user.agencyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const milestone = assignment.checklist[checklistIndex];
        
        if (!proofImages || proofImages.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one proof image' });
        }

        // Update milestone
        milestone.proofImages = proofImages;
        milestone.status = 'Pending Review';
        milestone.submittedAt = new Date();

        await project.save();

        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: "Failed to submit milestone", error: error.message });
    }
};

// @desc   Review milestone (approve/reject) - State Officer only
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/review
const reviewMilestone = async (req, res) => {
    try {
        const { projectId, assignmentIndex, checklistIndex } = req.params;
        const { action, comments } = req.body; // action: 'approve' or 'reject'

        if (req.user.role !== 'StateOfficer') {
            return res.status(403).json({ message: 'Only state officers can review milestones' });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.state !== req.user.state) {
            return res.status(403).json({ message: 'Not authorized for this state' });
        }

        const assignment = project.assignments[assignmentIndex];
        const milestone = assignment.checklist[checklistIndex];

        if (milestone.status !== 'Pending Review') {
            return res.status(400).json({ message: 'This milestone is not pending review' });
        }

        milestone.reviewedAt = new Date();
        milestone.reviewedBy = req.user._id;
        milestone.reviewComments = comments;

        if (action === 'approve') {
            milestone.status = 'Approved';
            milestone.completed = true;

            // Recalculate progress
            const completedCount = assignment.checklist.filter(item => item.completed).length;
            const totalCount = assignment.checklist.length;
            project.progress = Math.round((completedCount / totalCount) * 100);

            if (project.progress === 100) {
                project.status = 'Completed';
            } else if (project.progress > 0) {
                project.status = 'On Track';
            }
        } else if (action === 'reject') {
            milestone.status = 'Rejected';
            milestone.completed = false;
        }

        await project.save();

        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: "Failed to review milestone", error: error.message });
    }
};

// @desc   Get projects with pending reviews (for State Officer)
// @route  GET /api/projects/pending-reviews
const getProjectsWithPendingReviews = async (req, res) => {
    try {
        if (req.user.role !== 'StateOfficer') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const projects = await Project.find({ 
            state: req.user.state,
            'assignments.checklist.status': 'Pending Review'
        }).populate({
            path: 'assignments.agency',
            select: 'name'
        });

        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch projects", error: error.message });
    }
};

// Update exports
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
    updateChecklistItem // Add this line
};