// Backend/models/communicationLogModel.js
import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['email', 'notification', 'sms'],
        required: true
    },
    event: {
        type: String,
        enum: ['project_created', 'agency_assigned', 'milestone_submitted', 'milestone_reviewed', 'project_completed'],
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        email: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    subject: String,
    status: {
        type: String,
        enum: ['sent', 'failed', 'pending'],
        default: 'pending'
    },
    attachments: [{
        filename: String,
        path: String
    }],
    metadata: mongoose.Schema.Types.Mixed,
    sentAt: Date,
    error: String
}, { timestamps: true });

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);
export default CommunicationLog;