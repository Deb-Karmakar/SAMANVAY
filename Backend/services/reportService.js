import reportRepository from '../repositories/reportRepository.js';

class ReportService {
    async generateFundUtilizationReport(filters) {
        const { state, startDate, endDate } = filters;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        const fundData = await reportRepository.getFundUtilization(matchStage);

        return {
            reportType: 'fund-utilization',
            generatedAt: new Date(),
            filters: { state, startDate, endDate },
            data: fundData,
            summary: {
                totalStates: fundData.length,
                totalBudget: fundData.reduce((sum, item) => sum + item.totalBudget, 0),
                totalAllocated: fundData.reduce((sum, item) => sum + item.totalAllocated, 0),
                avgUtilization: fundData.length > 0 ? 
                    fundData.reduce((sum, item) => sum + item.utilizationRate, 0) / fundData.length : 0
            }
        };
    }

    async generateProjectStatusReport(filters) {
        const { state, status, component, startDate, endDate } = filters;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (status && status !== 'all') matchStage.status = status;
        if (component && component !== 'all') matchStage.component = component;
        if (startDate) matchStage.startDate = { $gte: new Date(startDate) };
        if (endDate) matchStage.endDate = { ...matchStage.endDate, $lte: new Date(endDate) };

        const projects = await reportRepository.getProjectStatus(matchStage);

        const formattedData = projects.map(project => ({
            id: project._id,
            name: project.name,
            state: project.state,
            district: project.district,
            component: project.component,
            status: project.status,
            progress: project.progress || 0,
            budget: project.budget ? (project.budget / 10000000) : 0,
            agencies: project.assignments && project.assignments.length > 0 
                ? project.assignments.map(a => a.agency?.name).filter(Boolean).join(', ')
                : 'Not Assigned',
            startDate: project.startDate,
            endDate: project.endDate,
            daysRemaining: project.endDate ? 
                Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
        }));

        const statusBreakdown = projects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {});

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 10000000;

        return {
            reportType: 'project-status',
            generatedAt: new Date(),
            filters: { state, status, component, startDate, endDate },
            data: formattedData,
            summary: {
                totalProjects: projects.length,
                statusBreakdown,
                avgProgress: projects.length > 0 ? 
                    projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length : 0,
                totalBudget: totalBudget
            }
        };
    }

    async generateAgencyPerformanceReport(filters) {
        const { state, startDate, endDate } = filters;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        const projectsWithAssignments = await reportRepository.getProjectsWithAssignments(matchStage);

        if (projectsWithAssignments.length === 0) {
            return {
                reportType: 'agency-performance',
                generatedAt: new Date(),
                filters: { state, startDate, endDate },
                data: [],
                summary: {
                    totalAgencies: 0,
                    avgCompletionRate: 0,
                    topPerformer: 'N/A'
                }
            };
        }

        const agencyData = await reportRepository.getAgencyPerformance(matchStage);

        return {
            reportType: 'agency-performance',
            generatedAt: new Date(),
            filters: { state, startDate, endDate },
            data: agencyData,
            summary: {
                totalAgencies: agencyData.length,
                avgCompletionRate: agencyData.length > 0 ? 
                    agencyData.reduce((sum, a) => sum + a.completionRate, 0) / agencyData.length : 0,
                topPerformer: agencyData[0]?.agencyName || 'N/A'
            }
        };
    }

    async generateAlertSummaryReport(filters) {
        const { state, severity, startDate, endDate } = filters;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (severity && severity !== 'all') matchStage.severity = severity;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        const alerts = await reportRepository.getAlerts(matchStage);
        
        if (alerts.length === 0) {
            return {
                reportType: 'alert-summary',
                generatedAt: new Date(),
                filters: { state, severity, startDate, endDate },
                data: [],
                summary: {
                    totalAlerts: 0,
                    totalCritical: 0,
                    avgResponseRate: 0
                }
            };
        }

        const alertData = await reportRepository.getAlertSummary(matchStage);

        return {
            reportType: 'alert-summary',
            generatedAt: new Date(),
            filters: { state, severity, startDate, endDate },
            data: alertData,
            summary: {
                totalAlerts: alertData.reduce((sum, s) => sum + s.totalAlerts, 0),
                totalCritical: alertData.reduce((sum, s) => sum + s.critical, 0),
                avgResponseRate: alertData.length > 0 ? 
                    alertData.reduce((sum, s) => sum + s.responseRate, 0) / alertData.length : 0
            }
        };
    }

    async generateComponentWiseReport(filters) {
        const { state, startDate, endDate } = filters;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        const componentData = await reportRepository.getComponentWise(matchStage);

        return {
            reportType: 'component-wise',
            generatedAt: new Date(),
            filters: { state, startDate, endDate },
            data: componentData,
            summary: {
                totalComponents: componentData.length,
                totalBudget: componentData.reduce((sum, c) => sum + c.totalBudget, 0),
                avgCompletion: componentData.length > 0 ? 
                    componentData.reduce((sum, c) => sum + c.completionRate, 0) / componentData.length : 0
            }
        };
    }
}

export default new ReportService();
