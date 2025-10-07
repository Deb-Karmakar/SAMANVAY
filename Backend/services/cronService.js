// Backend/services/cronService.js (Corrected)

import cron from 'node-cron';
import alertService from './alertService.js';

// Run daily at 2 AM
export const startAlertCron = () => {
    cron.schedule('0 2 * * *', async () => {
        console.log('🕐 Running nightly job: status updates, alerts, & escalations...');
        try {
            // This is the only function call you need.
            // It will handle both generating alerts and escalating them.
            await alertService.runNightlyJob();
            
        } catch (error) {
            console.error('❌ Nightly job failed:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    console.log('✅ Nightly cron job scheduled (daily at 2 AM IST)');
};