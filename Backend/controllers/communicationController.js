// Backend/controllers/communicationController.js
import CommunicationLog from '../models/communicationLogModel.js';

const getCommunicationLogs = async (req, res) => {
    try {
        const query = {};
        
        // Filter based on role
        if (req.user.role === 'StateOfficer') {
            // State officers see logs for their state's projects
            const projects = await Project.find({ state: req.user.state }).select('_id');
            query.project = { $in: projects.map(p => p._id) };
        } else if (req.user.role === 'ExecutingAgency') {
            // Agencies see only their own communications
            query['recipient.userId'] = req.user._id;
        }
        // CentralAdmin sees all

        const logs = await CommunicationLog.find(query)
            .populate('project', 'name')
            .populate('sender', 'fullName')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json(logs);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch logs", error: error.message });
    }
};

export { getCommunicationLogs };