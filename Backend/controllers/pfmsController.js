// Backend/controllers/pfmsController.js
import asyncHandler from 'express-async-handler';
import pfmsService from '../services/pfmsService.js';
import { PFMSData, PFMSTransaction } from '../models/pfmsModel.js';

// @desc   Get PFMS dashboard data
// @route  GET /api/pfms/dashboard
// @access Private (Admin)
// @desc   Get PFMS dashboard data
// @route  GET /api/pfms/dashboard
// @access Private (Admin)
const getDashboard = asyncHandler(async (req, res) => {
    const fiscalYear = req.query.fiscalYear || '2024-25';
    
    // Check if PFMS data exists
    let pfmsData = await PFMSData.findOne({ fiscalYear });
    
    // If no data exists, initialize it automatically
    if (!pfmsData) {
        console.log(`⚠️ No PFMS data found for ${fiscalYear}. Initializing...`);
        try {
            pfmsData = await pfmsService.syncPFMSData(fiscalYear);
            console.log(`✅ PFMS data initialized for ${fiscalYear}`);
        } catch (error) {
            console.error('❌ Failed to initialize PFMS data:', error);
            res.status(500);
            throw new Error('Failed to initialize PFMS data. Please try the Sync button.');
        }
    }
    
    const dashboardData = await pfmsService.getDashboardData(fiscalYear);
    
    res.status(200).json(dashboardData);
});

// @desc   Get state-specific PFMS data
// @route  GET /api/pfms/state/:state
// @access Private (Admin, State Officer)
const getStateData = asyncHandler(async (req, res) => {
    const { state } = req.params;
    const fiscalYear = req.query.fiscalYear || '2024-25';
    
    // If user is state officer, verify they can only access their state
    if (req.user.role === 'StateOfficer' && req.user.state !== state) {
        res.status(403);
        throw new Error('Not authorized to view this state data');
    }
    
    const stateData = await pfmsService.getStateData(state, fiscalYear);
    
    res.status(200).json(stateData);
});

// @desc   Sync PFMS data from mock API
// @route  POST /api/pfms/sync
// @access Private (Admin only)
const syncPFMSData = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Only admins can trigger PFMS sync');
    }
    
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
        res.status(400);
        throw new Error('Fiscal year is required');
    }
    
    const pfmsData = await pfmsService.syncPFMSData(fiscalYear);
    
    res.status(200).json({
        message: 'PFMS data synced successfully',
        data: pfmsData
    });
});

// @desc   Sync PFMS with actual project data
// @route  POST /api/pfms/sync-projects
// @access Private (Admin only)
const syncWithProjects = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Only admins can trigger project sync');
    }
    
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
        res.status(400);
        throw new Error('Fiscal year is required');
    }
    
    const pfmsData = await pfmsService.syncWithProjectData(fiscalYear);
    
    res.status(200).json({
        message: 'PFMS synced with project data successfully',
        data: pfmsData
    });
});

// @desc   Record a transaction
// @route  POST /api/pfms/transaction
// @access Private (Admin, State Officer)
const recordTransaction = asyncHandler(async (req, res) => {
    const { type, amount, state, component, project, agency, description, fiscalYear } = req.body;
    
    // Validate required fields
    if (!type || !amount || !state || !fiscalYear) {
        res.status(400);
        throw new Error('Missing required fields');
    }
    
    // State officers can only create transactions for their state
    if (req.user.role === 'StateOfficer' && req.user.state !== state) {
        res.status(403);
        throw new Error('Not authorized to create transaction for this state');
    }
    
    const transaction = await pfmsService.recordTransaction({
        type,
        amount,
        state,
        component,
        project,
        agency,
        description,
        fiscalYear,
        quarter: getQuarter(new Date())
    });
    
    res.status(201).json({
        message: 'Transaction recorded successfully',
        transaction
    });
});

// @desc   Get all transactions with filters
// @route  GET /api/pfms/transactions
// @access Private (Admin, State Officer)
const getTransactions = asyncHandler(async (req, res) => {
    const { fiscalYear, state, type, component, limit = 50, page = 1 } = req.query;
    
    const query = {};
    
    if (fiscalYear) query.fiscalYear = fiscalYear;
    if (type) query.type = type;
    if (component) query.component = component;
    
    // State officers can only view their state transactions
    if (req.user.role === 'StateOfficer') {
        query.state = req.user.state;
    } else if (state) {
        query.state = state;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await PFMSTransaction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('project', 'name component')
        .populate('agency', 'name');
    
    const total = await PFMSTransaction.countDocuments(query);
    
    res.status(200).json({
        transactions,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            limit: parseInt(limit)
        }
    });
});

