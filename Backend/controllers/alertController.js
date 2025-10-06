// Backend/controllers/alertController.js
import Alert from '../models/alertModel.js';
import alertService from '../services/alertService.js';

// Get alerts for current user
const getMyAlerts = async (req, res) => {
    try {
        let query = {
            acknowledged: false,
            autoResolved: false,
            $or: [
                { snoozedUntil: { $exists: false } },
                { snoozedUntil: { $lt: new Date() } }
            ]
        };
        
        // Filter based on role
        if (req.user.role === 'StateOfficer') {
            // State officers see alerts for their state's projects
            const Project = (await import('../models/projectModel.js')).default;
            const stateProjects = await Project.find({ state: req.user.state }).select('_id');
            query.project = { $in: stateProjects.map(p => p._id) };
        } else if (req.user.role === 'ExecutingAgency') {
            // Agencies see only their agency-specific alerts
            query.agency = req.user.agencyId;
        }
        // CentralAdmin sees all alerts
        
        const alerts = await Alert.find(query)
            .populate('project', 'name state component')
            .populate('agency', 'name')
            .sort({ severity: 1, createdAt: -1 }) // critical first
            .limit(50);
        
        // Group by severity
        const grouped = {
            critical: alerts.filter(a => a.severity === 'critical'),
            warning: alerts.filter(a => a.severity === 'warning'),
            info: alerts.filter(a => a.severity === 'info')
        };
        
        res.status(200).json({
            total: alerts.length,
            ...grouped,
            allAlerts: alerts
        });
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch alerts", error: error.message });
    }
};

// Acknowledge an alert
const acknowledgeAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        
        alert.acknowledged = true;
        alert.acknowledgedBy = req.user._id;
        alert.acknowledgedAt = new Date();
        
        await alert.save();
        
        res.status(200).json({ message: 'Alert acknowledged', alert });
    } catch (error) {
        res.status(400).json({ message: "Failed to acknowledge alert", error: error.message });
    }
};

// Snooze an alert
const snoozeAlert = async (req, res) => {
    try {
        const { days } = req.body;
        const alert = await Alert.findById(req.params.id);
        
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        
        const snoozeDate = new Date();
        snoozeDate.setDate(snoozeDate.getDate() + (days || 3));
        
        alert.snoozedUntil = snoozeDate;
        await alert.save();
        
        res.status(200).json({ message: `Alert snoozed for ${days || 3} days`, alert });
    } catch (error) {
        res.status(400).json({ message: "Failed to snooze alert", error: error.message });
    }
};

// Manually trigger alert generation (admin only)
const generateAlerts = async (req, res) => {
    try {
        if (req.user.role !== 'CentralAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const result = await alertService.generateAllAlerts();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Alert generation failed", error: error.message });
    }
};

export { getMyAlerts, acknowledgeAlert, snoozeAlert, generateAlerts };