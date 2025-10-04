import express from 'express';
import { upload, uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/image', protect, upload.single('image'), uploadImage);

export default router;