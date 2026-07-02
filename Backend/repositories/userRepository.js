import User from '../models/userModel.js';

class UserRepository {
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findById(id) {
        return await User.findById(id);
    }

    async findByRoleAndState(role, state) {
        return await User.findOne({ role, state });
    }

    async create(userData) {
        return await User.create(userData);
    }

    async save(user) {
        return await user.save();
    }
}

export default new UserRepository();
