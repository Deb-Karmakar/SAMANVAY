import communicationService from '../services/communicationService.js';

const getCommunicationLogs = async (req, res) => {
    try {
        const logs = await communicationService.getCommunicationLogs(req.user);
        res.status(200).json(logs);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch logs", error: error.message });
    }
};

export { getCommunicationLogs };