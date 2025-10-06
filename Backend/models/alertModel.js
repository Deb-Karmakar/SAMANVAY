// Backend/models/alertModel.js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'deadline_approaching',
            'inactive_project',
            'behind_schedule',
            'high_rejection_rate',
            'slow_review',
            'budget_overrun',
            'milestone_overdue',
            'consecutive_rejections'
        ]
    },
    severity: {
        type: String,
        required: true,
        enum: ['critical', 'warning', 'info'],
        default: 'info'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency'
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    acknowledged: {
        type: Boolean,
        default: false
    },
    acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    acknowledgedAt: {
        type: Date
    },
    autoResolved: {
        type: Boolean,
        default: false
    },
    resolvedAt: {
        type: Date
    },
    snoozedUntil: {
        type: Date
    }
}, { timestamps: true });

// Index for faster queries
alertSchema.index({ project: 1, severity: 1, acknowledged: 1 });
alertSchema.index({ createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;