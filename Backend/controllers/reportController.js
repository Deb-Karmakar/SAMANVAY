// Backend/controllers/reportController.js

import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';
import Alert from '../models/alertModel.js';
import User from '../models/userModel.js';

// @desc   Generate Fund Utilization Report
// @route  POST /api/reports/fund-utilization
const generateFundUtilizationReport = async (req, res) => {
    try {
        const { state, startDate, endDate } = req.body;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        const fundData = await Project.aggregate([
            { $match: matchStage },
            { $unwind: { path: '$assignments', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { state: '$state', projectId: '$_id' },
                    budget: { $first: '$budget' },
                    status: { $first: '$status' },
                    progress: { $first: '$progress' },
                    allocatedFunds: { $sum: '$assignments.allocatedFunds' }
                }
            },
            {
                $group: {
                    _id: '$_id.state',
                    totalBudget: { $sum: '$budget' },
                    totalAllocated: { $sum: '$allocatedFunds' },
                    totalProjects: { $sum: 1 },
                    completedProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    avgProgress: { $avg: '$progress' }
                }
            },
            {
                $project: {
                    state: '$_id',
                    totalBudget: { $divide: ['$totalBudget', 10000000] }, // Convert to Cr
                    totalAllocated: { $divide: ['$totalAllocated', 10000000] },
                    utilizationRate: {
                        $cond: [
                            { $eq: ['$totalBudget', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$totalAllocated', '$totalBudget'] },
                                    100
                                ]
                            }
                        ]
                    },
                    totalProjects: 1,
                    completedProjects: 1,
                    avgProgress: { $round: ['$avgProgress', 1] },
                    _id: 0
                }
            },
            { $sort: { utilizationRate: -1 } }
        ]);

        res.json({
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
        });
    } catch (error) {
        console.error('Fund Utilization Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

// @desc   Generate Project Status Report
// @route  POST /api/reports/project-status
const generateProjectStatusReport = async (req, res) => {
    try {
        const { state, status, component, startDate, endDate } = req.body;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (status && status !== 'all') matchStage.status = status;
        if (component && component !== 'all') matchStage.component = component;
        if (startDate) matchStage.startDate = { $gte: new Date(startDate) };
        if (endDate) matchStage.endDate = { ...matchStage.endDate, $lte: new Date(endDate) };

        const projects = await Project.find(matchStage)
            .select('name state district component status progress budget startDate endDate assignments')
            .populate('assignments.agency', 'name')
            .sort({ createdAt: -1 });

        const formattedData = projects.map(project => ({
            id: project._id,
            name: project.name,
            state: project.state,
            district: project.district,
            component: project.component,
            status: project.status,
            progress: project.progress || 0,
            budget: project.budget ? (project.budget / 10000000) : 0, // Handle null budget
            agencies: project.assignments && project.assignments.length > 0 
                ? project.assignments.map(a => a.agency?.name).filter(Boolean).join(', ')
                : 'Not Assigned',
            startDate: project.startDate,
            endDate: project.endDate,
            daysRemaining: project.endDate ? 
                Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
        }));

        // Calculate summary statistics - handle null budgets
        const statusBreakdown = projects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {});

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 10000000;

        res.json({
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
        });
    } catch (error) {
        console.error('Project Status Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

// @desc   Generate Agency Performance Report
// @route  POST /api/reports/agency-performance
const generateAgencyPerformanceReport = async (req, res) => {
    try {
        const { state, startDate, endDate } = req.body;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        // First, get projects with assignments
        const projectsWithAssignments = await Project.find({
            ...matchStage,
            'assignments.0': { $exists: true }
        });

        if (projectsWithAssignments.length === 0) {
            return res.json({
                reportType: 'agency-performance',
                generatedAt: new Date(),
                filters: { state, startDate, endDate },
                data: [],
                summary: {
                    totalAgencies: 0,
                    avgCompletionRate: 0,
                    topPerformer: 'N/A'
                }
            });
        }

        const agencyData = await Project.aggregate([
            { 
                $match: {
                    ...matchStage,
                    'assignments.0': { $exists: true }
                }
            },
            { $unwind: '$assignments' },
            {
                $group: {
                    _id: '$assignments.agency',
                    totalProjects: { $sum: 1 },
                    completedProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    onTrackProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'On Track'] }, 1, 0] }
                    },
                    delayedProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'Delayed'] }, 1, 0] }
                    },
                    avgProgress: { $avg: '$progress' },
                    totalAllocated: { $sum: { $ifNull: ['$assignments.allocatedFunds', 0] } },
                    states: { $addToSet: '$state' }
                }
            },
            {
                $lookup: {
                    from: 'agencies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agencyInfo'
                }
            },
            { 
                $match: { 
                    'agencyInfo.0': { $exists: true } 
                } 
            },
            { $unwind: '$agencyInfo' },
            {
                $project: {
                    agencyName: '$agencyInfo.name',
                    agencyType: '$agencyInfo.type',
                    state: '$agencyInfo.state',
                    totalProjects: 1,
                    completedProjects: 1,
                    onTrackProjects: 1,
                    delayedProjects: 1,
                    completionRate: {
                        $cond: [
                            { $eq: ['$totalProjects', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$completedProjects', '$totalProjects'] },
                                    100
                                ]
                            }
                        ]
                    },
                    onTimeRate: {
                        $cond: [
                            { $eq: ['$totalProjects', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$onTrackProjects', '$totalProjects'] },
                                    100
                                ]
                            }
                        ]
                    },
                    avgProgress: { $round: ['$avgProgress', 1] },
                    totalAllocated: { $divide: ['$totalAllocated', 10000000] },
                    statesServed: { $size: '$states' },
                    _id: 0
                }
            },
            { $sort: { completionRate: -1 } }
        ]);

        res.json({
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
        });
    } catch (error) {
        console.error('Agency Performance Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

// @desc   Generate Alert Summary Report
// @route  POST /api/reports/alert-summary
const generateAlertSummaryReport = async (req, res) => {
    try {
        const { state, severity, startDate, endDate } = req.body;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (severity && severity !== 'all') matchStage.severity = severity;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        const alerts = await Alert.find(matchStage);
        
        if (alerts.length === 0) {
            return res.json({
                reportType: 'alert-summary',
                generatedAt: new Date(),
                filters: { state, severity, startDate, endDate },
                data: [],
                summary: {
                    totalAlerts: 0,
                    totalCritical: 0,
                    avgResponseRate: 0
                }
            });
        }

        const alertData = await Alert.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        state: '$state',
                        severity: '$severity',
                        alertType: '$alertType'
                    },
                    count: { $sum: 1 },
                    acknowledged: {
                        $sum: { $cond: ['$acknowledged', 1, 0] }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.state',
                    totalAlerts: { $sum: '$count' },
                    critical: {
                        $sum: { $cond: [{ $eq: ['$_id.severity', 'critical'] }, '$count', 0] }
                    },
                    warning: {
                        $sum: { $cond: [{ $eq: ['$_id.severity', 'warning'] }, '$count', 0] }
                    },
                    info: {
                        $sum: { $cond: [{ $eq: ['$_id.severity', 'info'] }, '$count', 0] }
                    },
                    acknowledged: { $sum: '$acknowledged' },
                    alertTypes: {
                        $push: {
                            type: '$_id.alertType',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $project: {
                    state: { $ifNull: ['$_id', 'Unknown'] },
                    totalAlerts: 1,
                    critical: 1,
                    warning: 1,
                    info: 1,
                    acknowledged: 1,
                    unacknowledged: { $subtract: ['$totalAlerts', '$acknowledged'] },
                    responseRate: {
                        $cond: [
                            { $eq: ['$totalAlerts', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$acknowledged', '$totalAlerts'] },
                                    100
                                ]
                            }
                        ]
                    },
                    alertTypes: 1,
                    _id: 0
                }
            },
            { $sort: { totalAlerts: -1 } }
        ]);

        res.json({
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
        });
    } catch (error) {
        console.error('Alert Summary Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

// @desc   Generate Component-wise Report
// @route  POST /api/reports/component-wise
const generateComponentWiseReport = async (req, res) => {
    try {
        const { state, startDate, endDate } = req.body;
        
        const matchStage = {};
        if (state && state !== 'all') matchStage.state = state;
        if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
        if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

        const componentData = await Project.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$component',
                    totalProjects: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    onTrack: {
                        $sum: { $cond: [{ $eq: ['$status', 'On Track'] }, 1, 0] }
                    },
                    delayed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Delayed'] }, 1, 0] }
                    },
                    totalBudget: { $sum: '$budget' },
                    avgProgress: { $avg: '$progress' },
                    states: { $addToSet: '$state' }
                }
            },
            {
                $project: {
                    component: { $ifNull: ['$_id', 'Unknown'] },
                    totalProjects: 1,
                    completed: 1,
                    onTrack: 1,
                    delayed: 1,
                    totalBudget: { $divide: ['$totalBudget', 10000000] },
                    avgProgress: { $round: ['$avgProgress', 1] },
                    completionRate: {
                        $cond: [
                            { $eq: ['$totalProjects', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$completed', '$totalProjects'] },
                                    100
                                ]
                            }
                        ]
                    },
                    statesCovered: { $size: '$states' },
                    _id: 0
                }
            },
            { $sort: { totalProjects: -1 } }
        ]);

        res.json({
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
        });
    } catch (error) {
        console.error('Component-wise Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

export {
    generateFundUtilizationReport,
    generateProjectStatusReport,
    generateAgencyPerformanceReport,
    generateAlertSummaryReport,
    generateComponentWiseReport
};