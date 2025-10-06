// Backend/utils/alertService.js
import Project from '../models/projectModel.js';
import Alert from '../models/alertModel.js';

class AlertService {
    // Calculate expected progress based on timeline
    calculateExpectedProgress(startDate, endDate) {
        if (!startDate || !endDate) return null;
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const daysPassed = (now - start) / (1000 * 60 * 60 * 24);
        
        return Math.round((daysPassed / totalDays) * 100);
    }

    // Calculate days since last activity
    getLastActivityDate(project) {
        let lastActivity = project.createdAt;
        
        project.assignments.forEach(assignment => {
            assignment.checklist.forEach(milestone => {
                if (milestone.submittedAt && new Date(milestone.submittedAt) > lastActivity) {
                    lastActivity = new Date(milestone.submittedAt);
                }
                if (milestone.reviewedAt && new Date(milestone.reviewedAt) > lastActivity) {
                    lastActivity = new Date(milestone.reviewedAt);
                }
            });
        });
        
        return lastActivity;
    }

    // Calculate rejection rate for an agency
    calculateRejectionRate(assignment) {
        const submitted = assignment.checklist.filter(m => 
            m.status === 'Approved' || m.status === 'Rejected'
        );
        
        if (submitted.length === 0) return 0;
        
        const rejected = assignment.checklist.filter(m => m.status === 'Rejected').length;
        return Math.round((rejected / submitted.length) * 100);
    }

    // Check for consecutive rejections
    getConsecutiveRejections(assignment) {
        let consecutive = 0;
        const sortedMilestones = assignment.checklist
            .filter(m => m.reviewedAt)
            .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
        
        for (const milestone of sortedMilestones) {
            if (milestone.status === 'Rejected') {
                consecutive++;
            } else {
                break;
            }
        }
        
        return consecutive;
    }

    // Get oldest pending review
    getOldestPendingReview(project) {
        let oldest = null;
        
        project.assignments.forEach(assignment => {
            assignment.checklist.forEach(milestone => {
                if (milestone.status === 'Pending Review' && milestone.submittedAt) {
                    if (!oldest || new Date(milestone.submittedAt) < new Date(oldest)) {
                        oldest = new Date(milestone.submittedAt);
                    }
                }
            });
        });
        
        return oldest;
    }

    // Calculate days since last milestone submission for agency
    getDaysSinceLastSubmission(assignment) {
        let lastSubmission = null;
        
        assignment.checklist.forEach(milestone => {
            if (milestone.submittedAt) {
                if (!lastSubmission || new Date(milestone.submittedAt) > new Date(lastSubmission)) {
                    lastSubmission = new Date(milestone.submittedAt);
                }
            }
        });
        
        if (!lastSubmission) return null;
        
        const now = new Date();
        const daysSince = (now - lastSubmission) / (1000 * 60 * 60 * 24);
        return Math.floor(daysSince);
    }

    // Generate alert message templates
    generateAlertMessage(type, data) {
        const messages = {
            deadline_approaching: `Project "${data.projectName}" deadline in ${data.daysRemaining} days but only ${data.progress}% complete. Immediate action required.`,
            behind_schedule: `Project "${data.projectName}" is ${data.gap}% behind schedule (expected ${data.expected}%, actual ${data.actual}%).`,
            no_activity: `Project "${data.projectName}" has had no activity for ${data.days} days. Contact agency urgently.`,
            consecutive_rejections: `${data.consecutiveCount} consecutive milestone rejections for ${data.agencyName} on project "${data.projectName}". Quality review needed.`,
            inactive_agency: `Agency "${data.agencyName}" has not submitted milestones for ${data.days} days on project "${data.projectName}".`,
            review_pending: `State officer review pending for ${data.days} days on project "${data.projectName}". Please review submission.`,
            high_rejection_rate: `High rejection rate (${data.rate}%) for agency "${data.agencyName}" on project "${data.projectName}".`,
            budget_concern: `${data.budgetPercent}% budget allocated to project "${data.projectName}" but only ${data.progress}% progress.`,
            
            // --- NEW MESSAGE TEMPLATES ---
            milestone_due_soon: `Milestone "${data.milestoneName}" on project "${data.projectName}" is due in ${data.days} day(s).`,
            milestone_overdue: `Milestone "${data.milestoneName}" on project "${data.projectName}" is overdue by ${data.days} day(s).`
        };
        
        return messages[type] || 'Alert requires attention';
    }

