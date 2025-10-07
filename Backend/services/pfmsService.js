// Backend/services/pfmsService.js
import { PFMSData, PFMSTransaction } from '../models/pfmsModel.js';
import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';
import pfmsRealDataService from './pfmsRealDataService.js';


class PFMSService {
    
    // Indian states for realistic data
    indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];
    
    components = ['Adarsh Gram', 'GIA', 'Hostel'];
    
    // Mock PFMS API Call (simulates external API)
    async mockPFMSAPICall(fiscalYear) {
        console.log(`📡 Calling PFMS API for fiscal year ${fiscalYear}...`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate realistic mock data
        const totalAllocated = 50000000000; // 500 Crores
        const releasePercentage = 60 + Math.random() * 25; // 60-85%
        const utilizationPercentage = 50 + Math.random() * 30; // 50-80% of released
        
        const totalReleased = Math.round(totalAllocated * (releasePercentage / 100));
        const totalUtilized = Math.round(totalReleased * (utilizationPercentage / 100));
        
        const stateBreakdown = this.indianStates.map(state => {
            const stateAllocation = totalAllocated / this.indianStates.length;
            const stateReleaseRate = 55 + Math.random() * 35;
            const stateReleased = Math.round(stateAllocation * (stateReleaseRate / 100));
            const stateUtilizationRate = 45 + Math.random() * 40;
            const stateUtilized = Math.round(stateReleased * (stateUtilizationRate / 100));
            
            return {
                state,
                allocated: Math.round(stateAllocation),
                released: stateReleased,
                utilized: stateUtilized,
                pending: stateReleased - stateUtilized,
                utilizationRate: Math.round(stateUtilizationRate),
                releaseRate: Math.round(stateReleaseRate),
                components: this.generateComponentBreakdown(stateAllocation, stateReleased, stateUtilized),
                lastSync: new Date(),
                performance: this.calculatePerformance(stateUtilizationRate)
            };
        });
        
        const componentBreakdown = this.aggregateComponentData(stateBreakdown);
        
        return {
            fiscalYear,
            totalAllocated,
            totalReleased,
            totalUtilized,
            totalPending: totalReleased - totalUtilized,
            stateBreakdown,
            componentBreakdown,
            quarterlyData: this.generateQuarterlyData(totalReleased, totalUtilized),
            lastSyncedAt: new Date(),
            syncStatus: 'Success'
        };
    }
    
    // Generate component breakdown for a state
    generateComponentBreakdown(allocated, released, utilized) {
        const distribution = {
            'Adarsh Gram': 0.40,
            'GIA': 0.35,
            'Hostel': 0.25
        };
        
        return this.components.map(component => ({
            component,
            allocated: Math.round(allocated * distribution[component]),
            released: Math.round(released * distribution[component]),
            utilized: Math.round(utilized * distribution[component]),
            pending: Math.round((released - utilized) * distribution[component]),
            projects: Math.floor(Math.random() * 50) + 10,
            completedProjects: Math.floor(Math.random() * 30) + 5
        }));
    }
    
    // Aggregate component data from states
    aggregateComponentData(stateBreakdown) {
        const aggregated = {};
        
        this.components.forEach(comp => {
            aggregated[comp] = {
                component: comp,
                allocated: 0,
                released: 0,
                utilized: 0,
                pending: 0,
                projects: 0,
                completedProjects: 0
            };
        });
        
        stateBreakdown.forEach(state => {
            state.components.forEach(comp => {
                aggregated[comp.component].allocated += comp.allocated;
                aggregated[comp.component].released += comp.released;
                aggregated[comp.component].utilized += comp.utilized;
                aggregated[comp.component].pending += comp.pending;
                aggregated[comp.component].projects += comp.projects;
                aggregated[comp.component].completedProjects += comp.completedProjects;
            });
        });
        
        return Object.values(aggregated);
    }
    
    // Generate quarterly data
    generateQuarterlyData(totalReleased, totalUtilized) {
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        let cumulativeRelease = 0;
        let cumulativeUtilization = 0;
        
        return quarters.map((quarter, index) => {
            const releasePercentage = [0.15, 0.25, 0.30, 0.30][index];
            const released = Math.round(totalReleased * releasePercentage);
            const utilized = Math.round(totalUtilized * releasePercentage * (0.85 + Math.random() * 0.15));
            
            cumulativeRelease += released;
            cumulativeUtilization += utilized;
            
            return {
                quarter,
                released: cumulativeRelease,
                utilized: cumulativeUtilization,
                projects: Math.floor(100 * releasePercentage)
            };
        });
    }
    
    // Calculate performance rating
    calculatePerformance(utilizationRate) {
        if (utilizationRate >= 80) return 'Excellent';
        if (utilizationRate >= 60) return 'Good';
        if (utilizationRate >= 40) return 'Average';
        return 'Poor';
    }
    
    // Sync PFMS data from mock API
    async syncRealPFMSData(fiscalYear) {
    try {
        console.log(`🔄 Starting REAL PFMS data sync for ${fiscalYear}...`);
        
        // Calculate real data from projects
        const pfmsData = await pfmsRealDataService.calculateRealPFMSData(fiscalYear);
        
        // Update or create PFMS data
        let existingData = await PFMSData.findOne({ fiscalYear });
        
        if (existingData) {
            Object.assign(existingData, pfmsData);
            existingData.calculateRates();
            existingData.updateStatePerformance();
            await existingData.save();
            console.log(`✅ Updated PFMS data for ${fiscalYear} with REAL project data`);
        } else {
            existingData = new PFMSData(pfmsData);
            existingData.calculateRates();
            existingData.updateStatePerformance();
            await existingData.save();
            console.log(`✅ Created new PFMS data for ${fiscalYear} with REAL project data`);
        }
        
        // Generate predictions
        await this.generatePredictions(existingData);
        
        return existingData;
        
    } catch (error) {
        console.error('❌ Real PFMS sync failed:', error);
        throw error;
    }
}
    // Sync PFMS data from mock API

    async syncPFMSData(fiscalYear) {
        try {
            console.log(`🔄 Starting PFMS sync for ${fiscalYear}...`);
            
            // Call mock PFMS API
            const pfmsData = await this.mockPFMSAPICall(fiscalYear);
            
            // Update or create PFMS data
            let existingData = await PFMSData.findOne({ fiscalYear });
            
            if (existingData) {
                Object.assign(existingData, pfmsData);
                existingData.calculateRates();
                existingData.updateStatePerformance();
                await existingData.save();
                console.log(`✅ Updated PFMS data for ${fiscalYear}`);
            } else {
                existingData = new PFMSData(pfmsData);
                existingData.calculateRates();
                existingData.updateStatePerformance();
                await existingData.save();
                console.log(`✅ Created new PFMS data for ${fiscalYear}`);
            }
            
            // Generate predictions
            await this.generatePredictions(existingData);
            
            return existingData;
            
        } catch (error) {
            console.error('❌ PFMS sync failed:', error);
            throw error;
        }
    }
    
    // Sync with real project data from database
    async syncWithProjectData(fiscalYear) {
        try {
            console.log(`🔄 Syncing PFMS with actual project data...`);
            
            const pfmsData = await PFMSData.findOne({ fiscalYear });
            if (!pfmsData) {
                throw new Error('PFMS data not found for fiscal year');
            }
            
            // Get all projects
            const projects = await Project.find({}).populate('assignments.agency');
            
            // Calculate actual utilization from projects
            const stateUtilization = {};
            
            projects.forEach(project => {
                if (!stateUtilization[project.state]) {
                    stateUtilization[project.state] = {
                        totalBudget: 0,
                        totalAllocated: 0,
                        components: {}
                    };
                }
                
                stateUtilization[project.state].totalBudget += project.budget;
                
                project.assignments.forEach(assignment => {
                    stateUtilization[project.state].totalAllocated += assignment.allocatedFunds || 0;
                });
                
                if (!stateUtilization[project.state].components[project.component]) {
                    stateUtilization[project.state].components[project.component] = {
                        budget: 0,
                        allocated: 0
                    };
                }
                
                stateUtilization[project.state].components[project.component].budget += project.budget;
            });
            
            // Update PFMS data with actual project data
            pfmsData.stateBreakdown.forEach(state => {
                if (stateUtilization[state.state]) {
                    const actualData = stateUtilization[state.state];
                    // Blend PFMS data with actual project data
                    state.utilized = Math.round((state.utilized + actualData.totalAllocated) / 2);
                    state.utilizationRate = state.released > 0 
                        ? Math.round((state.utilized / state.released) * 100) 
                        : 0;
                }
            });
            
            pfmsData.calculateRates();
            pfmsData.updateStatePerformance();
            await pfmsData.save();
            
            console.log(`✅ Synced PFMS with project data`);
            return pfmsData;
            
        } catch (error) {
            console.error('❌ Project data sync failed:', error);
            throw error;
        }
    }
    
    // Generate predictions using basic analytics
    async generatePredictions(pfmsData) {
        try {
            const currentUtilization = pfmsData.nationalUtilizationRate;
            const currentRelease = pfmsData.nationalReleaseRate;
            
            // Simple linear projection
            const projectedUtilization = Math.min(100, currentUtilization + 15);
            const projectedCompletion = Math.min(100, currentRelease + 10);
            
            // Risk assessment
            let riskScore = 0;
            const recommendations = [];
            
            if (currentUtilization < 50) {
                riskScore += 30;
                recommendations.push('Low utilization detected. Review state-level bottlenecks.');
            }
            
            if (currentRelease < 60) {
                riskScore += 25;
                recommendations.push('Fund release is below target. Expedite approval processes.');
            }
            
            // Check state performance variance
            const stateRates = pfmsData.stateBreakdown.map(s => s.utilizationRate);
            const variance = this.calculateVariance(stateRates);
            
            if (variance > 400) {
                riskScore += 20;
                recommendations.push('High variance in state performance. Focus on underperforming states.');
            }
            
            // Check poor performing states
            const poorStates = pfmsData.stateBreakdown.filter(s => s.performance === 'Poor');
            if (poorStates.length > 5) {
                riskScore += 25;
                recommendations.push(`${poorStates.length} states showing poor performance. Immediate intervention needed.`);
            }
            
            if (riskScore < 30) {
                recommendations.push('Overall performance is on track. Continue monitoring.');
            }
            
            pfmsData.predictions = {
                projectedUtilization,
                projectedCompletion,
                riskScore: Math.min(100, riskScore),
                recommendations
            };
            
            await pfmsData.save();
            
        } catch (error) {
            console.error('❌ Prediction generation failed:', error);
        }
    }
    
    // Helper: Calculate variance
    calculateVariance(numbers) {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
    }
    
    // Record a transaction
    async recordTransaction(transactionData) {
        try {
            const transaction = new PFMSTransaction({
                transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                pfmsReferenceNumber: `PFMS${Date.now()}`,
                ...transactionData
            });
            
            await transaction.save();
            console.log(`✅ Recorded transaction: ${transaction.transactionId}`);
            
            // Update PFMS data based on transaction
            await this.updatePFMSFromTransaction(transaction);
            
            return transaction;
            
        } catch (error) {
            console.error('❌ Transaction recording failed:', error);
            throw error;
        }
    }
    
    // Update PFMS data from transaction
    async updatePFMSFromTransaction(transaction) {
        const pfmsData = await PFMSData.findOne({ fiscalYear: transaction.fiscalYear });
        if (!pfmsData) return;
        
        const stateData = pfmsData.stateBreakdown.find(s => s.state === transaction.state);
        if (!stateData) return;
        
        switch (transaction.type) {
            case 'Release':
                stateData.released += transaction.amount;
                pfmsData.totalReleased += transaction.amount;
                break;
            case 'Utilization':
                stateData.utilized += transaction.amount;
                pfmsData.totalUtilized += transaction.amount;
                break;
            case 'Refund':
                stateData.utilized -= transaction.amount;
                pfmsData.totalUtilized -= transaction.amount;
                break;
        }
        
        stateData.pending = stateData.released - stateData.utilized;
        stateData.utilizationRate = stateData.released > 0 
            ? Math.round((stateData.utilized / stateData.released) * 100) 
            : 0;
        
        pfmsData.calculateRates();
        await pfmsData.save();
    }
    
    // Get PFMS dashboard data
    async getDashboardData(fiscalYear) {
        const pfmsData = await PFMSData.findOne({ fiscalYear });
        if (!pfmsData) {
            throw new Error('PFMS data not found');
        }
        
        // Get recent transactions
        const recentTransactions = await PFMSTransaction.find({ fiscalYear })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('project', 'name')
            .populate('agency', 'name');
        
        // Calculate top and bottom performing states
        const sortedStates = [...pfmsData.stateBreakdown].sort(
            (a, b) => b.utilizationRate - a.utilizationRate
        );
        
        return {
            overview: {
                totalAllocated: pfmsData.totalAllocated,
                totalReleased: pfmsData.totalReleased,
                totalUtilized: pfmsData.totalUtilized,
                totalPending: pfmsData.totalPending,
                utilizationRate: pfmsData.nationalUtilizationRate,
                releaseRate: pfmsData.nationalReleaseRate,
                healthScore: pfmsData.healthScore
            },
            componentBreakdown: pfmsData.componentBreakdown,
            quarterlyTrends: pfmsData.quarterlyData,
            topPerformers: sortedStates.slice(0, 5),
            bottomPerformers: sortedStates.slice(-5).reverse(),
            predictions: pfmsData.predictions,
            recentTransactions,
            lastSync: pfmsData.lastSyncedAt,
            syncStatus: pfmsData.syncStatus
        };
    }
    
    // Get state-specific data
    async getStateData(state, fiscalYear) {
        const pfmsData = await PFMSData.findOne({ fiscalYear });
        if (!pfmsData) {
            throw new Error('PFMS data not found');
        }
        
        const stateData = pfmsData.stateBreakdown.find(s => s.state === state);
        if (!stateData) {
            throw new Error('State data not found');
        }
        
        // Get state transactions
        const transactions = await PFMSTransaction.find({ state, fiscalYear })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('project', 'name')
            .populate('agency', 'name');
        
        return {
            stateData,
            transactions,
            nationalComparison: {
                nationalAvgUtilization: pfmsData.nationalUtilizationRate,
                stateUtilization: stateData.utilizationRate,
                ranking: pfmsData.stateBreakdown
                    .sort((a, b) => b.utilizationRate - a.utilizationRate)
                    .findIndex(s => s.state === state) + 1
            }
        };
    }
    
    // Initialize PFMS data for current fiscal year
    async initializeFiscalYear(fiscalYear) {
        const existing = await PFMSData.findOne({ fiscalYear });
        if (existing) {
            console.log(`ℹ️  PFMS data already exists for ${fiscalYear}`);
            return existing;
        }
        
        console.log(`🆕 Initializing PFMS data for ${fiscalYear}...`);
        return await this.syncPFMSData(fiscalYear);
    }
}

export default new PFMSService();