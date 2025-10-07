// Backend/models/pfmsModel.js
import mongoose from 'mongoose';

const componentBreakdownSchema = new mongoose.Schema({
    component: {
        type: String,
        enum: ['Adarsh Gram', 'GIA', 'Hostel'],
        required: true
    },
    allocated: { type: Number, required: true, default: 0 },
    released: { type: Number, required: true, default: 0 },
    utilized: { type: Number, required: true, default: 0 },
    pending: { type: Number, required: true, default: 0 },
    projects: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 }
}, { _id: false });

const stateFinancialSchema = new mongoose.Schema({
    state: { type: String, required: true },
    allocated: { type: Number, required: true, default: 0 },
    released: { type: Number, required: true, default: 0 },
    utilized: { type: Number, required: true, default: 0 },
    pending: { type: Number, required: true, default: 0 },
    utilizationRate: { type: Number, default: 0 }, // Percentage
    releaseRate: { type: Number, default: 0 }, // Percentage
    components: [componentBreakdownSchema],
    lastSync: { type: Date, default: Date.now },
    performance: {
        type: String,
        enum: ['Excellent', 'Good', 'Average', 'Poor'],
        default: 'Average'
    }
}, { _id: false });

const pfmsTransactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['Release', 'Utilization', 'Refund', 'Adjustment'],
        required: true
    },
    amount: { type: Number, required: true },
    state: { type: String, required: true },
    component: {
        type: String,
        enum: ['Adarsh Gram', 'GIA', 'Hostel']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency'
    },
    description: { type: String },
    pfmsReferenceNumber: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Processed', 'Failed', 'Verified'],
        default: 'Processed'
    },
    fiscalYear: { type: String, required: true },
    quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'] },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const pfmsDataSchema = new mongoose.Schema({
    fiscalYear: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // National Level
    totalAllocated: { type: Number, required: true, default: 0 },
    totalReleased: { type: Number, required: true, default: 0 },
    totalUtilized: { type: Number, required: true, default: 0 },
    totalPending: { type: Number, required: true, default: 0 },
    
    // Rates
    nationalUtilizationRate: { type: Number, default: 0 },
    nationalReleaseRate: { type: Number, default: 0 },
    
    // Component-wise national breakdown
    componentBreakdown: [componentBreakdownSchema],
    
    // State-wise breakdown
    stateBreakdown: [stateFinancialSchema],
    
    // Quarterly trends
    quarterlyData: [{
        quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'] },
        released: { type: Number, default: 0 },
        utilized: { type: Number, default: 0 },
        projects: { type: Number, default: 0 }
    }],
    
    // Predictive Analytics
    predictions: {
        projectedUtilization: { type: Number },
        projectedCompletion: { type: Number },
        riskScore: { type: Number }, // 0-100
        recommendations: [{ type: String }]
    },
    
    // Sync Status
    lastSyncedAt: { type: Date, default: Date.now },
    syncStatus: {
        type: String,
        enum: ['Success', 'Partial', 'Failed', 'In Progress'],
        default: 'Success'
    },
    syncErrors: [{ type: String }],
    
    // Metadata
    isActive: { type: Boolean, default: true },
   dataSource: {
    type: String,
    enum: ['PFMS_API', 'Manual_Entry', 'Auto_Calculated', 'Real_Project_Data'], // Add 'Real_Project_Data' here
    default: 'Auto_Calculated'
},
}, { timestamps: true });

// Indexes for performance
pfmsDataSchema.index({ fiscalYear: 1, isActive: 1 });
pfmsDataSchema.index({ 'stateBreakdown.state': 1 });
pfmsTransactionSchema.index({ transactionId: 1 });
pfmsTransactionSchema.index({ state: 1, fiscalYear: 1 });
pfmsTransactionSchema.index({ createdAt: -1 });

// Virtual for overall health score
pfmsDataSchema.virtual('healthScore').get(function() {
    const utilizationScore = this.nationalUtilizationRate;
    const releaseScore = this.nationalReleaseRate;
    return Math.round((utilizationScore * 0.6) + (releaseScore * 0.4));
});

// Method to calculate utilization rate
pfmsDataSchema.methods.calculateRates = function() {
    if (this.totalReleased > 0) {
        this.nationalUtilizationRate = Math.round((this.totalUtilized / this.totalReleased) * 100);
    }
    if (this.totalAllocated > 0) {
        this.nationalReleaseRate = Math.round((this.totalReleased / this.totalAllocated) * 100);
    }
    this.totalPending = this.totalReleased - this.totalUtilized;
};

// Method to update state performance rating
pfmsDataSchema.methods.updateStatePerformance = function() {
    this.stateBreakdown.forEach(state => {
        if (state.utilizationRate >= 80) state.performance = 'Excellent';
        else if (state.utilizationRate >= 60) state.performance = 'Good';
        else if (state.utilizationRate >= 40) state.performance = 'Average';
        else state.performance = 'Poor';
    });
};

const PFMSData = mongoose.model('PFMSData', pfmsDataSchema);
const PFMSTransaction = mongoose.model('PFMSTransaction', pfmsTransactionSchema);

export { PFMSData, PFMSTransaction };
export default PFMSData;