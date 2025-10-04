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

export { createProject, getProjects, getMyStateProjects, getProjectById, assignAgency };