// Backend/services/alertService.js (Complete Fixed Version)

import Project from '../models/projectModel.js';
import Alert from '../models/alertModel.js';
import User from '../models/userModel.js';

class AlertService {
    
    // Helper function to get base alert type (remove ALL escalation prefixes)
    getBaseAlertType(alertType) {
        // Keep removing prefixes until none are left
        let cleanType = alertType;
        let previousType = '';
        
        while (cleanType !== previousType) {
            previousType = cleanType;
            cleanType = cleanType
                .replace(/^admin_escalated_/, '')
                .replace(/^escalated_/, '');
        }
        
        return cleanType;
    }
    
    // Calculate expected progress based on timeline
    calculateExpectedProgress(project) {
        if (!project.startDate || !project.endDate) return null;
        
        const now = new Date();
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const elapsedDays = (now - start) / (1000 * 60 * 60 * 24);
        
        return Math.round((elapsedDays / totalDays) * 100);
    }
    
    // Get days since last activity
    getDaysSinceLastActivity(project) {
        let lastActivityDate = new Date(project.updatedAt);
        
        project.assignments?.forEach(assignment => {
            assignment.checklist?.forEach(milestone => {
                if (milestone.submittedAt && new Date(milestone.submittedAt) > lastActivityDate) {
                    lastActivityDate = new Date(milestone.submittedAt);
                }
                if (milestone.reviewedAt && new Date(milestone.reviewedAt) > lastActivityDate) {
                    lastActivityDate = new Date(milestone.reviewedAt);
                }
            });
        });
        
        const daysSince = (Date.now() - lastActivityDate) / (1000 * 60 * 60 * 24);
        return Math.floor(daysSince);
    }
    
    // Calculate rejection rate for an agency
    calculateRejectionRate(assignment) {
        const submitted = assignment.checklist?.filter(m => m.status !== 'Not Started') || [];
        if (submitted.length === 0) return 0;
        
        const rejected = assignment.checklist?.filter(m => m.status === 'Rejected') || [];
        return (rejected.length / submitted.length) * 100;
    }
    
    // Get consecutive rejections count
    getConsecutiveRejections(assignment) {
        let count = 0;
        const milestones = assignment.checklist || [];
        
        for (let i = milestones.length - 1; i >= 0; i--) {
            if (milestones[i].status === 'Rejected') {
                count++;
            } else if (milestones[i].status !== 'Not Started') {
                break;
            }
        }
        return count;
    }
    
    // Check for pending reviews older than threshold
    getOldestPendingReview(project) {
        let oldestDays = 0;
        
        project.assignments?.forEach(assignment => {
            assignment.checklist?.forEach(milestone => {
                if (milestone.status === 'Pending Review' && milestone.submittedAt) {
                    const daysPending = (Date.now() - new Date(milestone.submittedAt)) / (1000 * 60 * 60 * 24);
                    if (daysPending > oldestDays) {
                        oldestDays = daysPending;
                    }
                }
            });
        });
        
        return Math.floor(oldestDays);
    }
    
