// Backend/services/cronService.js
import cron from 'node-cron';
import alertService from './alertService.js';

// Run daily at 2 AM
export const startAlertCron = () => {
    cron.schedule('0 2 * * *', async () => {
        console.log('🕐 Running scheduled alert generation...');
        try {
            await alertService.generateAllAlerts();
        } catch (error) {
            console.error('❌ Scheduled alert generation failed:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    console.log('✅ Alert cron job scheduled (daily at 2 AM IST)');
};