// Backend/controllers/projectController.js
import Alert from '../models/alertModel.js'; // <-- 1. IMPORT ADDED
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import Agency from '../models/agencyModel.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';
import { generateProjectApprovalPDF, generateAssignmentOrderPDF } from '../utils/pdfService.js';
import CommunicationLog from '../models/communicationLogModel.js';
import asyncHandler from 'express-async-handler'; // Recommended for cleaner async/await
import { getCoordsForProject } from '../utils/geocoder.js';

// @desc   Create a new project
// @route  POST /api/projects
const createProject = async (req, res) => {
    try {
        console.log('📝 Creating project with data:', req.body);
        
        // 1. Create project data object and add geocoding BEFORE creating project instance
        const projectData = { ...req.body, createdBy: req.user._id };

        // 2. Run geocoding logic before creating the Project instance
        if (projectData.district && projectData.state) {
            const location = getCoordsForProject(projectData.district, projectData.state);
            if (location) {
                projectData.location = location;
                console.log(`📍 Geocoded project to ${projectData.district}, ${projectData.state}`);
            }
        }

        // 3. Now create and save the project with all data included
        const project = new Project(projectData);
        const createdProject = await project.save();
        
        console.log('✅ Project created:', createdProject._id);

        // 4. Continue with PDF generation and email notifications
        console.log('📄 Generating PDF...');
        const pdfResult = await generateProjectApprovalPDF(createdProject);
        console.log('✅ PDF generated:', pdfResult.filename);

        // Find state officer email
        console.log('🔍 Looking for state officer in state:', createdProject.state);
        const stateOfficer = await User.findOne({ 
            role: 'StateOfficer', 
            state: createdProject.state,
            isActive: true
        });

        console.log('👤 State officer found:', stateOfficer ? stateOfficer.email : 'NONE');

        if (stateOfficer) {
            const emailContent = emailTemplates.projectCreated(
                createdProject.name,
                createdProject.state,
                createdProject._id
            );

            console.log('📧 Sending email to:', stateOfficer.email);
            console.log('📧 Email subject:', emailContent.subject);

            try {
                await sendEmail({
                    to: stateOfficer.email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                    attachments: [{
                        filename: pdfResult.filename,
                        path: pdfResult.filepath
                    }]
                });

                console.log('✅ Email sent successfully');

                await CommunicationLog.create({
                    type: 'email',
                    event: 'project_created',
                    project: createdProject._id,
                    sender: req.user._id,
                    recipient: {
                        email: stateOfficer.email,
                        userId: stateOfficer._id
                    },
                    subject: emailContent.subject,
                    status: 'sent',
                    attachments: [pdfResult],
                    sentAt: new Date()
                });
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
                console.error('❌ Full error:', emailError.stack);
                
                await CommunicationLog.create({
                    type: 'email',
                    event: 'project_created',
                    project: createdProject._id,
                    sender: req.user._id,
                    recipient: { email: stateOfficer.email },
                    status: 'failed',
                    error: emailError.message
                });
            }
        } else {
            console.warn('⚠️ No active state officer found for state:', createdProject.state);
        }

        res.status(201).json({
            project: createdProject,
            pdf: pdfResult
        });
    } catch (error) {
        console.error("❌ Project creation failed:", error);
        console.error("❌ Full error:", error.stack);
        res.status(400).json({ message: "Failed to create project", error: error.message });
    }
};

