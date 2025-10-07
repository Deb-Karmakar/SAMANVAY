// Backend/services/alertService.js
import Project from '../models/projectModel.js';
import Alert from '../models/alertModel.js';

class AlertService {
    
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
        
        // Check all milestone submissions
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
        
        // Skip if project is completed
        if (project.status === 'Completed') return alerts;
        
        // 1. CRITICAL: Deadline approaching with low progress
        if (project.endDate) {
            const daysUntilDeadline = (new Date(project.endDate) - now) / (1000 * 60 * 60 * 24);
            
            if (daysUntilDeadline <= 7 && daysUntilDeadline > 0 && project.progress < 80) {
                alerts.push({
                    type: 'deadline_approaching',
                    severity: 'critical',
                    project: project._id,
                    message: `Project "${project.name}" deadline in ${Math.floor(daysUntilDeadline)} days but only ${project.progress}% complete. Immediate action required.`,
                    metadata: {
                        daysUntilDeadline: Math.floor(daysUntilDeadline),
                        currentProgress: project.progress
                    }
                });
            }
        }
        
        // 2. CRITICAL: No activity for 14+ days
        const daysSinceActivity = this.getDaysSinceLastActivity(project);
        if (daysSinceActivity >= 14) {
            alerts.push({
                type: 'inactive_project',
                severity: 'critical',
                project: project._id,
                message: `Project "${project.name}" has had no activity for ${daysSinceActivity} days. Contact agencies urgently.`,
                metadata: {
                    daysSinceActivity
                }
            });
        }
        
        // 3. WARNING: Behind schedule
        const expectedProgress = this.calculateExpectedProgress(project);
        if (expectedProgress !== null && project.progress < (expectedProgress - 15)) {
            const gap = expectedProgress - project.progress;
            alerts.push({
                type: 'behind_schedule',
                severity: gap > 30 ? 'critical' : 'warning',
                project: project._id,
                message: `Project "${project.name}" is ${gap}% behind schedule (expected ${expectedProgress}%, actual ${project.progress}%).`,
                metadata: {
                    expectedProgress,
                    actualProgress: project.progress,
                    gap
                }
            });
        }
        
        // 4. WARNING: Slow review times
        const oldestReviewDays = this.getOldestPendingReview(project);
        if (oldestReviewDays > 3) {
            alerts.push({
                type: 'slow_review',
                severity: oldestReviewDays > 7 ? 'critical' : 'warning',
                project: project._id,
                message: `Milestone submission pending review for ${oldestReviewDays} days on "${project.name}". Please review urgently.`,
                metadata: {
                    daysPending: oldestReviewDays
                }
            });
        }
        
        // 5. Agency-specific alerts
        project.assignments?.forEach(assignment => {
            // High rejection rate
            const rejectionRate = this.calculateRejectionRate(assignment);
            if (rejectionRate > 40 && assignment.checklist?.length >= 3) {
                alerts.push({
                    type: 'high_rejection_rate',
                    severity: 'warning',
                    project: project._id,
                    agency: assignment.agency._id || assignment.agency,
                    message: `Agency "${assignment.agency?.name || 'Unknown'}" has ${rejectionRate.toFixed(0)}% rejection rate on "${project.name}". Quality review needed.`,
                    metadata: {
                        rejectionRate,
                        agencyName: assignment.agency?.name
                    }
                });
            }
            
            // Consecutive rejections
            const consecutiveRejections = this.getConsecutiveRejections(assignment);
            if (consecutiveRejections >= 3) {
                alerts.push({
                    type: 'consecutive_rejections',
                    severity: 'critical',
                    project: project._id,
                    agency: assignment.agency._id || assignment.agency,
                    message: `Agency "${assignment.agency?.name || 'Unknown'}" has ${consecutiveRejections} consecutive milestone rejections on "${project.name}". Intervention required.`,
                    metadata: {
                        consecutiveRejections,
                        agencyName: assignment.agency?.name
                    }
                });
            }
        });
        
        return alerts;
    }
    
    // Process all active projects
     async generateAllAlerts() {
        try {
            console.log('🔍 Starting automatic status update and alert generation...'); // <-- Look for this new message
            
            const projects = await Project.find({
                status: { $in: ['On Track', 'Delayed'] }
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

                // --- CORE AUTOMATION LOGIC ---
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
                // --- END OF AUTOMATION LOGIC ---

                const alerts = await this.evaluateProject(project);
                
                for (const alertData of alerts) {
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


    
    // Auto-resolve alerts when conditions are fixed
    async autoResolveAlerts() {
        const unresolvedAlerts = await Alert.find({
            acknowledged: false,
            autoResolved: false
        }).populate('project');
        
        for (const alert of unresolvedAlerts) {
            let shouldResolve = false;
            
            switch (alert.type) {
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
            }
            
            if (shouldResolve) {
                alert.autoResolved = true;
                alert.resolvedAt = new Date();
                await alert.save();
                console.log(`✅ Auto-resolved alert: ${alert.type} for ${alert.project.name}`);
            }
        }
    }
}

export default new AlertService();