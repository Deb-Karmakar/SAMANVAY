import Project from '../models/projectModel.js';

class ProjectRepository {
    async create(projectData) {
        const project = new Project(projectData);
        return await project.save();
    }

    async save(project) {
        return await project.save();
    }

    async findAllPopulated() {
        return await Project.find({}).populate({
            path: 'assignments',
            populate: { path: 'agency', select: 'name' }
        });
    }

    async findByStatePopulated(state) {
        return await Project.find({ state }).populate({
            path: 'assignments',
            populate: { path: 'agency', select: 'name' }
        });
    }

    async findById(id) {
        return await Project.findById(id);
    }

    async findByIdPopulated(id) {
        return await Project.findById(id).populate({
            path: 'assignments.agency',
            select: 'name'
        });
    }

    async findByAgencyPopulated(agencyId) {
        return await Project.find({
            'assignments.agency': agencyId
        }).populate({
            path: 'assignments.agency',
            select: 'name'
        });
    }

    async findPendingReviewsByState(state) {
        return await Project.find({ 
            state,
            'assignments.checklist.status': 'Pending Review'
        }).populate({
            path: 'assignments.agency',
            select: 'name'
        });
    }

    async findLocations() {
        return await Project.find({ 
            'location.coordinates': { $exists: true, $ne: [] } 
        }).select('name status component location budget progress state district');
    }

    async findLocationsByState(state) {
        return await Project.find({ 
            state,
            'location.coordinates': { $exists: true, $ne: [] } 
        }).select('name status component location budget progress district');
    }

    async findLocationsByAgency(agencyId) {
        return await Project.find({ 
            'assignments.agency': agencyId,
            'location.coordinates': { $exists: true, $ne: [] } 
        }).select('name status component location budget progress state district assignments')
          .populate('assignments.agency', 'name');
    }

    // --- Methods for Agency Matching ---
    async findByAgency(agencyId) {
        return await Project.find({ 'assignments.agency': agencyId });
    }

    async findByAgencyAndStatus(agencyId, status) {
        return await Project.find({ 'assignments.agency': agencyId, status });
    }

    async countByAgencyComponentAndStatus(agencyId, component, status) {
        return await Project.countDocuments({
            'assignments.agency': agencyId,
            component,
            status
        });
    }

    async countByAgencyAndStatuses(agencyId, statuses) {
        return await Project.countDocuments({
            'assignments.agency': agencyId,
            status: { $in: statuses }
        });
    }

    // --- Methods for Fund Statistics ---
    async getFundStatsOverall() {
        return await Project.aggregate([
            {
                $facet: {
                    "overallStats": [{ $group: { _id: null, totalBudget: { $sum: "$budget" }, totalDisbursed: { $sum: { $sum: "$assignments.allocatedFunds" } } } }],
                    "byState": [{ $group: { _id: "$state", budget: { $sum: "$budget" }, disbursed: { $sum: { $sum: "$assignments.allocatedFunds" } } } }, { $sort: { budget: -1 } }],
                    "byComponent": [{ $group: { _id: "$component", budget: { $sum: "$budget" }, disbursed: { $sum: { $sum: "$assignments.allocatedFunds" } } } }]
                }
            }
        ]);
    }

    async getFundStatsByState(state) {
        return await Project.aggregate([
            { $match: { state: state } },
            { $unwind: "$assignments" },
            {
                $group: {
                    _id: "$assignments.agency",
                    totalDistributed: { $sum: "$assignments.allocatedFunds" },
                }
            },
            {
                $lookup: {
                    from: "utilizationreports",
                    let: { agencyId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$agency", "$$agencyId"] },
                                        { $eq: ["$status", "Approved"] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalUtilized: { $sum: "$amount" }
                            }
                        }
                    ],
                    as: "utilizationData"
                }
            },
            {
                $addFields: {
                    totalUtilized: { $ifNull: [{ $first: "$utilizationData.totalUtilized" }, 0] }
                }
            },
            {
                $lookup: {
                    from: 'agencies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agencyDetails'
                }
            },
            { $unwind: "$agencyDetails" },
            {
                $project: {
                    _id: 0,
                    agencyId: "$_id",
                    agencyName: "$agencyDetails.name",
                    distributed: { $divide: ["$totalDistributed", 10000000] },
                    utilized: { $divide: ["$totalUtilized", 10000000] }
                }
            },
            { $sort: { distributed: -1 } }
        ]);
    }

    async getTotalBudgetByState(state) {
        return await Project.aggregate([
            { $match: { state: state } },
            { $group: { _id: null, total: { $sum: "$budget" } } }
        ]);
    }
}

export default new ProjectRepository();
