import userService from '../services/userService.js';

const registerUser = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(201).json({
            ...result,
            message: 'Registration successful. You can now log in.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        const status = error.message.includes('already exists') || error.message.includes('Invalid') ? 400 : 500;
        res.status(status).json({ 
            message: error.message === 'User with this email already exists' ? error.message : 'Registration failed', 
            error: error.message 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        const status = error.message === 'Invalid email or password' ? 401 : 500;
        res.status(status).json({ message: error.message === 'Invalid email or password' ? error.message : 'Server error', error: error.message });
    }
};

export { registerUser, loginUser };