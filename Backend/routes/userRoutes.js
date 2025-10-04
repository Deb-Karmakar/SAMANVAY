import express from 'express';
const router = express.Router();
import { registerUser, loginUser } from '../controllers/userController.js';

// Route for registering a new user
router.post('/register', registerUser);

// Route for logging in a user
router.post('/login', loginUser);

export default router;