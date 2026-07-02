import alertService from '../services/alertService.js';
import asyncHandler from 'express-async-handler';

// Get alerts for current user
const getMyAlerts = asyncHandler(async (req, res) => {
    const alerts = await alertService.getMyAlerts(req.user._id);
    
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
    try {
        const alert = await alertService.acknowledgeAlert(req.params.id, req.user._id);
        res.status(200).json({ message: 'Alert acknowledged', alert });
    } catch (error) {
        if (error.message === 'Alert not found') res.status(404);
        else if (error.message === 'Not authorized to acknowledge this alert') res.status(403);
        else res.status(400);
        throw error;
    }
});

// Snooze an alert
const snoozeAlert = asyncHandler(async (req, res) => {
    try {
        const { days } = req.body;
        const alert = await alertService.snoozeAlert(req.params.id, req.user._id, days);
        res.status(200).json({ message: `Alert snoozed for ${days || 3} days`, alert });
    } catch (error) {
        if (error.message === 'Alert not found') res.status(404);
        else if (error.message === 'Not authorized to snooze this alert') res.status(403);
        else res.status(400);
        throw error;
    }
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
    
    console.log('Manual escalation triggered by admin:', req.user.email);
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
    
    console.log('Manual nightly job triggered by admin:', req.user.email);
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