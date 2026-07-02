import Project from '../models/projectModel.js';
import Alert from '../models/alertModel.js';

class ReportRepository {
    async getFundUtilization(matchStage) {
        return await Project.aggregate([
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
                    totalBudget: { $divide: ['$totalBudget', 10000000] },
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
    }

    async getProjectStatus(matchStage) {
        return await Project.find(matchStage)
            .select('name state district component status progress budget startDate endDate assignments')
            .populate('assignments.agency', 'name')
            .sort({ createdAt: -1 });
    }

    async getProjectsWithAssignments(matchStage) {
        return await Project.find({
            ...matchStage,
            'assignments.0': { $exists: true }
        });
    }

    async getAgencyPerformance(matchStage) {
        return await Project.aggregate([
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
    }

    async getAlerts(matchStage) {
        return await Alert.find(matchStage);
    }

    async getAlertSummary(matchStage) {
        return await Alert.aggregate([
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
    }

    async getComponentWise(matchStage) {
        return await Project.aggregate([
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
    }
}

export default new ReportRepository();
