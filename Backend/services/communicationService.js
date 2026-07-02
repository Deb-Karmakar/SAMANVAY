import communicationRepository from '../repositories/communicationRepository.js';
import projectRepository from '../repositories/projectRepository.js';

class CommunicationService {
    async getCommunicationLogs(user) {
        const query = {};
        
        if (user.role === 'StateOfficer') {
            const projects = await projectRepository.findProjects({ state: user.state });
            query.project = { $in: projects.map(p => p._id) };
        } else if (user.role === 'ExecutingAgency') {
            query['recipient.userId'] = user._id;
        }
        
        return await communicationRepository.findLogs(query);
    }
}

export default new CommunicationService();
