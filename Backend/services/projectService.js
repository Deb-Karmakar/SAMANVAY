import projectRepository from '../repositories/projectRepository.js';
import User from '../models/userModel.js';
import Agency from '../models/agencyModel.js';
import Alert from '../models/alertModel.js';
import CommunicationLog from '../models/communicationLogModel.js';
import { sendEmail, emailTemplates } from './emailService.js';
import { generateProjectApprovalPDF, generateAssignmentOrderPDF } from './pdfService.js';
import { getCoordsForProject } from '../utils/geocoder.js';

class ProjectService {
    async createProject(projectData, user) {
        projectData.createdBy = user._id;

        // Geocoding logic
        if (projectData.district && projectData.state) {
            const location = getCoordsForProject(projectData.district, projectData.state);
            if (location) {
                projectData.location = location;
            }
        }

        const createdProject = await projectRepository.create(projectData);

        // PDF Generation
        const pdfResult = await generateProjectApprovalPDF(createdProject);

        // Notify State Officer
        const stateOfficer = await User.findOne({ 
            role: 'StateOfficer', 
            state: createdProject.state,
            isActive: true
        });

        if (stateOfficer) {
            const emailContent = emailTemplates.projectCreated(
                createdProject.name,
                createdProject.state,
                createdProject._id
            );

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

                await CommunicationLog.create({
                    type: 'email',
                    event: 'project_created',
                    project: createdProject._id,
                    sender: user._id,
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
                console.error('Email sending failed:', emailError);
                await CommunicationLog.create({
                    type: 'email',
                    event: 'project_created',
                    project: createdProject._id,
                    sender: user._id,
                    recipient: { email: stateOfficer.email },
                    status: 'failed',
                    error: emailError.message
                });
            }
        }
        
        return { project: createdProject, pdf: pdfResult };
    }

    async getProjects() {
        return await projectRepository.findAllPopulated();
    }

    async getMyStateProjects(state) {
        return await projectRepository.findByStatePopulated(state);
    }

    async getProjectById(projectId, user) {
        const project = await projectRepository.findByIdPopulated(projectId);
        
        if (!project) {
            throw new Error('Project not found');
        }

        if (user.role === 'ExecutingAgency') {
            const relevantAssignment = project.assignments.find(
                assignment => assignment.agency._id.toString() === user.agencyId.toString()
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
                assignments: [relevantAssignment],
                createdAt: project.createdAt,
                updatedAt: project.updatedAt
            };
        }

        return project;
    }

    async assignAgency(projectId, assignments, user) {
        const project = await projectRepository.findById(projectId);
        
        if (!project) throw new Error('Project not found');
        
        if (user.role === 'StateOfficer' && project.state !== user.state) {
            throw new Error('Not authorized for this project');
        }
        
        project.assignments = assignments;
        project.status = 'On Track';
        
        return await projectRepository.save(project);
    }

    async addAssignmentsToProject(projectId, assignments, user) {
        const project = await projectRepository.findById(projectId);

        if (!project) throw new Error('Project not found');
        
        if (user.role === 'StateOfficer' && project.state !== user.state) {
            throw new Error('Not authorized');
        }

        const populatedAssignments = await Promise.all(
            assignments.map(async (assignment) => {
                const agency = await Agency.findById(assignment.agency);
                return { ...assignment, agencyDetails: agency };
            })
        );

        project.assignments.push(...assignments);
        const updatedProject = await projectRepository.save(project);

        const populatedProject = await projectRepository.findByIdPopulated(updatedProject._id);
        const pdfResult = await generateAssignmentOrderPDF(populatedProject, populatedProject.assignments.slice(-assignments.length));

        for (const assignment of populatedAssignments) {
            const agency = assignment.agencyDetails;
            
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
                        sender: user._id,
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

        return { project: updatedProject, pdf: pdfResult };
    }

    async getMyAgencyProjects(user) {
        if (user.role !== 'ExecutingAgency') throw new Error('Not authorized');

        const projects = await projectRepository.findByAgencyPopulated(user.agencyId);

        return projects.map(project => {
            const relevantAssignment = project.assignments.find(
                assignment => assignment.agency._id.toString() === user.agencyId.toString()
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
    }

    async submitMilestoneForReview(projectId, assignmentIndex, checklistIndex, proofImages, user) {
        const project = await projectRepository.findByIdPopulated(projectId);
        
        if (!project) throw new Error('Project not found');

        const assignment = project.assignments[assignmentIndex];
        const assignmentAgencyId = assignment.agency._id || assignment.agency;

        if (assignmentAgencyId.toString() !== user.agencyId.toString()) {
            throw new Error('Not authorized');
        }

        const milestone = assignment.checklist[checklistIndex];
        
        if (!proofImages || proofImages.length === 0) {
            throw new Error('Please upload at least one proof image');
        }

        milestone.proofImages = proofImages;
        milestone.status = 'Pending Review';
        milestone.submittedAt = new Date();

        await projectRepository.save(project);

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
                    sender: user._id,
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
        
        return project;
    }

    async reviewMilestone(projectId, assignmentIndex, checklistIndex, action, comments, user) {
        if (user.role !== 'StateOfficer') throw new Error('Only state officers can review');
        
        const project = await projectRepository.findByIdPopulated(projectId);
        
        if (!project || project.state !== user.state) throw new Error('Not authorized for this project');
        
        const aIndex = parseInt(assignmentIndex, 10);
        const cIndex = parseInt(checklistIndex, 10);

        const assignment = project.assignments[aIndex];
        if (!assignment) throw new Error('Assignment not found');

        const milestone = assignment.checklist[cIndex];
        if (!milestone) throw new Error('Milestone not found');

        if (milestone.status !== 'Pending Review') throw new Error('This milestone is not pending review.');

        milestone.reviewedAt = new Date();
        milestone.reviewedBy = user._id;
        milestone.reviewComments = comments;

        if (action === 'approve') {
            milestone.status = 'Approved';
            milestone.completed = true;
        } else if (action === 'reject') {
            milestone.status = 'Rejected';
            milestone.completed = false;
        } else {
            throw new Error('Invalid action. Must be "approve" or "reject".');
        }
        
        // Recalculate project progress
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

        await projectRepository.save(project);

        const agencyUser = await User.findOne({
            role: 'ExecutingAgency',
            agencyId: assignment.agency._id,
            isActive: true
        });

        if (agencyUser) {
            await Alert.create({
                recipient: agencyUser._id,
                type: 'milestone_reviewed',
                severity: 'info',
                project: project._id,
                agency: assignment.agency._id,
                message: `Your milestone "${milestone.text}" for "${project.name}" was ${milestone.status}. ${comments || ''}`,
                metadata: { status: milestone.status, comments: comments }
            });

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
                    sender: user._id,
                    recipient: { email: agencyUser.email, userId: agencyUser._id },
                    subject: emailContent.subject,
                    status: 'sent',
                    metadata: { action, milestone: milestone.text },
                    sentAt: new Date()
                });
            } catch (emailError) {
                console.error('Email failed during milestone review notification:', emailError);
            }
        }

        return project;
    }

    async getProjectsWithPendingReviews(user) {
        if (user.role !== 'StateOfficer') throw new Error('Not authorized');
        return await projectRepository.findPendingReviewsByState(user.state);
    }

    async getProjectLocations(user) {
        if (user.role !== 'Admin' && user.role !== 'CentralAdmin') {
            throw new Error('Only admins can view all project locations');
        }
        return await projectRepository.findLocations();
    }

    async getProjectLocationsForState(user) {
        return await projectRepository.findLocationsByState(user.state);
    }

    async getProjectLocationsForAgency(user) {
        if (user.role !== 'ExecutingAgency') throw new Error('Only executing agencies can view their project locations');
        if (!user.agencyId) throw new Error('Agency ID not found');

        const projects = await projectRepository.findLocationsByAgency(user.agencyId);

        return projects.map(project => {
            const relevantAssignment = project.assignments.find(
                assignment => assignment.agency._id.toString() === user.agencyId.toString()
            );
            
            return {
                _id: project._id,
                name: project.name,
                status: project.status,
                component: project.component,
                location: project.location,
                budget: project.budget,
                progress: project.progress,
                state: project.state,
                district: project.district,
                assignment: relevantAssignment
            };
        });
    }
}

export default new ProjectService();
