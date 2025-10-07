// Backend/controllers/utilizationController.js

import asyncHandler from 'express-async-handler';
import puppeteer from 'puppeteer';
import UtilizationReport from '../models/utilizationReportModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import Alert from '../models/alertModel.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

// @desc    Submit a new utilization report
// @route   POST /api/utilization/submit
// @access  Private/ExecutingAgency
export const submitUtilizationReport = asyncHandler(async (req, res) => {
    const { projectId, amount, comments } = req.body;

    // 1. Validate input
    if (!projectId || !amount || !req.file) {
        res.status(400);
        throw new Error('Project, amount, and certificate file are required.');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // 2. Create and save the new report
    const newReport = await UtilizationReport.create({
        project: projectId,
        agency: req.user.agencyId,
        amount: Number(amount) * 100000, // Convert Lakhs to Rupees
        comments,
        certificateUrl: `/${req.file.path}`, // Path provided by multer
        submittedBy: req.user._id,
    });

    // 3. Send email notification to State Officer
    const stateOfficer = await User.findOne({ role: 'StateOfficer', state: project.state });
    if (stateOfficer) {
        const emailContent = emailTemplates.utilizationReportSubmitted(
            stateOfficer.fullName,
            req.user.agencyName,
            project.name,
            newReport.amount,
            newReport._id
        );
        await sendEmail({ to: stateOfficer.email, ...emailContent });
    }

    // 4. Generate a PDF receipt for the agency
    const receiptHTML = `
        <h1>Submission Receipt</h1>
        <p><strong>Report ID:</strong> ${newReport._id}</p>
        <p><strong>Project:</strong> ${project.name}</p>
        <p><strong>Amount:</strong> ₹${(newReport.amount / 100000).toFixed(2)} Lakhs</p>
        <p><strong>Status:</strong> ${newReport.status}</p>
        <p>Submitted on ${newReport.createdAt.toLocaleString('en-IN')}. Your report is now pending review.</p>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(receiptHTML);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // 5. Send the PDF receipt back to the user
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt-${newReport._id}.pdf`);
    res.send(pdfBuffer);
});

// Backend/controllers/utilizationController.js (Add these functions)

// ... (keep the existing submitUtilizationReport function)

// @desc    Get pending utilization reports for the state officer
// @route   GET /api/utilization/pending
// @access  Private/StateOfficer
export const getPendingReportsForState = asyncHandler(async (req, res) => {
    const reports = await UtilizationReport.find({ status: 'Pending Approval' })
        .populate({
            path: 'project',
            select: 'name state',
            match: { state: req.user.state } // Ensure we only get reports for the officer's state
        })
        .populate('agency', 'name')
        .sort({ createdAt: -1 });

    // The populate match returns null for projects not in the state, so we filter them out.
    const filteredReports = reports.filter(report => report.project !== null);

    res.json(filteredReports);
});

// @desc    Review (approve/reject) a utilization report
// @route   PUT /api/utilization/:id/review
// @access  Private/StateOfficer
// In Backend/controllers/utilizationController.js

export const reviewUtilizationReport = asyncHandler(async (req, res) => {
    const { status, reviewComments } = req.body; // status should be 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Must be "Approved" or "Rejected".');
    }

    const report = await UtilizationReport.findById(req.params.id)
        .populate('project', 'name state')
        .populate('agency', 'name')
        .populate('submittedBy', 'email _id'); // Ensure we get the _id for the recipient

    if (!report) {
        res.status(404);
        throw new Error('Report not found.');
    }

    // Authorization check: ensure the officer belongs to the project's state
    if (report.project.state !== req.user.state) {
        res.status(403);
        throw new Error('Not authorized to review this report.');
    }
    
    // Update the report
    report.status = status;
    report.reviewComments = reviewComments;
    report.reviewedBy = req.user._id;
    report.reviewedAt = Date.now();
    const updatedReport = await report.save();
    
    // Send notifications back to the submitting agency
    if (report.submittedBy && report.submittedBy.email) {
        
        // --- ADDED: Create an in-app alert for the agency ---
        await Alert.create({
            recipient: report.submittedBy._id,
            type: 'utilization_reviewed',
            severity: 'info',
            project: report.project._id,
            agency: report.agency._id,
            message: `Your utilization report of ₹${(report.amount / 100000).toFixed(2)} Lakhs for "${report.project.name}" has been ${report.status}.`,
            metadata: { status: report.status, comments: reviewComments }
        });

        // --- Send email notification (your existing logic) ---
        const emailContent = emailTemplates.utilizationReportReviewed(
            report.agency.name,
            report.project.name,
            report.amount,
            report.status,
            report.reviewComments
        );
        await sendEmail({ to: report.submittedBy.email, ...emailContent });
    }

    res.json(updatedReport);
});