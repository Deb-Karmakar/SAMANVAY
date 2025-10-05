// Backend/controllers/userController.js
import User from '../models/userModel.js';
import Agency from '../models/agencyModel.js';
import generateToken from '../utils/generateToken.js';

const registerUser = async (req, res) => {
    try {
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
        } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create the base user object
        const userData = {
            fullName,
            email,
            password,
            mobile,
            role,
            isActive: true // Set to true for development - no approval needed
        };

        // Add role-specific fields
        if (role === 'CentralAdmin') {
            userData.designation = designation;
        } else if (role === 'StateOfficer') {
            userData.state = state;
        } else if (role === 'ExecutingAgency') {
            userData.state = state;
            userData.district = district;
            userData.agencyName = agencyName;
            userData.agencyType = agencyType;

            // Find or create the agency
            let agency = await Agency.findOne({ 
                name: agencyName,
                state: state 
            });
            
            if (!agency) {
                agency = await Agency.create({
                    name: agencyName,
                    type: agencyType || 'Executing',
                    state: state,
                    district: district,
                    email: email,
                    contactPerson: fullName,
                    status: 'Active' // Set to Active immediately
                });
            }
            
            // Link the agency to the user
            userData.agencyId = agency._id;
        }

        // Create the user with all the data
        const newUser = await User.create(userData);

        if (newUser) {
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
                agencyId: newUser.agencyId,
                token: generateToken(newUser._id), // Return token immediately
                message: 'Registration successful. You can now log in.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Remove isActive check for development
        // if (!user.isActive) {
        //     return res.status(403).json({ 
        //         message: 'Your account is pending approval. Please contact the administrator.' 
        //     });
        // }

        const isPasswordMatch = await user.matchPassword(password);

        if (isPasswordMatch) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                state: user.state,
                agencyName: user.agencyName,
                agencyId: user.agencyId,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { registerUser, loginUser };