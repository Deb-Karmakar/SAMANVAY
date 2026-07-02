import agencyService from '../services/agencyService.js';

const createAgency = async (req, res) => {
    try {
        const createdAgency = await agencyService.createAgency(req.body);
        res.status(201).json(createdAgency);
    } catch (error) {
        res.status(400).json({ message: "Failed to create agency", error: error.message });
    }
};

const getAgencies = async (req, res) => {
    try {
        const agencies = await agencyService.getAgencies();
        res.status(200).json(agencies);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch agencies", error: error.message });
    }
};

const getMyStateAgencies = async (req, res) => {
    try {
        const agencies = await agencyService.getMyStateAgencies(req.user.state);
        res.status(200).json(agencies);
    } catch (error) {
        console.error('Error fetching agencies:', error);
        res.status(400).json({ message: "Failed to fetch state agencies", error: error.message });
    }
};

export { createAgency, getAgencies, getMyStateAgencies };