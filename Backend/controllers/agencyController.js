import Agency from '../models/agencyModel.js';

// @desc   Create a new agency
// @route  POST /api/agencies
const createAgency = async (req, res) => {
    try {
        const agency = new Agency(req.body);
        const createdAgency = await agency.save();
        res.status(201).json(createdAgency);
    } catch (error) {
        res.status(400).json({ message: "Failed to create agency", error: error.message });
    }
};

// @desc   Get all agencies
// @route  GET /api/agencies
const getAgencies = async (req, res) => {
    try {
        const agencies = await Agency.find({});
        res.status(200).json(agencies);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch agencies", error: error.message });
    }
};

// @desc   Get agencies for the logged-in state officer's state
// @route  GET /api/agencies/mystate
const getMyStateAgencies = async (req, res) => {
    try {
        // req.user is available from our 'protect' middleware
        const agencies = await Agency.find({ state: req.user.state, type: 'Executing' });
        res.status(200).json(agencies);
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch state agencies", error: error.message });
    }
};

export { createAgency, getAgencies, getMyStateAgencies }; // Add to exports