    // Evaluate all alert rules for a project
    async evaluateProjectAlerts(project) {
        const alerts = [];
        const now = new Date();
        
        // --- Project-level checks ---
        const daysToDeadline = project.endDate ? (new Date(project.endDate) - now) / (1000 * 60 * 60 * 24) : null;
        const expectedProgress = this.calculateExpectedProgress(project.startDate, project.endDate);
        const progressGap = expectedProgress ? expectedProgress - project.progress : 0;
        const lastActivity = this.getLastActivityDate(project);
        const daysSinceActivity = (now - lastActivity) / (1000 * 60 * 60 * 24);
        const totalAllocated = project.assignments.reduce((sum, a) => sum + (a.allocatedFunds || 0), 0);
        const budgetPercent = project.budget > 0 ? Math.round((totalAllocated / project.budget) * 100) : 0;
        const oldestReview = this.getOldestPendingReview(project);

        // CRITICAL ALERTS
        
        // 1. Deadline approaching with low progress
        if (daysToDeadline !== null && daysToDeadline < 7 && daysToDeadline > 0 && project.progress < 80) {
            alerts.push({
                alertType: 'deadline_approaching',
                severity: 'critical',
                message: this.generateAlertMessage('deadline_approaching', {
                    projectName: project.name,
                    daysRemaining: Math.ceil(daysToDeadline),
                    progress: project.progress
                }),
                metadata: { daysToDeadline: Math.ceil(daysToDeadline), progress: project.progress }
            });
        }

        // 2. No activity for 14+ days
        if (daysSinceActivity >= 14) {
            alerts.push({
                alertType: 'no_activity',
                severity: 'critical',
                message: this.generateAlertMessage('no_activity', {
                    projectName: project.name,
                    days: Math.floor(daysSinceActivity)
                }),
                metadata: { daysSinceActivity: Math.floor(daysSinceActivity) }
            });
        }

        // 3. Budget exhausted but progress incomplete
        if (budgetPercent >= 100 && project.progress < 100) {
            alerts.push({
                alertType: 'budget_concern',
                severity: 'critical',
                message: this.generateAlertMessage('budget_concern', {
                    projectName: project.name,
                    budgetPercent: 100,
                    progress: project.progress
                }),
                metadata: { budgetPercent: 100, progress: project.progress }
            });
        }

        // 4. Behind schedule by 30%+
        if (progressGap > 30) {
            alerts.push({
                alertType: 'behind_schedule',
                severity: 'critical',
                message: this.generateAlertMessage('behind_schedule', {
                    projectName: project.name,
                    gap: Math.round(progressGap),
                    expected: expectedProgress,
                    actual: project.progress
                }),
                metadata: { expectedProgress, actualProgress: project.progress, gap: progressGap }
            });
        }

        // WARNING ALERTS

        // 5. Behind schedule by 15-30%
        if (progressGap >= 15 && progressGap <= 30) {
            alerts.push({
                alertType: 'behind_schedule',
                severity: 'warning',
                message: this.generateAlertMessage('behind_schedule', {
                    projectName: project.name,
                    gap: Math.round(progressGap),
                    expected: expectedProgress,
                    actual: project.progress
                }),
                metadata: { expectedProgress, actualProgress: project.progress, gap: progressGap }
            });
        }

        // 6. Budget concern (70% spent, 40% progress)
        if (budgetPercent >= 70 && project.progress <= 40) {
            alerts.push({
                alertType: 'budget_concern',
                severity: 'warning',
                message: this.generateAlertMessage('budget_concern', {
                    projectName: project.name,
                    budgetPercent,
                    progress: project.progress
                }),
                metadata: { budgetPercent, progress: project.progress }
            });
        }

        // 7. Review pending for 72+ hours
        if (oldestReview) {
            const hoursPending = (now - oldestReview) / (1000 * 60 * 60);
            if (hoursPending >= 72) {
                alerts.push({
                    alertType: 'review_pending',
                    severity: 'warning',
                    message: this.generateAlertMessage('review_pending', {
                        projectName: project.name,
                        days: Math.floor(hoursPending / 24)
                    }),
                    metadata: { hoursPending: Math.round(hoursPending) }
                });
            }
        }

        // --- Agency-specific alerts ---
        for (const assignment of project.assignments) {
            const agencyName = assignment.agency?.name || 'Unknown Agency';

            // 8. Consecutive rejections
            const consecutiveRejections = this.getConsecutiveRejections(assignment);
            if (consecutiveRejections >= 3) {
                alerts.push({
                    alertType: 'consecutive_rejections',
                    severity: 'critical',
                    agency: assignment.agency?._id,
                    message: this.generateAlertMessage('consecutive_rejections', {
                        projectName: project.name,
                        agencyName,
                        consecutiveCount: consecutiveRejections
                    }),
                    metadata: { consecutiveRejections, agencyName }
                });
            }

            // 9. High rejection rate
            const rejectionRate = this.calculateRejectionRate(assignment);
            if (rejectionRate >= 40) {
                alerts.push({
                    alertType: 'high_rejection_rate',
                    severity: 'warning',
                    agency: assignment.agency?._id,
                    message: this.generateAlertMessage('high_rejection_rate', {
                        projectName: project.name,
                        agencyName,
                        rate: rejectionRate
                    }),
                    metadata: { rejectionRate, agencyName }
                });
            }

            // 10. Agency inactive (no submission in 10+ days)
            const daysSinceSubmission = this.getDaysSinceLastSubmission(assignment);
            if (daysSinceSubmission !== null && daysSinceSubmission >= 10) {
                alerts.push({
                    alertType: 'inactive_agency',
                    severity: 'warning',
                    agency: assignment.agency?._id,
                    message: this.generateAlertMessage('inactive_agency', {
                        projectName: project.name,
                        agencyName,
                        days: daysSinceSubmission
                    }),
                    metadata: { daysSinceSubmission, agencyName }
                });
            }

            // --- NEW AGENCY-SPECIFIC ALERTS (Milestone Deadlines) ---
            for (const milestone of assignment.checklist) {
                // Check only if milestone has a due date and is not yet approved
                if (milestone.dueDate && milestone.status !== 'Approved') {
                    const daysUntilDue = (new Date(milestone.dueDate) - now) / (1000 * 60 * 60 * 24);

                    // 11. Milestone is due in 3 days or less
                    if (daysUntilDue > 0 && daysUntilDue <= 3) {
                        alerts.push({
                            alertType: 'milestone_due_soon',
                            severity: 'warning',
                            agency: assignment.agency?._id,
                            message: this.generateAlertMessage('milestone_due_soon', {
                                projectName: project.name,
                                milestoneName: milestone.text,
                                days: Math.ceil(daysUntilDue)
                            }),
                            metadata: { milestoneId: milestone._id, milestoneName: milestone.text }
                        });
                    }
                    
                    // 12. Milestone is overdue
                    if (daysUntilDue < 0) {
                        alerts.push({
                            alertType: 'milestone_overdue',
                            severity: 'critical',
                            agency: assignment.agency?._id,
                            message: this.generateAlertMessage('milestone_overdue', {
                                projectName: project.name,
                                milestoneName: milestone.text,
                                days: Math.abs(Math.floor(daysUntilDue))
                            }),
                            metadata: { milestoneId: milestone._id, milestoneName: milestone.text }
                        });
                    }
                }
            }
        }

        return alerts;
    }

