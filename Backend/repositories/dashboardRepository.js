import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';

class DashboardRepository {
    async countProjects(query = {}) {
        return await Project.countDocuments(query);
    }

    async countAgencies(query = {}) {
        return await Agency.countDocuments(query);
    }

    async getProjectStatusCounts() {
        return await Project.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);
    }

    async getRecentProjects() {
        return await Project.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('assignments.agency', 'name');
    }

    async getRecentAgencies() {
        return await Agency.find()
            .sort({ createdAt: -1 })
            .limit(2);
    }

    async getStatePerformance() {
        return await Project.aggregate([
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
    }

    async getTotalBudget() {
        return await Project.aggregate([
            { $group: { _id: null, total: { $sum: '$budget' } } }
        ]);
    }

    async getMonthlyBudgetTrends() {
        return await Project.aggregate([
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
    }

    async getProjectsWithDates() {
        return await Project.find({ startDate: { $exists: true }, endDate: { $exists: true } });
    }

    async getComponentBreakdown() {
        return await Project.aggregate([
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
    }

    async getTopAgencies() {
        return await Project.aggregate([
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
    }

    async findProjects(query) {
        return await Project.find(query).populate('assignments.agency', 'name');
    }

    async getDistrictBreakdown(state) {
        return await Project.aggregate([
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
                    budget: { $divide: ['$budget', 100000] },
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
    }
}

export default new DashboardRepository();
