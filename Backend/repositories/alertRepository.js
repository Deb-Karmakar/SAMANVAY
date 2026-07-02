import Alert from '../models/alertModel.js';

class AlertRepository {
    async create(alertData) {
        return await Alert.create(alertData);
    }

    async findMyAlerts(userId) {
        const query = {
            recipient: userId,
            acknowledged: false,
            autoResolved: false,
            $or: [
                { snoozedUntil: { $exists: false } },
                { snoozedUntil: { $lt: new Date() } }
            ]
        };

        return await Alert.find(query)
            .populate('project', 'name state component')
            .populate('agency', 'name')
            .sort({ escalationLevel: -1, severity: 1, createdAt: -1 })
            .limit(100);
    }

    async findById(id) {
        return await Alert.findById(id);
    }

    async save(alert) {
        return await alert.save();
    }
}

export default new AlertRepository();
