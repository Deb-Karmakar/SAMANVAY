import UtilizationReport from '../models/utilizationReportModel.js';

class UtilizationRepository {
    async create(reportData) {
        return await UtilizationReport.create(reportData);
    }

    async findPendingByState(state) {
        return await UtilizationReport.find({ status: 'Pending Approval' })
            .populate({
                path: 'project',
                select: 'name state',
                match: { state: state }
            })
            .populate('agency', 'name')
            .sort({ createdAt: -1 });
    }

    async findByIdWithPopulate(id) {
        return await UtilizationReport.findById(id)
            .populate('project', 'name state')
            .populate('agency', 'name')
            .populate('submittedBy', 'email _id');
    }

    async save(report) {
        return await report.save();
    }
}

export default new UtilizationRepository();
