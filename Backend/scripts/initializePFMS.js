import connectDB from '../config/db.js';
import pfmsService from '../services/pfmsService.js';
import dotenv from 'dotenv';

dotenv.config();

const initializePFMS = async () => {
    try {
        await connectDB();
        
        console.log('🏦 Initializing PFMS data...');
        
        // Initialize for current and past fiscal years
        const fiscalYears = ['2023-24', '2024-25', '2025-26'];
        
        for (const year of fiscalYears) {
            console.log(`\n📊 Processing fiscal year: ${year}`);
            await pfmsService.syncPFMSData(year);
            console.log(`✅ Completed ${year}`);
        }
        
        console.log('\n🎉 PFMS initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
};

initializePFMS();