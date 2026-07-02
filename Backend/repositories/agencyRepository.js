import Agency from '../models/agencyModel.js';

class AgencyRepository {
    async create(agencyData) {
        return await Agency.create(agencyData);
    }

    async findAll() {
        return await Agency.find({});
    }

    async findByState(state) {
        return await Agency.find({ state });
    }

    async findByNameAndState(name, state) {
        return await Agency.findOne({ name, state });
    }

    async findByStateAndStatus(state, status) {
        return await Agency.find({ state, status });
    }

    async countDocuments(query = {}) {
        return await Agency.countDocuments(query);
    }
}

export default new AgencyRepository();
