// Backend/models/utilizationReportModel.js

import mongoose from 'mongoose';

const utilizationReportSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    amount: { type: Number, required: true }, // Stored in the base unit (e.g., Rupees)
    certificateUrl: { type: String, required: true }, // Link to the uploaded PDF
    comments: { type: String },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['Pending Approval', 'Approved', 'Rejected'], 
        default: 'Pending Approval' 
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewComments: { type: String },
    reviewedAt: { type: Date },
}, { timestamps: true });

const UtilizationReport = mongoose.model('UtilizationReport', utilizationReportSchema);
export default UtilizationReport;