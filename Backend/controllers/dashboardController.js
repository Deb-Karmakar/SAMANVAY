import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';
import User from '../models/userModel.js';

// @desc   Get key stats for the admin dashboard
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
            activeAlerts: delayedProjects, // For now, alerts are delayed projects
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get data for the project status chart
// @route  GET /api/dashboard/project-status-chart
const getProjectStatusChartData = async (req, res) => {
    try {
        const statusCounts = await Project.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // Add fill colors for the chart
        const colorMap = { 'On Track': '#22c55e', 'Delayed': '#ef4444', 'Completed': '#3b82f6', 'Pending Approval': '#f97316' };
        const chartData = statusCounts.map(item => ({...item, fill: colorMap[item.name]}));

        res.json(chartData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc   Get recent activities
// @route  GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res) => {
    try {
        const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(3).populate('agency', 'name');
        const recentAgencies = await Agency.find().sort({ createdAt: -1 }).limit(2);

        const activities = [
            ...recentProjects.map(p => ({ type: 'New Project', text: `${p.name} was created and assigned to ${p.agency.name}.`, date: p.createdAt })),
            ...recentAgencies.map(a => ({ type: 'New Agency', text: `${a.name} was registered in ${a.state}.`, date: a.createdAt })),
        ];

        // Sort all activities by date and take the latest 5
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(activities.slice(0, 5));
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export { getAdminStats, getProjectStatusChartData, getRecentActivity };