    // Main evaluation function
    async evaluateProject(project) {
        const alerts = [];
        const now = new Date();

        const stateOfficer = await User.findOne({ role: 'StateOfficer', state: project.state, isActive: true });
        const admins = await User.find({ role: 'CentralAdmin', isActive: true });

        if (project.status === 'Completed') return alerts;

        // PROJECT-LEVEL ALERTS
        if (project.endDate && stateOfficer) {
            const daysUntilDeadline = (new Date(project.endDate) - now) / (1000 * 60 * 60 * 24);
            if (daysUntilDeadline <= 7 && daysUntilDeadline > 0 && project.progress < 80) {
                alerts.push({
                    recipient: stateOfficer._id,
                    type: 'deadline_approaching',
                    severity: 'critical',
                    project: project._id,
                    message: `Project "${project.name}" deadline is in ${Math.floor(daysUntilDeadline)} days but it is only ${project.progress}% complete.`,
                });
            }
        }

        const daysSinceActivity = this.getDaysSinceLastActivity(project);
        if (daysSinceActivity >= 14 && stateOfficer) {
           alerts.push({
                recipient: stateOfficer._id,
                type: 'inactive_project',
                severity: 'critical',
                project: project._id,
                message: `Project "${project.name}" has had no activity for ${daysSinceActivity} days.`,
            });
        }

        const oldestReviewDays = this.getOldestPendingReview(project);
        if (oldestReviewDays > 3) {
            admins.forEach(admin => {
                alerts.push({
                    recipient: admin._id,
                    type: 'slow_review',
                    severity: oldestReviewDays > 7 ? 'critical' : 'warning',
                    project: project._id,
                    message: `The State Officer for ${project.state} has a milestone pending review for ${oldestReviewDays} days on project "${project.name}".`,
                });
            });
        }

        // ASSIGNMENT-LEVEL ALERTS
        for (const assignment of project.assignments || []) {
            const agencyUser = await User.findOne({ agencyId: assignment.agency._id, isActive: true });
            
            const expectedProgress = this.calculateExpectedProgress(project);
            if (expectedProgress !== null && project.progress < (expectedProgress - 15) && stateOfficer) {
                const gap = expectedProgress - project.progress;
                alerts.push({
                    recipient: stateOfficer._id,
                    type: 'behind_schedule',
                    severity: gap > 30 ? 'critical' : 'warning',
                    project: project._id,
                    agency: assignment.agency._id,
                    message: `Project "${project.name}" (Agency: ${assignment.agency.name}) is ${gap}% behind schedule.`,
                });
            }
            
            if (stateOfficer) {
                const rejectionRate = this.calculateRejectionRate(assignment);
                if (rejectionRate > 40) {
                    alerts.push({
                        recipient: stateOfficer._id,
                        type: 'high_rejection_rate',
                        severity: 'warning',
                        project: project._id,
                        agency: assignment.agency._id,
                        message: `Agency "${assignment.agency?.name}" has a ${rejectionRate.toFixed(0)}% rejection rate on "${project.name}".`,
                    });
                }

                const consecutiveRejections = this.getConsecutiveRejections(assignment);
                if (consecutiveRejections >= 2) {
                     alerts.push({
                        recipient: stateOfficer._id,
                        type: 'consecutive_rejections',
                        severity: 'critical',
                        project: project._id,
                        agency: assignment.agency._id,
                        message: `Agency "${assignment.agency.name}" has ${consecutiveRejections} consecutive rejections on "${project.name}".`,
                    });
                }
            }
            
            if (agencyUser) {
                (assignment.checklist || []).forEach(milestone => {
                    if (milestone.dueDate && !['Approved', 'Completed'].includes(milestone.status)) {
                        const daysUntilDue = (new Date(milestone.dueDate) - now) / (1000 * 60 * 60 * 24);

                        if (daysUntilDue > 0 && daysUntilDue <= 3) {
                            alerts.push({
                                recipient: agencyUser._id,
                                type: 'milestone_due_soon',
                                severity: 'warning',
                                project: project._id,
                                agency: assignment.agency._id,
                                message: `Milestone "${milestone.text}" for "${project.name}" is due in ${Math.ceil(daysUntilDue)} day(s).`,
                            });
                        } else if (daysUntilDue < 0) {
                            alerts.push({
                                recipient: agencyUser._id,
                                type: 'milestone_overdue',
                                severity: 'critical',
                                project: project._id,
                                agency: assignment.agency._id,
                                message: `Milestone "${milestone.text}" for "${project.name}" is overdue.`,
                            });
                        }
                    }
                });
            }
        }
        
        return alerts;
    }
    
    // Process all active projects
    async generateAllAlerts() {
        try {
            console.log('🔍 Starting automatic status update and alert generation...');
            
            const projects = await Project.find({
                status: { $in: ['On Track', 'Delayed', 'Pending Approval'] }
            }).populate('assignments.agency');
            
            console.log(`📊 Evaluating ${projects.length} active projects...`);
            
            let totalNewAlerts = 0;
            let statusChanges = 0;

            for (const project of projects) {
                const originalStatus = project.status;
                const expectedProgress = this.calculateExpectedProgress(project);
                let isBehindSchedule = false;

                if (expectedProgress !== null && project.progress < (expectedProgress - 15)) {
                    isBehindSchedule = true;
                }

                if (isBehindSchedule) {
                    if (project.status !== 'Delayed') {
                        project.status = 'Delayed';
                        console.log(`❗ Status Change: "${project.name}" is now marked as Delayed.`);
                    }
                } else {
                    if (project.status === 'Delayed') {
                        project.status = 'On Track';
                        console.log(`✅ Status Change: "${project.name}" is now back On Track.`);
                    }
                }
                
                if (project.status !== originalStatus) {
                    await project.save();
                    statusChanges++;
                }

                const alertsToCreate = await this.evaluateProject(project);
                
                for (const alertData of alertsToCreate) {
                    const existingAlert = await Alert.findOne({
                        type: alertData.type,
                        project: alertData.project,
                        acknowledged: false,
                        autoResolved: false,
                    });
                    
                    if (!existingAlert) {
                        await Alert.create(alertData);
                        totalNewAlerts++;
                        console.log(`⚠️  New ${alertData.severity} alert: ${alertData.type} for project "${project.name}"`);
                    }
                }
            }
            
            await this.autoResolveAlerts();
            console.log(`✅ Process complete. ${statusChanges} status changes made. ${totalNewAlerts} new alerts created.`);
            
        } catch (error) {
            console.error('❌ Automatic status update/alert generation failed:', error);
            throw error;
        }
    }

