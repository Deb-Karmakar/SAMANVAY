// Backend/controllers/dashboardController.js
import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';
import User from '../models/userModel.js';

// ============================================
// ADMIN DASHBOARD ENDPOINTS
// ============================================

// @desc   Get key stats for admin dashboard
// @route  GET /api/dashboard/stats
const getAdminStats = async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        const activeProjects = await Project.countDocuments({ status: { $ne: 'Completed' } });
        const totalAgencies = await Agency.countDocuments();
        const delayedProjects = await Project.countDocuments({ status: 'Delayed' });

        res.json({
            totalProjects,
            activeProjects,
            totalAgencies,
            activeAlerts: delayedProjects,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get project status chart data
// @route  GET /api/dashboard/project-status-chart
const getProjectStatusChartData = async (req, res) => {
    try {
        const statusCounts = await Project.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        const colorMap = { 
            'On Track': '#22c55e', 
            'Delayed': '#ef4444', 
            'Completed': '#3b82f6', 
            'Pending Approval': '#f97316' 
        };
        
        const chartData = statusCounts.map(item => ({
            ...item, 
            fill: colorMap[item.name]
        }));

        res.json(chartData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get recent activity
// @route  GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res) => {
    try {
        const recentProjects = await Project.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('assignments.agency', 'name');
            
        const recentAgencies = await Agency.find()
            .sort({ createdAt: -1 })
            .limit(2);

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
        res.json(activities.slice(0, 5));
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get state performance data
// @route  GET /api/dashboard/state-performance
const getStatePerformance = async (req, res) => {
    try {
        const stateData = await Project.aggregate([
            {
                $group: {
                    _id: '$state',
                    projects: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    state: '$_id',
                    projects: 1,
                    completionRate: {
                        $multiply: [
                            { $divide: ['$completed', '$projects'] },
                            100
                        ]
                    },
                    _id: 0
                }
            },
            { $sort: { completionRate: -1 } }
        ]);

        res.json(stateData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get budget trends
// @route  GET /api/dashboard/budget-trends
const getBudgetTrends = async (req, res) => {
    try {
        const totalBudget = await Project.aggregate([
            { $group: { _id: null, total: { $sum: '$budget' } } }
        ]);

        // Get monthly data (simplified - you can enhance with actual date ranges)
        const monthly = await Project.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    allocated: { $sum: '$budget' },
                    utilized: { $sum: { $multiply: ['$budget', { $divide: ['$progress', 100] }] } }
                }
            },
            {
                $project: {
                    month: {
                        $let: {
                            vars: {
                                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            },
                            in: { $arrayElemAt: ['$$monthNames', { $subtract: ['$_id', 1] }] }
                        }
                    },
                    allocated: 1,
                    utilized: 1,
                    _id: 0
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Calculate average project duration
        const projects = await Project.find({ startDate: { $exists: true }, endDate: { $exists: true } });
        const avgDuration = projects.length > 0 
            ? Math.round(projects.reduce((sum, p) => {
                const duration = (new Date(p.endDate) - new Date(p.startDate)) / (1000 * 60 * 60 * 24);
                return sum + duration;
            }, 0) / projects.length)
            : 0;

        res.json({
            totalBudget: totalBudget[0]?.total || 0,
            monthly,
            avgDuration
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get component breakdown
// @route  GET /api/dashboard/component-breakdown
const getComponentBreakdown = async (req, res) => {
    try {
        const componentData = await Project.aggregate([
            {
                $group: {
                    _id: '$component',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: '$_id',
                    value: '$count',
                    _id: 0
                }
            }
        ]);

        res.json(componentData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get top performing agencies
// @route  GET /api/dashboard/top-agencies
const getTopAgencies = async (req, res) => {
    try {
        const topAgencies = await Project.aggregate([
            { $unwind: '$assignments' },
            {
                $group: {
                    _id: '$assignments.agency',
                    projectsCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    totalProjects: { $sum: 1 }
                }
            },
            { $sort: { projectsCompleted: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'agencies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agencyInfo'
                }
            },
            { $unwind: '$agencyInfo' },
            {
                $project: {
                    name: '$agencyInfo.name',
                    state: '$agencyInfo.state',
                    projectsCompleted: 1,
                    totalProjects: 1,
                    _id: 0
                }
            }
        ]);

        res.json(topAgencies);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ============================================
// STATE DASHBOARD ENDPOINTS
// ============================================

// @desc   Get state-specific stats
// @route  GET /api/dashboard/state-stats
const getStateStats = async (req, res) => {
    try {
        const { state } = req.query;

        const projects = await Project.find({ state });
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const utilized = projects.reduce((sum, p) => sum + ((p.budget || 0) * (p.progress || 0) / 100), 0);
        const utilizationRate = totalBudget > 0 ? Math.round((utilized / totalBudget) * 100) : 0;

        res.json({
            totalBudget,
            utilized,
            utilizationRate
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get pending approvals for state
// @route  GET /api/dashboard/pending-approvals
const getPendingApprovals = async (req, res) => {
    try {
        const { state } = req.query;

        // Get projects pending approval in this state
        const pendingProjects = await Project.find({ 
            state, 
            status: 'Pending Approval' 
        }).populate('assignments.agency', 'name');

        // Get checklist items pending review
        const projectsWithPendingChecklist = await Project.find({
            state,
            'assignments.checklist.status': 'Pending Review'
        }).populate('assignments.agency', 'name');

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
        res.json(approvals);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get district breakdown for state
// @route  GET /api/dashboard/district-breakdown
const getDistrictBreakdown = async (req, res) => {
    try {
        const { state } = req.query;

        const districtData = await Project.aggregate([
            { $match: { state } },
            {
                $group: {
                    _id: '$district',
                    projects: { $sum: 1 },
                    budget: { $sum: '$budget' },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    district: '$_id',
                    projects: 1,
                    budget: { $divide: ['$budget', 100000] }, // Convert to Lakhs
                    completionRate: {
                        $cond: [
                            { $gt: ['$projects', 0] },
                            { $multiply: [{ $divide: ['$completed', '$projects'] }, 100] },
                            0
                        ]
                    },
                    _id: 0
                }
            },
            { $sort: { projects: -1 } }
        ]);

        res.json(districtData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ============================================
// AGENCY DASHBOARD ENDPOINTS
// ============================================

// @desc   Get agency-specific stats
// @route  GET /api/dashboard/agency-stats
const getAgencyStats = async (req, res) => {
    try {
        const agencyId = req.user.agencyId;

        const projects = await Project.find({
            'assignments.agency': agencyId
        });

        const totalProjects = projects.length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const onTrack = projects.filter(p => p.status === 'On Track').length;
        const delayed = projects.filter(p => p.status === 'Delayed').length;

        res.json({
            totalProjects,
            completed,
            onTrack,
            delayed,
            completionRate: totalProjects > 0 ? Math.round((completed / totalProjects) * 100) : 0,
            onTimeRate: totalProjects > 0 ? Math.round((onTrack / totalProjects) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get upcoming deadlines for agency
// @route  GET /api/dashboard/upcoming-deadlines
const getUpcomingDeadlines = async (req, res) => {
    try {
        const agencyId = req.user.agencyId;

        const projects = await Project.find({
            'assignments.agency': agencyId,
            status: { $ne: 'Completed' }
        });

        const deadlines = [];

        // Add project end dates
        projects.forEach(project => {
            if (project.endDate) {
                deadlines.push({
                    title: `Project Completion - ${project.name}`,
                    date: project.endDate,
                    type: 'project_deadline',
                    projectId: project._id
                });
            }

            // Add checklist item deadlines (if you add deadline field to checklist)
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

        // Sort by date (nearest first)
        deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        res.json(deadlines);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get budget breakdown for agency
// @route  GET /api/dashboard/agency-budget
const getAgencyBudget = async (req, res) => {
    try {
        const agencyId = req.user.agencyId;

        const projects = await Project.find({
            'assignments.agency': agencyId
        }).populate('assignments.agency');

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

        res.json({
            totalAllocated,
            utilized,
            utilizationRate,
            projectBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ============================================
// EXPORTS
// ============================================

export {
    // Admin endpoints
    getAdminStats,
    getProjectStatusChartData,
    getRecentActivity,
    getStatePerformance,
    getBudgetTrends,
    getComponentBreakdown,
    getTopAgencies,
    
    // State endpoints
    getStateStats,
    getPendingApprovals,
    getDistrictBreakdown,
    
    // Agency endpoints
    getAgencyStats,
    getUpcomingDeadlines,
    getAgencyBudget
};