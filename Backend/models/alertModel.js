// Backend/models/alertModel.js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    escalationLevel: {
        type: Number,
        default: 0 // 0=Normal, 1=Escalated to State, 2=Escalated to Admin
    },
    type: {
        type: String,
        required: true,
        enum: [
            // Original alert types
            'deadline_approaching',
            'inactive_project',
            'behind_schedule',
            'high_rejection_rate',
            'slow_review',
            'budget_overrun',
            'consecutive_rejections',
            'milestone_due_soon',
            'milestone_overdue',
            'milestone_reviewed',
            'utilization_reviewed',
            
            // CRITICAL: Add all escalated types
            'escalated_deadline_approaching',
            'escalated_inactive_project',
            'escalated_behind_schedule',
            'escalated_high_rejection_rate',
            'escalated_slow_review',
            'escalated_budget_overrun',
            'escalated_consecutive_rejections',
            'escalated_milestone_due_soon',
            'escalated_milestone_overdue',
            
            // Admin escalated types
            'admin_escalated_deadline_approaching',
            'admin_escalated_inactive_project',
            'admin_escalated_behind_schedule',
            'admin_escalated_high_rejection_rate',
            'admin_escalated_slow_review',
            'admin_escalated_budget_overrun',
            'admin_escalated_consecutive_rejections',
            'admin_escalated_milestone_due_soon',
            'admin_escalated_milestone_overdue'
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
        required: true,
        index: true
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
        default: false,
        index: true
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
        default: false,
        index: true
    },
    resolvedAt: {
        type: Date
    },
    snoozedUntil: {
        type: Date
    }
}, { timestamps: true });

// Compound indexes for better query performance
alertSchema.index({ recipient: 1, acknowledged: 1, autoResolved: 1 });
alertSchema.index({ project: 1, type: 1, acknowledged: 1 });
alertSchema.index({ escalationLevel: 1, acknowledged: 1, createdAt: -1 });
alertSchema.index({ createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;