// Backend/controllers/alertController.js
import Alert from '../models/alertModel.js';
import alertService from '../services/alertService.js';
import asyncHandler from 'express-async-handler';

// Get alerts for current user
const getMyAlerts = asyncHandler(async (req, res) => {
    const query = {
        recipient: req.user._id,
        acknowledged: false,
        autoResolved: false,
        $or: [
            { snoozedUntil: { $exists: false } },
            { snoozedUntil: { $lt: new Date() } }
        ]
    };

    const alerts = await Alert.find(query)
        .populate('project', 'name state component')
        .populate('agency', 'name')
        .sort({ escalationLevel: -1, severity: 1, createdAt: -1 })
        .limit(100);
    
    // Group by severity and escalation
    const grouped = {
        critical: alerts.filter(a => a.severity === 'critical'),
        warning: alerts.filter(a => a.severity === 'warning'),
        info: alerts.filter(a => a.severity === 'info'),
        escalated: alerts.filter(a => a.escalationLevel > 0)
    };
    
    res.status(200).json({
        total: alerts.length,
        ...grouped,
        allAlerts: alerts
    });
});

// Acknowledge an alert
const acknowledgeAlert = asyncHandler(async (req, res) => {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
        res.status(404);
        throw new Error('Alert not found');
    }
    
    // Check authorization
    if (alert.recipient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to acknowledge this alert');
    }
    
    alert.acknowledged = true;
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();
    
    await alert.save();
    
    res.status(200).json({ message: 'Alert acknowledged', alert });
});

// Snooze an alert
const snoozeAlert = asyncHandler(async (req, res) => {
    const { days } = req.body;
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
        res.status(404);
        throw new Error('Alert not found');
    }
    
    // Check authorization
    if (alert.recipient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to snooze this alert');
    }
    
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + (days || 3));
    
    alert.snoozedUntil = snoozeDate;
    await alert.save();
    
    res.status(200).json({ 
        message: `Alert snoozed for ${days || 3} days`, 
        alert 
    });
});

// Manually trigger alert generation (admin only)
const generateAlerts = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Not authorized');
    }
    
    const result = await alertService.generateAllAlerts();
    res.status(200).json(result);
});

// NEW: Manually trigger escalation (admin only) - FOR TESTING
const triggerEscalation = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Not authorized');
    }
    
    console.log('🧪 Manual escalation triggered by admin:', req.user.email);
    await alertService.escalateOldAlerts();
    
    const stats = await alertService.getEscalationStats();
    
    res.status(200).json({
        success: true,
        message: 'Escalation process completed',
        stats
    });
});

// NEW: Run full nightly job manually (admin only) - FOR TESTING
const runNightlyJob = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Not authorized');
    }
    
    console.log('🌙 Manual nightly job triggered by admin:', req.user.email);
    const result = await alertService.runNightlyJob();
    
    res.status(200).json(result);
});

// NEW: Get escalation statistics (admin only)
const getEscalationStats = asyncHandler(async (req, res) => {
    if (req.user.role !== 'CentralAdmin') {
        res.status(403);
        throw new Error('Not authorized');
    }
    
    const stats = await alertService.getEscalationStats();
    res.status(200).json(stats);
});

export { 
    getMyAlerts, 
    acknowledgeAlert, 
    snoozeAlert, 
    generateAlerts,
    triggerEscalation,
    runNightlyJob,
    getEscalationStats
};