    // FIXED ESCALATION ENGINE
    async escalateOldAlerts() {
        try {
            console.log('⚙️  Running escalation engine...');
            
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
            
            let agencyEscalations = 0;
            let stateEscalations = 0;

            // 1. Escalate agency alerts to state officers
            const agencyAlertsToEscalate = await Alert.find({
                escalationLevel: 0,
                acknowledged: false,
                autoResolved: false,
                agency: { $exists: true },
                createdAt: { $lt: twoDaysAgo },
                type: { $not: /^(escalated_|admin_escalated_)/ }  // Only original alerts
            }).populate('project', 'name state').populate('agency', 'name');

            for (const alert of agencyAlertsToEscalate) {
                if (!alert.project?.state) {
                    console.log(`⚠️  Skipping escalation for alert ${alert._id} - no state information`);
                    continue;
                }

                const stateOfficer = await User.findOne({ 
                    role: 'StateOfficer', 
                    state: alert.project.state,
                    isActive: true 
                });
                
                if (stateOfficer) {
                    // Get clean base type using the method
                    const baseType = this.getBaseAlertType(alert.type);
                    
                    const existingEscalation = await Alert.findOne({
                        recipient: stateOfficer._id,
                        project: alert.project._id,
                        type: `escalated_${baseType}`,
                        escalationLevel: 1,
                        acknowledged: false
                    });

                    if (!existingEscalation) {
                        await Alert.create({
                            recipient: stateOfficer._id,
                            escalationLevel: 1,
                            type: `escalated_${baseType}`,
                            severity: 'critical',
                            project: alert.project._id,
                            agency: alert.agency._id,
                            message: `ESCALATION: Agency "${alert.agency.name}" has not acknowledged a '${baseType}' alert for project "${alert.project.name}" for over 2 days. Intervention required.`,
                            metadata: {
                                originalAlertId: alert._id,
                                originalAlertType: alert.type,
                                daysSinceOriginalAlert: Math.floor((Date.now() - alert.createdAt) / (1000 * 60 * 60 * 24))
                            }
                        });
                        
                        alert.escalationLevel = 1;
                        await alert.save();
                        agencyEscalations++;
                        console.log(`📤 Escalated agency alert ${alert._id} (${baseType}) to state officer ${stateOfficer.email}`);
                    }
                } else {
                    console.log(`⚠️  No state officer found for state: ${alert.project.state}`);
                }
            }
            
            // 2. Escalate state alerts to admins (FIXED)
            const stateAlertsToEscalate = await Alert.find({
                escalationLevel: 1,
                acknowledged: false,
                autoResolved: false,
                createdAt: { $lt: fiveDaysAgo },
                type: /^escalated_/  // Only escalated (but not admin escalated) alerts
            }).populate('project', 'name state').populate('agency', 'name');

            const admins = await User.find({ role: 'CentralAdmin', isActive: true });
            
            if (admins.length === 0) {
                console.log('⚠️  No central admins found for escalation');
            }
            
            for (const alert of stateAlertsToEscalate) {
                // Extract clean base type using the method (removes ALL prefixes)
                const baseType = this.getBaseAlertType(alert.type);
                
                for (const admin of admins) {
                    const existingAdminEscalation = await Alert.findOne({
                        recipient: admin._id,
                        project: alert.project._id,
                        type: `admin_escalated_${baseType}`,
                        escalationLevel: 2,
                        acknowledged: false
                    });

                    if (!existingAdminEscalation) {
                        await Alert.create({
                            recipient: admin._id,
                            escalationLevel: 2,
                            type: `admin_escalated_${baseType}`,  // This will now be correct
                            severity: 'critical',
                            project: alert.project._id,
                            agency: alert.agency,
                            message: `ADMIN ESCALATION: A critical '${baseType}' issue for project "${alert.project.name}" in ${alert.project.state} has been unaddressed for over 5 days. High-level oversight needed.`,
                            metadata: {
                                originalAlertId: alert._id,
                                originalAlertType: alert.type,
                                daysSinceOriginalAlert: Math.floor((Date.now() - alert.createdAt) / (1000 * 60 * 60 * 24)),
                                state: alert.project.state
                            }
                        });
                        
                        stateEscalations++;
                        console.log(`📤 Escalated state alert ${alert._id} (${alert.type} → admin_escalated_${baseType}) to admin ${admin.email}`);
                    }
                }
                
                alert.escalationLevel = 2;
                await alert.save();
            }
            
            console.log(`✅ Escalation engine finished. Agency→State: ${agencyEscalations}, State→Admin: ${stateEscalations}`);
            
        } catch (error) {
            console.error('❌ Escalation engine failed:', error);
            throw error;
        }
    }
    
