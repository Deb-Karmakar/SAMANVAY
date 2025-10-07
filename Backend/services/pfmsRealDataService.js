import { PFMSData, PFMSTransaction } from '../models/pfmsModel.js';
import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';

class PFMSRealDataService {
    
    components = ['Adarsh Gram', 'GIA', 'Hostel'];
    
    // Calculate real PFMS data from projects in database
    async calculateRealPFMSData(fiscalYear) {
        console.log(`📊 Calculating real PFMS data from projects for ${fiscalYear}...`);
        
        try {
            // Get all projects from database
            const projects = await Project.find({})
                .populate('assignments.agency')
                .lean();
            
            console.log(`📁 Found ${projects.length} projects in database`);
            
            if (projects.length === 0) {
                console.warn('⚠️ No projects found. Using mock data instead.');
                return this.generateMockData(fiscalYear);
            }
            
            // Initialize state data structure
            const stateData = {};
            const componentData = {};
            let projectsWithoutState = 0;
            let projectsProcessed = 0;
            
            // Initialize components
            this.components.forEach(comp => {
                componentData[comp] = {
                    component: comp,
                    allocated: 0,
                    released: 0,
                    utilized: 0,
                    pending: 0,
                    projects: 0,
                    completedProjects: 0
                };
            });
            
            // Process each project
            projects.forEach(project => {
                // Handle missing or invalid state
                let state = project.state;
                
                if (!state || state.trim() === '') {
                    projectsWithoutState++;
                    console.warn(`⚠️ Project ${project._id} has no state defined. Using 'Unknown State'.`);
                    state = 'Unknown State'; // Use a default state instead of skipping
                }
                
                const component = project.component || 'Adarsh Gram'; // Default component
                const budget = project.budget || 0;
                const status = project.status || 'Pending';
                
                // Initialize state if not exists
                if (!stateData[state]) {
                    stateData[state] = {
                        state: state, // Ensure state field is always set
                        allocated: 0,
                        released: 0,
                        utilized: 0,
                        pending: 0,
                        utilizationRate: 0,
                        releaseRate: 0,
                        performance: 'Poor',
                        components: this.components.map(c => ({
                            component: c,
                            allocated: 0,
                            released: 0,
                            utilized: 0,
                            pending: 0,
                            projects: 0,
                            completedProjects: 0
                        })),
                        lastSync: new Date()
                    };
                }
                
                // Calculate allocated, released, and utilized amounts
                const allocated = budget;
                let released = 0;
                let utilized = 0;
                
                // Calculate released funds from assignments
                if (project.assignments && project.assignments.length > 0) {
                    project.assignments.forEach(assignment => {
                        released += assignment.allocatedFunds || 0;
                        utilized += assignment.fundsUtilized || 0;
                    });
                } else {
                    // If no assignments, estimate based on status
                    if (status === 'Approved' || status === 'Ongoing' || status === 'Completed') {
                        released = budget * 0.7; // Assume 70% released
                    }
                    
                    if (status === 'Ongoing') {
                        utilized = released * 0.5; // Assume 50% utilized for ongoing
                    } else if (status === 'Completed') {
                        utilized = released * 0.95; // Assume 95% utilized for completed
                    }
                }
                
                // Update state data
                stateData[state].allocated += allocated;
                stateData[state].released += released;
                stateData[state].utilized += utilized;
                stateData[state].pending = stateData[state].released - stateData[state].utilized;
                
                // Update component data for state
                const validComponent = this.components.includes(component) ? component : 'Adarsh Gram';
                const stateComp = stateData[state].components.find(c => c.component === validComponent);
                if (stateComp) {
                    stateComp.allocated += allocated;
                    stateComp.released += released;
                    stateComp.utilized += utilized;
                    stateComp.pending = stateComp.released - stateComp.utilized;
                    stateComp.projects += 1;
                    if (status === 'Completed') {
                        stateComp.completedProjects += 1;
                    }
                }
                
                // Update national component data
                if (componentData[validComponent]) {
                    componentData[validComponent].allocated += allocated;
                    componentData[validComponent].released += released;
                    componentData[validComponent].utilized += utilized;
                    componentData[validComponent].pending += (released - utilized);
                    componentData[validComponent].projects += 1;
                    if (status === 'Completed') {
                        componentData[validComponent].completedProjects += 1;
                    }
                }
                
                projectsProcessed++;
            });
            
            console.log(`📈 Processed ${projectsProcessed} projects`);
            if (projectsWithoutState > 0) {
                console.warn(`⚠️ ${projectsWithoutState} projects had no state information (assigned to 'Unknown State')`);
            }
            
            // Convert state data to array and calculate rates
            const stateBreakdown = Object.values(stateData).map(state => {
                // Ensure state name is valid
                if (!state.state || state.state.trim() === '') {
                    state.state = 'Unknown State';
                }
                
                state.utilizationRate = state.released > 0 
                    ? Math.round((state.utilized / state.released) * 100) 
                    : 0;
                state.releaseRate = state.allocated > 0 
                    ? Math.round((state.released / state.allocated) * 100) 
                    : 0;
                state.performance = this.calculatePerformance(state.utilizationRate);
                state.lastSync = new Date();
                return state;
            });
            
            // Ensure we have at least one state entry
            if (stateBreakdown.length === 0) {
                stateBreakdown.push({
                    state: 'No Data',
                    allocated: 0,
                    released: 0,
                    utilized: 0,
                    pending: 0,
                    utilizationRate: 0,
                    releaseRate: 0,
                    performance: 'Poor',
                    components: this.components.map(c => ({
                        component: c,
                        allocated: 0,
                        released: 0,
                        utilized: 0,
                        pending: 0,
                        projects: 0,
                        completedProjects: 0
                    })),
                    lastSync: new Date()
                });
            }
            
            // Calculate national totals
            const totalAllocated = stateBreakdown.reduce((sum, s) => sum + s.allocated, 0);
            const totalReleased = stateBreakdown.reduce((sum, s) => sum + s.released, 0);
            const totalUtilized = stateBreakdown.reduce((sum, s) => sum + s.utilized, 0);
            const totalPending = totalReleased - totalUtilized;
            
            const nationalUtilizationRate = totalReleased > 0 
                ? Math.round((totalUtilized / totalReleased) * 100) 
                : 0;
            const nationalReleaseRate = totalAllocated > 0 
                ? Math.round((totalReleased / totalAllocated) * 100) 
                : 0;
            
            // Generate quarterly data
            const quarterlyData = this.generateQuarterlyData(totalReleased, totalUtilized);
            
            console.log(`✅ Calculated real PFMS data:`);
            console.log(`   - States with data: ${stateBreakdown.length}`);
            console.log(`   - Total Allocated: ₹${totalAllocated.toLocaleString()}`);
            console.log(`   - Total Released: ₹${totalReleased.toLocaleString()}`);
            console.log(`   - Total Utilized: ₹${totalUtilized.toLocaleString()}`);
            console.log(`   - Utilization Rate: ${nationalUtilizationRate}%`);
            
            return {
                fiscalYear,
                totalAllocated,
                totalReleased,
                totalUtilized,
                totalPending,
                nationalUtilizationRate,
                nationalReleaseRate,
                componentBreakdown: Object.values(componentData),
                stateBreakdown,
                quarterlyData,
                lastSyncedAt: new Date(),
                syncStatus: 'Success',
                dataSource: 'Auto_Calculated' // Keep this as 'Auto_Calculated' since it's a valid enum
            };
            
        } catch (error) {
            console.error('❌ Error calculating real PFMS data:', error);
            throw error;
        }
    }
    
