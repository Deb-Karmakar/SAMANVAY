import userRepository from '../repositories/userRepository.js';
import agencyRepository from '../repositories/agencyRepository.js';
import generateToken from '../utils/generateToken.js';

class UserService {
    async registerUser(userDataInput) {
        const { 
            fullName, 
            email, 
            password, 
            mobile, 
            role, 
            designation, 
            state, 
            district, 
            agencyName, 
            agencyType 
        } = userDataInput;

        const userExists = await userRepository.findByEmail(email);
        if (userExists) {
            throw new Error('User with this email already exists');
        }

        const userData = {
            fullName,
            email,
            password,
            mobile,
            role,
            isActive: true
        };

        if (role === 'CentralAdmin') {
            userData.designation = designation;
        } else if (role === 'StateOfficer') {
            userData.state = state;
        } else if (role === 'ExecutingAgency') {
            userData.state = state;
            userData.district = district;
            userData.agencyName = agencyName;
            userData.agencyType = agencyType;

            let agency = await agencyRepository.findByNameAndState(agencyName, state);
            
            if (!agency) {
                agency = await agencyRepository.create({
                    name: agencyName,
                    type: agencyType || 'Executing',
                    state: state,
                    district: district,
                    email: email,
                    contactPerson: fullName,
                    status: 'Active'
                });
            }
            
            userData.agencyId = agency._id;
        }

        const newUser = await userRepository.create(userData);

        if (newUser) {
            return {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
                agencyId: newUser.agencyId,
                token: generateToken(newUser._id),
            };
        } else {
            throw new Error('Invalid user data');
        }
    }

    async loginUser(email, password) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordMatch = await user.matchPassword(password);

        if (isPasswordMatch) {
            return {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                state: user.state,
                agencyName: user.agencyName,
                agencyId: user.agencyId,
                token: generateToken(user._id),
            };
        } else {
            throw new Error('Invalid email or password');
        }
    }
}

export default new UserService();
