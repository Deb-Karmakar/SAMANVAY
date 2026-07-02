import reportService from '../services/reportService.js';

export const generateFundUtilizationReport = async (req, res) => {
    try {
        const report = await reportService.generateFundUtilizationReport(req.body);
        res.json(report);
    } catch (error) {
        console.error('Fund Utilization Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

export const generateProjectStatusReport = async (req, res) => {
    try {
        const report = await reportService.generateProjectStatusReport(req.body);
        res.json(report);
    } catch (error) {
        console.error('Project Status Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

export const generateAgencyPerformanceReport = async (req, res) => {
    try {
        const report = await reportService.generateAgencyPerformanceReport(req.body);
        res.json(report);
    } catch (error) {
        console.error('Agency Performance Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

export const generateAlertSummaryReport = async (req, res) => {
    try {
        const report = await reportService.generateAlertSummaryReport(req.body);
        res.json(report);
    } catch (error) {
        console.error('Alert Summary Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

export const generateComponentWiseReport = async (req, res) => {
    try {
        const report = await reportService.generateComponentWiseReport(req.body);
        res.json(report);
    } catch (error) {
        console.error('Component-wise Report Error:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};