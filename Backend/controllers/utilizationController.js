import asyncHandler from 'express-async-handler';
import utilizationService from '../services/utilizationService.js';

export const submitUtilizationReport = asyncHandler(async (req, res) => {
    const { projectId, amount, comments } = req.body;

    if (!projectId || !amount || !req.file) {
        res.status(400);
        throw new Error('Project, amount, and certificate file are required.');
    }

    const { newReport, pdfBuffer } = await utilizationService.submitUtilizationReport({
        projectId,
        amount,
        comments,
        filePath: req.file.path,
        user: req.user
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt-${newReport._id}.pdf`);
    res.send(pdfBuffer);
});

export const getPendingReportsForState = asyncHandler(async (req, res) => {
    const reports = await utilizationService.getPendingReportsForState(req.user.state);
    res.json(reports);
});

export const reviewUtilizationReport = asyncHandler(async (req, res) => {
    const updatedReport = await utilizationService.reviewUtilizationReport(
        req.params.id,
        req.body,
        req.user
    );
    res.json(updatedReport);
});