    // Auto-resolve alerts when conditions are fixed
    async autoResolveAlerts() {
        try {
            const unresolvedAlerts = await Alert.find({
                acknowledged: false,
                autoResolved: false,
                type: { $regex: /^(?!escalated_|admin_escalated_)/ }
            }).populate('project');
            
            let resolvedCount = 0;
            
            for (const alert of unresolvedAlerts) {
                let shouldResolve = false;
                
                switch (this.getBaseAlertType(alert.type)) {
                    case 'inactive_project':
                        const daysSince = this.getDaysSinceLastActivity(alert.project);
                        if (daysSince < 14) shouldResolve = true;
                        break;
                        
                    case 'slow_review':
                        const pendingDays = this.getOldestPendingReview(alert.project);
                        if (pendingDays < 3) shouldResolve = true;
                        break;
                        
                    case 'deadline_approaching':
                        if (alert.project.progress >= 80) shouldResolve = true;
                        break;
                        
                    case 'behind_schedule':
                        const expectedProgress = this.calculateExpectedProgress(alert.project);
                        if (expectedProgress !== null && alert.project.progress >= (expectedProgress - 10)) {
                            shouldResolve = true;
                        }
                        break;
                }
                
                if (shouldResolve) {
                    alert.autoResolved = true;
                    alert.resolvedAt = new Date();
                    await alert.save();
                    resolvedCount++;
                    console.log(`✅ Auto-resolved alert: ${alert.type} for ${alert.project.name}`);
                    
                    await Alert.updateMany({
                        'metadata.originalAlertId': alert._id,
                        acknowledged: false,
                        autoResolved: false
                    }, {
                        autoResolved: true,
                        resolvedAt: new Date()
                    });
                }
            }
            
            if (resolvedCount > 0) {
                console.log(`✅ Auto-resolved ${resolvedCount} alerts`);
            }
            
        } catch (error) {
            console.error('❌ Auto-resolve alerts failed:', error);
            throw error;
        }
    }
    
    async runNightlyJob() {
        try {
            console.log('🌙 Starting nightly job...');
            console.log('==================================');
            
            await this.generateAllAlerts();
            await this.escalateOldAlerts();
            
            console.log('==================================');
            console.log('🌙 Nightly job completed successfully');
            
            return {
                success: true,
                timestamp: new Date(),
                message: 'Nightly job completed successfully'
            };
            
        } catch (error) {
            console.error('❌ Nightly job failed:', error);
            return {
                success: false,
                timestamp: new Date(),
                error: error.message
            };
        }
    }
    
    async testEscalation() {
        console.log('🧪 Running test escalation...');
        await this.escalateOldAlerts();
    }
    
    async getEscalationStats() {
        try {
            const stats = {
                level0: await Alert.countDocuments({ escalationLevel: 0, acknowledged: false, autoResolved: false }),
                level1: await Alert.countDocuments({ escalationLevel: 1, acknowledged: false, autoResolved: false }),
                level2: await Alert.countDocuments({ escalationLevel: 2, acknowledged: false, autoResolved: false }),
                totalUnacknowledged: await Alert.countDocuments({ acknowledged: false, autoResolved: false }),
                totalAutoResolved: await Alert.countDocuments({ autoResolved: true })
            };
            
            return stats;
            
        } catch (error) {
            console.error('❌ Failed to get escalation stats:', error);
            throw error;
        }
    }
}

export default new AlertService();