// @desc   Get component-wise breakdown
// @route  GET /api/pfms/components
// @access Private (Admin, State Officer)
const getComponentBreakdown = asyncHandler(async (req, res) => {
    const { fiscalYear, state } = req.query;
    
    const pfmsData = await PFMSData.findOne({ fiscalYear: fiscalYear || '2024-25' });
    
    if (!pfmsData) {
        res.status(404);
        throw new Error('PFMS data not found');
    }
    
    let componentData;
    
    if (state) {
        // Get state-specific component breakdown
        const stateData = pfmsData.stateBreakdown.find(s => s.state === state);
        if (!stateData) {
            res.status(404);
            throw new Error('State data not found');
        }
        componentData = stateData.components;
    } else {
        // Get national component breakdown
        componentData = pfmsData.componentBreakdown;
    }
    
    res.status(200).json(componentData);
});

// @desc   Get quarterly trends
// @route  GET /api/pfms/quarterly
// @access Private (Admin)
const getQuarterlyTrends = asyncHandler(async (req, res) => {
    const { fiscalYear } = req.query;
    
    const pfmsData = await PFMSData.findOne({ fiscalYear: fiscalYear || '2024-25' });
    
    if (!pfmsData) {
        res.status(404);
        throw new Error('PFMS data not found');
    }
    
    res.status(200).json({
        quarterlyData: pfmsData.quarterlyData,
        predictions: pfmsData.predictions
    });
});

// @desc   Get comparative state analysis
// @route  GET /api/pfms/states/comparison
// @access Private (Admin)
const getStateComparison = asyncHandler(async (req, res) => {
    const { fiscalYear } = req.query;
    
    const pfmsData = await PFMSData.findOne({ fiscalYear: fiscalYear || '2024-25' });
    
    if (!pfmsData) {
        res.status(404);
        throw new Error('PFMS data not found');
    }
    
    // Sort states by utilization rate
    const sortedStates = [...pfmsData.stateBreakdown].sort(
        (a, b) => b.utilizationRate - a.utilizationRate
    );
    
    // Calculate statistics
    const utilizationRates = pfmsData.stateBreakdown.map(s => s.utilizationRate);
    const avgUtilization = utilizationRates.reduce((a, b) => a + b, 0) / utilizationRates.length;
    const maxUtilization = Math.max(...utilizationRates);
    const minUtilization = Math.min(...utilizationRates);
    
    // Group by performance
    const performanceGroups = {
        Excellent: sortedStates.filter(s => s.performance === 'Excellent'),
        Good: sortedStates.filter(s => s.performance === 'Good'),
        Average: sortedStates.filter(s => s.performance === 'Average'),
        Poor: sortedStates.filter(s => s.performance === 'Poor')
    };
    
    res.status(200).json({
        sortedStates,
        statistics: {
            avgUtilization: Math.round(avgUtilization),
            maxUtilization,
            minUtilization,
            variance: pfmsService.calculateVariance(utilizationRates)
        },
        performanceGroups: {
            Excellent: performanceGroups.Excellent.length,
            Good: performanceGroups.Good.length,
            Average: performanceGroups.Average.length,
            Poor: performanceGroups.Poor.length
        },
        topPerformers: sortedStates.slice(0, 10),
        needsAttention: sortedStates.filter(s => s.performance === 'Poor')
    });
});

// @desc   Initialize PFMS for new fiscal year
// @route  POST /api/pfms/initialize
// @access Private (Admin only)
const initializeFiscalYear = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Only admins can initialize fiscal year');
    }
    
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
        res.status(400);
        throw new Error('Fiscal year is required');
    }
    
    const pfmsData = await pfmsService.initializeFiscalYear(fiscalYear);
    
    res.status(201).json({
        message: 'Fiscal year initialized successfully',
        data: pfmsData
    });
});

// @desc   Get PFMS health check
// @route  GET /api/pfms/health
// @access Private (Admin)
const getHealthCheck = asyncHandler(async (req, res) => {
    const { fiscalYear } = req.query;
    
    const pfmsData = await PFMSData.findOne({ fiscalYear: fiscalYear || '2024-25' });
    
    if (!pfmsData) {
        res.status(404);
        throw new Error('PFMS data not found');
    }
    
    const criticalStates = pfmsData.stateBreakdown.filter(s => s.performance === 'Poor');
    const pendingAmount = pfmsData.totalPending;
    const utilizationGap = pfmsData.totalReleased - pfmsData.totalUtilized;
    
    const issues = [];
    
    if (pfmsData.nationalUtilizationRate < 50) {
        issues.push({
            severity: 'critical',
            message: 'National utilization rate is below 50%',
            value: pfmsData.nationalUtilizationRate
        });
    }
    
    if (criticalStates.length > 5) {
        issues.push({
            severity: 'warning',
            message: `${criticalStates.length} states showing poor performance`,
            states: criticalStates.map(s => s.state)
        });
    }
    
    if (utilizationGap > pfmsData.totalAllocated * 0.3) {
        issues.push({
            severity: 'warning',
            message: 'Large gap between released and utilized funds',
            gap: utilizationGap
        });
    }
    
    res.status(200).json({
        healthScore: pfmsData.healthScore,
        status: pfmsData.healthScore >= 70 ? 'Healthy' : pfmsData.healthScore >= 50 ? 'Warning' : 'Critical',
        issues,
        recommendations: pfmsData.predictions?.recommendations || [],
        lastSync: pfmsData.lastSyncedAt,
        syncStatus: pfmsData.syncStatus
    });
});

