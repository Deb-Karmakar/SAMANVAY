import dashboardService from '../services/dashboardService.js';

// ============================================
// ADMIN DASHBOARD ENDPOINTS
// ============================================
export const getAdminStats = async (req, res) => {
    try {
        const stats = await dashboardService.getAdminStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getProjectStatusChartData = async (req, res) => {
    try {
        const chartData = await dashboardService.getProjectStatusChartData();
        res.json(chartData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const activities = await dashboardService.getRecentActivity();
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getStatePerformance = async (req, res) => {
    try {
        const stateData = await dashboardService.getStatePerformance();
        res.json(stateData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getBudgetTrends = async (req, res) => {
    try {
        const trends = await dashboardService.getBudgetTrends();
        res.json(trends);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getComponentBreakdown = async (req, res) => {
    try {
        const componentData = await dashboardService.getComponentBreakdown();
        res.json(componentData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getTopAgencies = async (req, res) => {
    try {
        const topAgencies = await dashboardService.getTopAgencies();
        res.json(topAgencies);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ============================================
// STATE DASHBOARD ENDPOINTS
// ============================================
export const getStateStats = async (req, res) => {
    try {
        const { state } = req.query;
        const stats = await dashboardService.getStateStats(state);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getPendingApprovals = async (req, res) => {
    try {
        const { state } = req.query;
        const approvals = await dashboardService.getPendingApprovals(state);
        res.json(approvals);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getDistrictBreakdown = async (req, res) => {
    try {
        const { state } = req.query;
        const breakdown = await dashboardService.getDistrictBreakdown(state);
        res.json(breakdown);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ============================================
// AGENCY DASHBOARD ENDPOINTS
// ============================================
export const getAgencyStats = async (req, res) => {
    try {
        const stats = await dashboardService.getAgencyStats(req.user.agencyId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getUpcomingDeadlines = async (req, res) => {
    try {
        const deadlines = await dashboardService.getUpcomingDeadlines(req.user.agencyId);
        res.json(deadlines);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getAgencyBudget = async (req, res) => {
    try {
        const budget = await dashboardService.getAgencyBudget(req.user.agencyId);
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};