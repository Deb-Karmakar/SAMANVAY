import agencyRepository from '../repositories/agencyRepository.js';

class AgencyService {
    async createAgency(agencyData) {
        return await agencyRepository.create(agencyData);
    }

    async getAgencies() {
        return await agencyRepository.findAll();
    }

    async getMyStateAgencies(state) {
        return await agencyRepository.findByState(state);
    }
}

export default new AgencyService();
