import User from '../models/userModel.js';
import Agency from '../models/agencyModel.js';
import jwt from 'jsonwebtoken';

// Helper function to generate a JWT
const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    // For a hackathon, sending the token in the body is fine.
    // In production, you would typically set it in an HTTP-Only cookie.
    return token;
};

// @desc   Register a new user
// @route  POST /api/users/register
const registerUser = async (req, res) => {
    const { 
        fullName, email, password, mobile, role, 
        // Role-specific fields
        designation, state, district, agencyName, agencyType 
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create the user first
    const user = new User({
        fullName, email, password, mobile, role, designation, state
    });
    
    // --- NEW LOGIC STARTS HERE ---
    
    // 2. If the user is an Executing Agency, also create an Agency document
    if (role === 'ExecutingAgency') {
        if (!agencyName || !state || !district || !agencyType) {
            return res.status(400).json({ message: 'Agency Name, State, District, and Type are required for agencies.' });
        }
        
        const agencyExists = await Agency.findOne({ name: agencyName, state: state });
        if (agencyExists) {
            return res.status(400).json({ message: `Agency '${agencyName}' already exists in ${state}.`});
        }

        try {
            const newAgency = await Agency.create({
                name: agencyName,
                type: 'Executing', // Hardcode as Executing
                state,
                district,
                contactPerson: fullName, // Use the user's name as the initial contact
                email: email
            });

            // Link the new agency's ID to the user document
            user.agencyId = newAgency._id;

        } catch (error) {
             console.error("--- AGENCY CREATION FAILED ---");
            console.error(error); 
            return res.status(400).json({ 
                message: 'Failed to create agency profile. See console for details.', 
                error: error.message 
            });
        }
    }
    // --- NEW LOGIC ENDS HERE ---

    // Now save the user (with the agencyId if applicable)
    const createdUser = await user.save();

    if (createdUser) {
        const token = generateToken(res, createdUser._id);
        res.status(201).json({
            _id: createdUser._id,
            fullName: createdUser.fullName,
            email: createdUser.email,
            role: createdUser.role,
            token: token,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc   Auth user & get token (Login)
// @route  POST /api/users/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // We'll add an approval check here later
        // if (!user.isActive) { res.status(403).json({ message: 'Account not yet approved.'})}

        const token = generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            state: user.state, // Send back state for the State Officer
            token: token,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export { registerUser, loginUser };