// @desc   Get all projects (for admin)
// @route  GET /api/projects
const getProjects = async (req, res) => {
    try {
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
        const project = await Project.findById(req.params.id).populate({
            path: 'assignments.agency',
            select: 'name'
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // If the user is an ExecutingAgency, filter to show only their assignment
        if (req.user.role === 'ExecutingAgency') {
            const relevantAssignment = project.assignments.find(
                assignment => assignment.agency._id.toString() === req.user.agencyId.toString()
            );
            
            const filteredProject = {
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
                assignment: relevantAssignment, // Single assignment for this agency
                assignments: [relevantAssignment], // Also as array for compatibility
                createdAt: project.createdAt,
                updatedAt: project.updatedAt
            };
            
            return res.status(200).json(filteredProject);
        }

        // For state officers and admins, return full project with all assignments
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch project", error: error.message });
    }
};

// @desc   Assign agencies and milestones to a project
// @route  PUT /api/projects/:id/assign
const assignAgency = async (req, res) => {
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

// @desc   Add new assignments to existing project
// @route  POST /api/projects/:id/assignments
const addAssignmentsToProject = async (req, res) => {
    try {
        const { assignments } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (req.user.role === 'StateOfficer' && project.state !== req.user.state) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Populate agency details for the assignments
        const populatedAssignments = await Promise.all(
            assignments.map(async (assignment) => {
                const agency = await Agency.findById(assignment.agency);
                return {
                    ...assignment,
                    agencyDetails: agency
                };
            })
        );

        project.assignments.push(...assignments);
        const updatedProject = await project.save();

        // Generate assignment order PDF
        const populatedProject = await Project.findById(project._id).populate('assignments.agency');
        const pdfResult = await generateAssignmentOrderPDF(populatedProject, populatedProject.assignments.slice(-assignments.length));

        // Send emails to all assigned agencies
        for (const assignment of populatedAssignments) {
            const agency = assignment.agencyDetails;
            
            // Find agency user
            const agencyUser = await User.findOne({
                role: 'ExecutingAgency',
                agencyId: agency._id,
                isActive: true
            });

            if (agencyUser) {
                const emailContent = emailTemplates.agencyAssigned(
                    project.name,
                    agency.name,
                    assignment.checklist,
                    project._id
                );

                try {
                    await sendEmail({
                        to: agencyUser.email,
                        subject: emailContent.subject,
                        html: emailContent.html,
                        attachments: [{
                            filename: pdfResult.filename,
                            path: pdfResult.filepath
                        }]
                    });

                    await CommunicationLog.create({
                        type: 'email',
                        event: 'agency_assigned',
                        project: project._id,
                        sender: req.user._id,
                        recipient: {
                            email: agencyUser.email,
                            userId: agencyUser._id
                        },
                        subject: emailContent.subject,
                        status: 'sent',
                        attachments: [pdfResult],
                        sentAt: new Date()
                    });
                } catch (emailError) {
                    console.error(`Email failed for ${agency.name}:`, emailError);
                }
            }
        }

        res.status(200).json({
            project: updatedProject,
            pdf: pdfResult
        });
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

        const projects = await Project.find({
            'assignments.agency': req.user.agencyId
        }).populate({
            path: 'assignments.agency',
            select: 'name'
        });

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
                assignment: relevantAssignment,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt
            };
        });

        res.status(200).json(filteredProjects);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch agency projects", error: error.message });
    }
};