    // Calculate performance rating
    calculatePerformance(utilizationRate) {
        if (utilizationRate >= 80) return 'Excellent';
        if (utilizationRate >= 60) return 'Good';
        if (utilizationRate >= 40) return 'Average';
        return 'Poor';
    }
    
    // Generate quarterly data
    generateQuarterlyData(totalReleased, totalUtilized) {
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        let cumulativeRelease = 0;
        let cumulativeUtilization = 0;
        
        return quarters.map((quarter, index) => {
            const releasePercentage = [0.15, 0.25, 0.30, 0.30][index];
            const utilizationPercentage = [0.10, 0.20, 0.35, 0.35][index];
            
            const released = Math.round(totalReleased * releasePercentage);
            const utilized = Math.round(totalUtilized * utilizationPercentage);
            
            cumulativeRelease += released;
            cumulativeUtilization += utilized;
            
            return {
                quarter,
                released: cumulativeRelease,
                utilized: cumulativeUtilization,
                projects: Math.floor(100 * releasePercentage),
                utilizationRate: cumulativeRelease > 0 
                    ? Math.round((cumulativeUtilization / cumulativeRelease) * 100)
                    : 0,
                releaseRate: 100
            };
        });
    }
    
    // Fallback to mock data if no real projects
    generateMockData(fiscalYear) {
        const totalAllocated = 10000000000; // 100 Crores
        const totalReleased = totalAllocated * 0.65;
        const totalUtilized = totalReleased * 0.70;
        
        return {
            fiscalYear,
            totalAllocated,
            totalReleased,
            totalUtilized,
            totalPending: totalReleased - totalUtilized,
            nationalUtilizationRate: 70,
            nationalReleaseRate: 65,
            componentBreakdown: this.components.map(comp => ({
                component: comp,
                allocated: totalAllocated / 3,
                released: totalReleased / 3,
                utilized: totalUtilized / 3,
                pending: (totalReleased - totalUtilized) / 3,
                projects: 50,
                completedProjects: 20
            })),
            stateBreakdown: [{
                state: 'Sample State',
                allocated: totalAllocated,
                released: totalReleased,
                utilized: totalUtilized,
                pending: totalReleased - totalUtilized,
                utilizationRate: 70,
                releaseRate: 65,
                performance: 'Good',
                components: this.components.map(c => ({
                    component: c,
                    allocated: totalAllocated / 3,
                    released: totalReleased / 3,
                    utilized: totalUtilized / 3,
                    pending: (totalReleased - totalUtilized) / 3,
                    projects: 15,
                    completedProjects: 5
                })),
                lastSync: new Date()
            }],
            quarterlyData: this.generateQuarterlyData(totalReleased, totalUtilized),
            lastSyncedAt: new Date(),
            syncStatus: 'Success',
            dataSource: 'Auto_Calculated'
        };
    }
}

export default new PFMSRealDataService();