// Backend/routes/testRoutes.js
import express from 'express';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

router.get('/test-email', async (req, res) => {
    try {
        await sendEmail({
            to: 'debkarma97@gmail.com', // Send to yourself
            subject: 'Test Email from SAMANVAY',
            html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
        });
        res.json({ success: true, message: 'Email sent!' });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;