// @desc   Export PFMS report
// @route  GET /api/pfms/export
// @access Private (Admin)
// @desc   Export PFMS report
// @route  GET /api/pfms/export
// @access Private (Admin)
const exportReport = asyncHandler(async (req, res) => {
    const { fiscalYear, format = 'csv', type = 'full' } = req.query;
    
    const pfmsData = await PFMSData.findOne({ fiscalYear: fiscalYear || '2024-25' });
    
    if (!pfmsData) {
        res.status(404);
        throw new Error('PFMS data not found');
    }
    
    if (format === 'csv') {
        let csv;
        
        if (type === 'states') {
            csv = generateStateCSV(pfmsData);
        } else if (type === 'components') {
            csv = generateComponentCSV(pfmsData);
        } else if (type === 'quarterly') {
            csv = generateQuarterlyCSV(pfmsData);
        } else {
            csv = generateFullCSV(pfmsData);
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=pfms-${type}-report-${fiscalYear}.csv`);
        res.status(200).send(csv);
    } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=pfms-report-${fiscalYear}.json`);
        res.status(200).json(pfmsData);
    } else {
        res.status(400);
        throw new Error('Invalid format. Use csv or json');
    }
});

// Helper function to generate full CSV report
const generateFullCSV = (pfmsData) => {
    const headers = 'State,Allocated,Released,Utilized,Pending,Utilization Rate,Release Rate,Performance\n';
    
    const rows = pfmsData.stateBreakdown.map(state => {
        return `"${state.state}",${state.allocated},${state.released},${state.utilized},${state.pending},${state.utilizationRate}%,${state.releaseRate}%,${state.performance}`;
    }).join('\n');
    
    // Add summary at the top
    const summary = `PFMS Report - Fiscal Year ${pfmsData.fiscalYear}\n` +
                   `Generated on: ${new Date().toLocaleString()}\n` +
                   `Total Allocated: ${pfmsData.totalAllocated}\n` +
                   `Total Released: ${pfmsData.totalReleased}\n` +
                   `Total Utilized: ${pfmsData.totalUtilized}\n` +
                   `National Utilization Rate: ${pfmsData.nationalUtilizationRate}%\n\n`;
    
    return summary + headers + rows;
};

// Helper function for state-wise CSV
const generateStateCSV = (pfmsData) => {
    return generateFullCSV(pfmsData);
};

// Helper function for component-wise CSV
const generateComponentCSV = (pfmsData) => {
    const headers = 'Component,Allocated,Released,Utilized,Pending,Projects,Completed Projects\n';
    
    const rows = pfmsData.componentBreakdown.map(comp => {
        return `"${comp.component}",${comp.allocated},${comp.released},${comp.utilized},${comp.pending},${comp.projects},${comp.completedProjects}`;
    }).join('\n');
    
    const summary = `Component-wise PFMS Report - Fiscal Year ${pfmsData.fiscalYear}\n` +
                   `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    return summary + headers + rows;
};

// Helper function for quarterly CSV
const generateQuarterlyCSV = (pfmsData) => {
    const headers = 'Quarter,Released,Utilized,Projects\n';
    
    const rows = pfmsData.quarterlyData.map(q => {
        return `${q.quarter},${q.released},${q.utilized},${q.projects}`;
    }).join('\n');
    
    const summary = `Quarterly PFMS Report - Fiscal Year ${pfmsData.fiscalYear}\n` +
                   `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    return summary + headers + rows;
};
// Helper function to get current quarter
const getQuarter = (date) => {
    const month = date.getMonth();
    if (month < 3) return 'Q1';
    if (month < 6) return 'Q2';
    if (month < 9) return 'Q3';
    return 'Q4';
};

// Helper function to generate CSV report
const generateCSVReport = (pfmsData) => {
    const headers = 'State,Allocated,Released,Utilized,Pending,Utilization Rate,Release Rate,Performance\n';
    
    const rows = pfmsData.stateBreakdown.map(state => {
        return `${state.state},${state.allocated},${state.released},${state.utilized},${state.pending},${state.utilizationRate}%,${state.releaseRate}%,${state.performance}`;
    }).join('\n');
    
    return headers + rows;
};

const syncRealData = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Only admins can trigger PFMS sync');
    }
    
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
        res.status(400);
        throw new Error('Fiscal year is required');
    }
    
    const pfmsData = await pfmsService.syncRealPFMSData(fiscalYear);
    
    res.status(200).json({
        message: 'PFMS synced with real project data successfully',
        data: pfmsData
    });
});



export {
    getDashboard,
    getStateData,
    syncPFMSData,
    syncWithProjects,
    recordTransaction,
    getTransactions,
    getComponentBreakdown,
    getQuarterlyTrends,
    getStateComparison,
    initializeFiscalYear,
    getHealthCheck,
    exportReport,
    syncRealData,
    generateFullCSV,
    generateStateCSV,
    generateComponentCSV,
    generateQuarterlyCSV,
    generateCSVReport
};