import asyncHandler from 'express-async-handler';
import fundService from '../services/fundService.js';

// @desc    Get aggregated fund summary
// @route   GET /api/funds/summary
// @access  Private/Admin
const getFundSummary = asyncHandler(async (req, res) => {
    const data = await fundService.getFundData();
    res.json(data);
});

// @desc    Generate and download a PDF report of the fund summary
// @route   GET /api/funds/report/download
// @access  Private/Admin
const generateFundReport = asyncHandler(async (req, res) => {
    const data = await fundService.getFundData();
    const htmlContent = fundService.getReportHTML(data);
    const pdfBuffer = await fundService.generatePDF(htmlContent);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SAMANVAY-Fund-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    res.send(pdfBuffer);
});

// @desc    Get aggregated fund summary for the user's state
// @route   GET /api/funds/summary/mystate
// @access  Private/StateOfficer
const getFundSummaryForState = asyncHandler(async (req, res) => {
    const data = await fundService.getFundDataForState(req.user.state);
    res.json(data);
});

// @desc    Generate and download a PDF report for the user's state
// @route   GET /api/funds/report/download/mystate
// @access  Private/StateOfficer
const generateFundReportForState = asyncHandler(async (req, res) => {
    const data = await fundService.getFundDataForState(req.user.state);
    const htmlContent = fundService.getStateReportHTML(data, req.user.state);
    const pdfBuffer = await fundService.generatePDF(htmlContent);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${req.user.state}-Fund-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    res.send(pdfBuffer);
});

export { getFundSummary, generateFundReport, getFundSummaryForState, generateFundReportForState };
