// Backend/controllers/projectController.js
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import Agency from '../models/agencyModel.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';
import { generateProjectApprovalPDF, generateAssignmentOrderPDF } from '../utils/pdfService.js';
import CommunicationLog from '../models/communicationLogModel.js';

// @desc   Create a new project
// @route  POST /api/projects
const createProject = async (req, res) => {
    try {
        console.log('📝 Creating project with data:', req.body);
        
        const project = new Project({ ...req.body, createdBy: req.user._id });
        const createdProject = await project.save();
        
        console.log('✅ Project created:', createdProject._id);

        // Generate PDF
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
            path: 'assignments',
            populate: { path: 'agency', select: 'name' }
        });

        if (project) {
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

        const project = await Project.findById(projectId).populate('assignments.agency');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const assignment = project.assignments[assignmentIndex];
        if (assignment.agency._id.toString() !== req.user.agencyId.toString()) {
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
        res.status(400).json({ message: "Failed to submit milestone", error: error.message });
    }
};

// @desc   Review milestone (approve/reject) - State Officer only
// @route  PUT /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/review
const reviewMilestone = async (req, res) => {
    try {
        const { projectId, assignmentIndex, checklistIndex } = req.params;
        const { action, comments } = req.body;

        if (req.user.role !== 'StateOfficer') {
            return res.status(403).json({ message: 'Only state officers can review' });
        }

        const project = await Project.findById(projectId).populate('assignments.agency');

        if (!project || project.state !== req.user.state) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const assignment = project.assignments[assignmentIndex];
        const milestone = assignment.checklist[checklistIndex];

        if (milestone.status !== 'Pending Review') {
            return res.status(400).json({ message: 'Not pending review' });
        }

        milestone.reviewedAt = new Date();
        milestone.reviewedBy = req.user._id;
        milestone.reviewComments = comments;

        if (action === 'approve') {
            milestone.status = 'Approved';
            milestone.completed = true;

            const completedCount = assignment.checklist.filter(item => item.completed).length;
            project.progress = Math.round((completedCount / assignment.checklist.length) * 100);

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
                await sendEmail({
                    to: agencyUser.email,
                    subject: emailContent.subject,
                    html: emailContent.html
                });

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
    getProjectsWithPendingReviews
};