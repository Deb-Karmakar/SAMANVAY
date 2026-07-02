import utilizationRepository from '../repositories/utilizationRepository.js';
import projectRepository from '../repositories/projectRepository.js';
import userRepository from '../repositories/userRepository.js';
import alertRepository from '../repositories/alertRepository.js';
import { sendEmail, emailTemplates } from './emailService.js';
import puppeteer from 'puppeteer';

class UtilizationService {
    async submitUtilizationReport(data) {
        const { projectId, amount, comments, filePath, user } = data;

        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        const newReport = await utilizationRepository.create({
            project: projectId,
            agency: user.agencyId,
            amount: Number(amount) * 100000,
            comments,
            certificateUrl: `/${filePath}`,
            submittedBy: user._id,
        });

        const stateOfficer = await userRepository.findByRoleAndState('StateOfficer', project.state);
        if (stateOfficer) {
            const emailContent = emailTemplates.utilizationReportSubmitted(
                stateOfficer.fullName,
                user.agencyName,
                project.name,
                newReport.amount,
                newReport._id
            );
            await sendEmail({ to: stateOfficer.email, ...emailContent });
        }

        const receiptHTML = `
            <h1>Submission Receipt</h1>
            <p><strong>Report ID:</strong> ${newReport._id}</p>
            <p><strong>Project:</strong> ${project.name}</p>
            <p><strong>Amount:</strong> ${(newReport.amount / 100000).toFixed(2)} Lakhs</p>
            <p><strong>Status:</strong> ${newReport.status}</p>
            <p>Submitted on ${newReport.createdAt.toLocaleString('en-IN')}. Your report is now pending review.</p>
        `;

        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(receiptHTML);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        return { newReport, pdfBuffer };
    }

    async getPendingReportsForState(state) {
        const reports = await utilizationRepository.findPendingByState(state);
        return reports.filter(report => report.project !== null);
    }

    async reviewUtilizationReport(reportId, data, user) {
        const { status, reviewComments } = data;

        if (!['Approved', 'Rejected'].includes(status)) {
            throw new Error('Invalid status. Must be "Approved" or "Rejected".');
        }

        const report = await utilizationRepository.findByIdWithPopulate(reportId);

        if (!report) {
            throw new Error('Report not found.');
        }

        if (report.project.state !== user.state) {
            throw new Error('Not authorized to review this report.');
        }
        
        report.status = status;
        report.reviewComments = reviewComments;
        report.reviewedBy = user._id;
        report.reviewedAt = Date.now();
        const updatedReport = await utilizationRepository.save(report);
        
        if (report.submittedBy && report.submittedBy.email) {
            await alertRepository.create({
                recipient: report.submittedBy._id,
                type: 'utilization_reviewed',
                severity: 'info',
                project: report.project._id,
                agency: report.agency._id,
                message: `Your utilization report of ${(report.amount / 100000).toFixed(2)} Lakhs for "${report.project.name}" has been ${report.status}.`,
                metadata: { status: report.status, comments: reviewComments }
            });

            const emailContent = emailTemplates.utilizationReportReviewed(
                report.agency.name,
                report.project.name,
                report.amount,
                report.status,
                report.reviewComments
            );
            await sendEmail({ to: report.submittedBy.email, ...emailContent });
        }

        return updatedReport;
    }
}

export default new UtilizationService();