    // Main function to generate all alerts
    async generateAllAlerts() {
        try {
            console.log('🔍 Starting alert generation...');
            
            const projects = await Project.find({
                status: { $in: ['On Track', 'Delayed', 'Pending Approval'] }
            }).populate('assignments.agency');

            let totalAlertsCreated = 0;

            for (const project of projects) {
                const alerts = await this.evaluateProjectAlerts(project);

                for (const alertData of alerts) {
                    // Check if a similar alert already exists to avoid duplicates
                    const existingQuery = {
                        project: project._id,
                        alertType: alertData.alertType,
                        autoResolved: false,
                        acknowledged: false,
                    };
                    if (alertData.agency) existingQuery.agency = alertData.agency;
                    if (alertData.metadata?.milestoneId) existingQuery['metadata.milestoneId'] = alertData.metadata.milestoneId;
                    
                    const existingAlert = await Alert.findOne(existingQuery);

                    if (!existingAlert) {
                        await Alert.create({
                            ...alertData,
                            project: project._id,
                            state: project.state
                        });
                        totalAlertsCreated++;
                    }
                }

                await this.autoResolveAlerts(project);
            }

            console.log(`✅ Alert generation complete. Created ${totalAlertsCreated} new alerts.`);
            return { success: true, alertsCreated: totalAlertsCreated };
        } catch (error) {
            console.error('❌ Alert generation failed:', error);
            throw error;
        }
    }

    // Auto-resolve alerts when conditions are fixed
    async autoResolveAlerts(project) {
        const now = new Date();
        
        const unresolvedAlerts = await Alert.find({
            project: project._id,
            autoResolved: false
        });

        for (const alert of unresolvedAlerts) {
            let shouldResolve = false;

            switch (alert.alertType) {
                case 'deadline_approaching':
                    if (project.progress >= 80 || project.status === 'Completed') {
                        shouldResolve = true;
                    }
                    break;
                
                case 'behind_schedule':
                    const expected = this.calculateExpectedProgress(project.startDate, project.endDate);
                    if (expected && (expected - project.progress) < 15) {
                        shouldResolve = true;
                    }
                    break;
                
                case 'no_activity':
                    if ((now - this.getLastActivityDate(project)) / (1000 * 60 * 60 * 24) < 14) {
                        shouldResolve = true;
                    }
                    break;
                
                case 'review_pending':
                    if (!this.getOldestPendingReview(project)) {
                        shouldResolve = true;
                    }
                    break;
                
                // --- NEW AUTO-RESOLVE LOGIC ---
                case 'milestone_due_soon':
                case 'milestone_overdue':
                    const milestone = project.assignments
                        .flatMap(a => a.checklist)
                        .find(m => m._id.equals(alert.metadata.milestoneId));
                    if (!milestone || milestone.status === 'Approved') {
                        shouldResolve = true;
                    }
                    break;
            }

            if (shouldResolve) {
                alert.autoResolved = true;
                alert.resolvedAt = now;
                await alert.save();
            }
        }
    }
}

export default new AlertService();