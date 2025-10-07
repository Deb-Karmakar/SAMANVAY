// Backend/services/pfmsCronService.js
import cron from 'node-cron';
import pfmsService from './pfmsService.js';

// Get current fiscal year
const getCurrentFiscalYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Indian fiscal year: April to March
    if (month >= 3) { // April onwards
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
};

// Daily PFMS sync at 3 AM IST
export const startPFMSDailySync = () => {
    cron.schedule('0 3 * * *', async () => {
        const fiscalYear = getCurrentFiscalYear();
        console.log(`🏦 Running daily PFMS sync for ${fiscalYear}...`);
        
        try {
            // Sync PFMS data from mock API
            await pfmsService.syncPFMSData(fiscalYear);
            
            // Sync with actual project data
            await pfmsService.syncWithProjectData(fiscalYear);
            
            console.log('✅ Daily PFMS sync completed successfully');
        } catch (error) {
            console.error('❌ Daily PFMS sync failed:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    console.log('✅ PFMS daily sync scheduled (3 AM IST)');
};

// Weekly comprehensive sync on Sunday at 1 AM IST
export const startPFMSWeeklySync = () => {
    cron.schedule('0 1 * * 0', async () => {
        const fiscalYear = getCurrentFiscalYear();
        console.log(`📊 Running weekly comprehensive PFMS analysis for ${fiscalYear}...`);
        
        try {
            // Full data sync
            const pfmsData = await pfmsService.syncPFMSData(fiscalYear);
            
            // Project data sync
            await pfmsService.syncWithProjectData(fiscalYear);
            
            // Regenerate predictions
            await pfmsService.generatePredictions(pfmsData);
            
            console.log('✅ Weekly PFMS analysis completed successfully');
        } catch (error) {
            console.error('❌ Weekly PFMS analysis failed:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    console.log('✅ PFMS weekly analysis scheduled (Sunday 1 AM IST)');
};

// Monthly reconciliation on 1st of every month at 2 AM IST
export const startPFMSMonthlyReconciliation = () => {
    cron.schedule('0 2 1 * *', async () => {
        const fiscalYear = getCurrentFiscalYear();
        console.log(`🔄 Running monthly PFMS reconciliation for ${fiscalYear}...`);
        
        try {
            // Full sync from PFMS
            await pfmsService.syncPFMSData(fiscalYear);
            
            // Sync with projects
            await pfmsService.syncWithProjectData(fiscalYear);
            
            console.log('✅ Monthly PFMS reconciliation completed');
            
            // TODO: Send email report to admins
            
        } catch (error) {
            console.error('❌ Monthly reconciliation failed:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    console.log('✅ PFMS monthly reconciliation scheduled (1st of month, 2 AM IST)');
};

// Initialize all PFMS cron jobs
export const initializePFMSCronJobs = () => {
    startPFMSDailySync();
    startPFMSWeeklySync();
    startPFMSMonthlyReconciliation();
    console.log('🏦 All PFMS cron jobs initialized');
};