// Backend/controllers/agencyController.js
import Agency from '../models/agencyModel.js';

const createAgency = async (req, res) => {
    try {
        const agency = new Agency(req.body);
        const createdAgency = await agency.save();
        res.status(201).json(createdAgency);
    } catch (error) {
        res.status(400).json({ message: "Failed to create agency", error: error.message });
    }
};

const getAgencies = async (req, res) => {
    try {
        const agencies = await Agency.find({});
        res.status(200).json(agencies);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch agencies", error: error.message });
    }
};

// Backend/controllers/agencyController.js
const getMyStateAgencies = async (req, res) => {
    try {
        console.log('Fetching agencies for state:', req.user.state);
        
        const agencies = await Agency.find({ 
            state: req.user.state
        });
        
        console.log('Found agencies:', agencies.length);
        console.log('Agency details:', agencies.map(a => ({ 
            name: a.name, 
            state: a.state, 
            status: a.status 
        })));
        
        res.status(200).json(agencies);
    } catch (error) {
        console.error('Error fetching agencies:', error);
        res.status(400).json({ message: "Failed to fetch state agencies", error: error.message });
    }
};

export { createAgency, getAgencies, getMyStateAgencies };