// @desc   Submit milestone for review (with images)
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/submit
const submitMilestoneForReview = async (req, res) => {
    try {
        const { projectId, assignmentIndex, checklistIndex } = req.params;
        const { proofImages } = req.body;

        console.log('📝 Submitting milestone:', { projectId, assignmentIndex, checklistIndex });
        console.log('👤 User agencyId:', req.user.agencyId);

        const project = await Project.findById(projectId).populate('assignments.agency');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const assignment = project.assignments[assignmentIndex];
        
        // Fix: Handle both populated and non-populated agency
        const assignmentAgencyId = assignment.agency._id || assignment.agency;
        
        console.log('🏢 Assignment agencyId:', assignmentAgencyId.toString());
        console.log('✅ Match:', assignmentAgencyId.toString() === req.user.agencyId.toString());

        if (assignmentAgencyId.toString() !== req.user.agencyId.toString()) {
            console.error('❌ Authorization failed - Agency mismatch');
            return res.status(403).json({ message: 'Not authorized' });
        }

        const milestone = assignment.checklist[checklistIndex];
        
        if (!proofImages || proofImages.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one proof image' });
        }

        milestone.proofImages = proofImages;
        milestone.status = 'Pending Review';
        milestone.submittedAt = new Date();

        await project.save();

        // Send email to state officer
        const stateOfficer = await User.findOne({
            role: 'StateOfficer',
            state: project.state,
            isActive: true
        });

        if (stateOfficer) {
            const emailContent = emailTemplates.milestoneSubmitted(
                project.name,
                milestone.text,
                assignment.agency.name,
                project._id
            );

            try {
                await sendEmail({
                    to: stateOfficer.email,
                    subject: emailContent.subject,
                    html: emailContent.html
                });

                await CommunicationLog.create({
                    type: 'email',
                    event: 'milestone_submitted',
                    project: project._id,
                    sender: req.user._id,
                    recipient: {
                        email: stateOfficer.email,
                        userId: stateOfficer._id
                    },
                    subject: emailContent.subject,
                    status: 'sent',
                    sentAt: new Date()
                });
            } catch (emailError) {
                console.error('Email failed:', emailError);
            }
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('❌ Failed to submit milestone:', error);
        res.status(400).json({ message: "Failed to submit milestone", error: error.message });
    }
};

// @desc   Review milestone (approve/reject) - State Officer only
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/review
const reviewMilestone = asyncHandler(async (req, res) => {
    const { projectId, assignmentIndex, checklistIndex } = req.params;
    const { action, comments } = req.body;

    if (req.user.role !== 'StateOfficer') {
        res.status(403);
        throw new Error('Only state officers can review');
    }

    const project = await Project.findById(projectId).populate('assignments.agency');

    if (!project || project.state !== req.user.state) {
        res.status(403);
        throw new Error('Not authorized for this project');
    }

    const assignment = project.assignments[assignmentIndex];
    const milestone = assignment.checklist[checklistIndex];

    if (milestone.status !== 'Pending Review') {
        res.status(400);
        throw new Error('This milestone is not pending review.');
    }

    milestone.reviewedAt = new Date();
    milestone.reviewedBy = req.user._id;
    milestone.reviewComments = comments;

    if (action === 'approve') {
        milestone.status = 'Approved';
        milestone.completed = true;
    } else if (action === 'reject') {
        milestone.status = 'Rejected';
        milestone.completed = false;
    } else {
        res.status(400);
        throw new Error('Invalid action. Must be "approve" or "reject".');
    }
    
    // Recalculate project progress based on ALL assignments
    let totalMilestones = 0;
    let completedMilestones = 0;
    project.assignments.forEach(ass => {
        totalMilestones += ass.checklist.length;
        completedMilestones += ass.checklist.filter(item => item.completed).length;
    });

    if (totalMilestones > 0) {
        project.progress = Math.round((completedMilestones / totalMilestones) * 100);
    }

    if (project.progress === 100) {
        project.status = 'Completed';
    } else if (project.progress > 0) {
        project.status = 'On Track';
    }

    await project.save();

    // --- 2. ALERT CREATION LOGIC ADDED ---
    // Create an in-app alert for the submitting agency
    await Alert.create({
        type: 'milestone_reviewed',
        severity: 'info',
        project: project._id,
        agency: assignment.agency._id,
        message: `Your milestone "${milestone.text}" for "${project.name}" was ${milestone.status}. ${comments || ''}`,
        metadata: { status: milestone.status, comments: comments }
    });

    // Send email to agency
    const agencyUser = await User.findOne({
        role: 'ExecutingAgency',
        agencyId: assignment.agency._id,
        isActive: true
    });

    if (agencyUser) {
        const emailContent = emailTemplates.milestoneReviewed(
            project.name,
            milestone.text,
            action === 'approve',
            comments,
            project._id
        );

        try {
            await sendEmail({ to: agencyUser.email, ...emailContent });

            await CommunicationLog.create({
                type: 'email',
                event: 'milestone_reviewed',
                project: project._id,
                sender: req.user._id,
                recipient: {
                    email: agencyUser.email,
                    userId: agencyUser._id
                },
                subject: emailContent.subject,
                status: 'sent',
                metadata: { action, milestone: milestone.text },
                sentAt: new Date()
            });
        } catch (emailError) {
            console.error('Email failed:', emailError);
        }
    }

    res.status(200).json(project);
});

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

const getProjectLocations = asyncHandler(async (req, res) => {
    const projects = await Project.find({ 'location.coordinates': { $exists: true, $ne: [] } })
        .select('name status component location budget progress state');

    res.json(projects);
});

const getProjectLocationsForState = asyncHandler(async (req, res) => {
    const projects = await Project.find({ 
        state: req.user.state, // Filter by the user's state
        'location.coordinates': { $exists: true, $ne: [] } 
    }).select('name status component location budget progress district'); // Added district for filtering

    res.json(projects);
});

// Export ALL functions
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
    getProjectLocationsForState
};