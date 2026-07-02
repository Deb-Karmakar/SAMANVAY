import dashboardRepository from '../repositories/dashboardRepository.js';

class DashboardService {
    // ============================================
    // ADMIN DASHBOARD ENDPOINTS
    // ============================================
    async getAdminStats() {
        const totalProjects = await dashboardRepository.countProjects();
        const activeProjects = await dashboardRepository.countProjects({ status: { $ne: 'Completed' } });
        const totalAgencies = await dashboardRepository.countAgencies();
        const delayedProjects = await dashboardRepository.countProjects({ status: 'Delayed' });

        return {
            totalProjects,
            activeProjects,
            totalAgencies,
            activeAlerts: delayedProjects,
        };
    }

    async getProjectStatusChartData() {
        const statusCounts = await dashboardRepository.getProjectStatusCounts();

        const colorMap = { 
            'On Track': '#22c55e', 
            'Delayed': '#ef4444', 
            'Completed': '#3b82f6', 
            'Pending Approval': '#f97316' 
        };
        
        return statusCounts.map(item => ({
            ...item, 
            fill: colorMap[item.name]
        }));
    }

    async getRecentActivity() {
        const recentProjects = await dashboardRepository.getRecentProjects();
        const recentAgencies = await dashboardRepository.getRecentAgencies();

        const activities = [
            ...recentProjects.map(p => ({ 
                type: 'New Project', 
                text: `${p.name} was created and assigned to ${p.assignments[0]?.agency?.name || 'agency'}.`, 
                date: p.createdAt 
            })),
            ...recentAgencies.map(a => ({ 
                type: 'New Agency', 
                text: `${a.name} was registered in ${a.state}.`, 
                date: a.createdAt 
            })),
        ];

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        return activities.slice(0, 5);
    }

    async getStatePerformance() {
        return await dashboardRepository.getStatePerformance();
    }

    async getBudgetTrends() {
        const totalBudget = await dashboardRepository.getTotalBudget();
        const monthly = await dashboardRepository.getMonthlyBudgetTrends();
        const projects = await dashboardRepository.getProjectsWithDates();
        
        const avgDuration = projects.length > 0 
            ? Math.round(projects.reduce((sum, p) => {
                const duration = (new Date(p.endDate) - new Date(p.startDate)) / (1000 * 60 * 60 * 24);
                return sum + duration;
            }, 0) / projects.length)
            : 0;

        return {
            totalBudget: totalBudget[0]?.total || 0,
            monthly,
            avgDuration
        };
    }

    async getComponentBreakdown() {
        return await dashboardRepository.getComponentBreakdown();
    }

    async getTopAgencies() {
        return await dashboardRepository.getTopAgencies();
    }

    // ============================================
    // STATE DASHBOARD ENDPOINTS
    // ============================================
    async getStateStats(state) {
        const projects = await dashboardRepository.findProjects({ state });
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const utilized = projects.reduce((sum, p) => sum + ((p.budget || 0) * (p.progress || 0) / 100), 0);
        const utilizationRate = totalBudget > 0 ? Math.round((utilized / totalBudget) * 100) : 0;

        return {
            totalBudget,
            utilized,
            utilizationRate
        };
    }

    async getPendingApprovals(state) {
        const pendingProjects = await dashboardRepository.findProjects({ 
            state, 
            status: 'Pending Approval' 
        });

        const projectsWithPendingChecklist = await dashboardRepository.findProjects({
            state,
            'assignments.checklist.status': 'Pending Review'
        });

        const approvals = [
            ...pendingProjects.map(p => ({
                title: `Project Approval Required`,
                description: `"${p.name}" submitted by ${p.assignments[0]?.agency?.name || 'agency'} is awaiting approval.`,
                type: 'project_approval',
                projectId: p._id,
                createdAt: p.createdAt
            })),
            ...projectsWithPendingChecklist.flatMap(p => 
                p.assignments.flatMap(assignment => 
                    assignment.checklist
                        .filter(item => item.status === 'Pending Review')
                        .map(item => ({
                            title: `Checklist Item Review`,
                            description: `"${item.text}" from project "${p.name}" requires review.`,
                            type: 'checklist_review',
                            projectId: p._id,
                            createdAt: item.submittedAt || p.createdAt
                        }))
                )
            )
        ];

        approvals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return approvals;
    }

    async getDistrictBreakdown(state) {
        return await dashboardRepository.getDistrictBreakdown(state);
    }

    // ============================================
    // AGENCY DASHBOARD ENDPOINTS
    // ============================================
    async getAgencyStats(agencyId) {
        const projects = await dashboardRepository.findProjects({
            'assignments.agency': agencyId
        });

        const totalProjects = projects.length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const onTrack = projects.filter(p => p.status === 'On Track').length;
        const delayed = projects.filter(p => p.status === 'Delayed').length;

        return {
            totalProjects,
            completed,
            onTrack,
            delayed,
            completionRate: totalProjects > 0 ? Math.round((completed / totalProjects) * 100) : 0,
            onTimeRate: totalProjects > 0 ? Math.round((onTrack / totalProjects) * 100) : 0
        };
    }

    async getUpcomingDeadlines(agencyId) {
        const projects = await dashboardRepository.findProjects({
            'assignments.agency': agencyId,
            status: { $ne: 'Completed' }
        });

        const deadlines = [];

        projects.forEach(project => {
            if (project.endDate) {
                deadlines.push({
                    title: `Project Completion - ${project.name}`,
                    date: project.endDate,
                    type: 'project_deadline',
                    projectId: project._id
                });
            }

            project.assignments.forEach(assignment => {
                assignment.checklist?.forEach(item => {
                    if (!item.completed && item.deadline) {
                        deadlines.push({
                            title: item.text,
                            date: item.deadline,
                            type: 'task_deadline',
                            projectId: project._id
                        });
                    }
                });
            });
        });

        deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
        return deadlines;
    }

    async getAgencyBudget(agencyId) {
        const projects = await dashboardRepository.findProjects({
            'assignments.agency': agencyId
        });

        let totalAllocated = 0;
        let utilized = 0;
        const projectBreakdown = [];

        projects.forEach(project => {
            const assignment = project.assignments.find(
                a => a.agency._id.toString() === agencyId.toString()
            );

            if (assignment) {
                const allocated = assignment.allocatedFunds || project.budget || 0;
                const projectUtilized = (allocated * project.progress) / 100;

                totalAllocated += allocated;
                utilized += projectUtilized;

                projectBreakdown.push({
                    name: project.name,
                    allocated,
                    utilized: projectUtilized,
                    progress: project.progress
                });
            }
        });

        const utilizationRate = totalAllocated > 0 
            ? Math.round((utilized / totalAllocated) * 100) 
            : 0;

        return {
            totalAllocated,
            utilized,
            utilizationRate,
            projectBreakdown
        };
    }
}

export default new DashboardService();
