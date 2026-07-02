import CommunicationLog from '../models/communicationLogModel.js';

class CommunicationRepository {
    async findLogs(query) {
        return await CommunicationLog.find(query)
            .populate('project', 'name')
            .populate('sender', 'fullName')
            .sort({ createdAt: -1 })
            .limit(100);
    }
}

export default new CommunicationRepository();
