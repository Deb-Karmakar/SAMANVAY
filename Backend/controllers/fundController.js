// Backend/controllers/fundController.js

import Project from '../models/projectModel.js';
import asyncHandler from 'express-async-handler';
import puppeteer from 'puppeteer';

// Helper function to generate HTML for the PDF report
const getReportHTML = (data) => {
    const { overall, byState, byComponent } = data;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    // Helper to format table rows
    const stateRows = byState.map(s => `
        <tr>
            <td>${s.state}</td>
            <td>₹${s.budget.toFixed(2)} Cr</td>
            <td>₹${s.disbursed.toFixed(2)} Cr</td>
            <td>${s.budget > 0 ? Math.round((s.disbursed / s.budget) * 100) : 0}%</td>
        </tr>
    `).join('');
    
    const componentRows = byComponent.map(c => `
         <tr>
            <td>${c.name}</td>
            <td>₹${c.budget.toFixed(2)} Cr</td>
            <td>₹${c.disbursed.toFixed(2)} Cr</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; margin: 40px; color: #333; }
                h1 { color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px; }
                p { color: #555; }
                .header { text-align: center; margin-bottom: 40px; }
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                .stat-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; text-align: center; }
                .stat-card h3 { margin: 0 0 5px 0; color: #0056b3; }
                .stat-card p { font-size: 20px; font-weight: bold; margin: 0; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; }
                .footer { text-align: center; font-size: 12px; color: #888; margin-top: 40px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>SAMANVAY - Fund Management Report</h1>
                <p>Generated on: ${today}</p>
            </div>

            <h2>Overall Financial Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Sanctioned Budget</h3>
                    <p>₹${overall.totalBudget.toFixed(2)} Cr</p>
                </div>
                <div class="stat-card">
                    <h3>Total Funds Disbursed</h3>
                    <p>₹${overall.totalDisbursed.toFixed(2)} Cr</p>
                </div>
                 <div class="stat-card">
                    <h3>Available for Allocation</h3>
                    <p>₹${(overall.totalBudget - overall.totalDisbursed).toFixed(2)} Cr</p>
                </div>
                 <div class="stat-card">
                    <h3>Budget Utilization</h3>
                    <p>${overall.totalBudget > 0 ? Math.round((overall.totalDisbursed / overall.totalBudget) * 100) : 0}%</p>
                </div>
            </div>

            <h2>State-wise Fund Details</h2>
            <table>
                <thead>
                    <tr><th>State/UT</th><th>Sanctioned Budget</th><th>Disbursed to Agencies</th><th>Utilization Rate</th></tr>
                </thead>
                <tbody>${stateRows}</tbody>
            </table>
            
             <h2>Component-wise Fund Details</h2>
            <table>
                <thead>
                    <tr><th>Component</th><th>Sanctioned Budget</th><th>Disbursed to Agencies</th></tr>
                </thead>
                <tbody>${componentRows}</tbody>
            </table>

            <div class="footer">
                <p>This is an auto-generated report from the SAMANVAY Portal.</p>
            </div>
        </body>
        </html>
    `;
};


// Function to get the data (re-usable)
const getFundData = async () => {
     const data = await Project.aggregate([
        {
            $facet: {
                "overallStats": [{ $group: { _id: null, totalBudget: { $sum: "$budget" }, totalDisbursed: { $sum: { $sum: "$assignments.allocatedFunds" } } } }],
                "byState": [{ $group: { _id: "$state", budget: { $sum: "$budget" }, disbursed: { $sum: { $sum: "$assignments.allocatedFunds" } } } }, { $sort: { budget: -1 } }],
                "byComponent": [{ $group: { _id: "$component", budget: { $sum: "$budget" }, disbursed: { $sum: { $sum: "$assignments.allocatedFunds" } } } }]
            }
        }
    ]);

    const formattedResponse = {
        overall: data[0].overallStats[0] || { totalBudget: 0, totalDisbursed: 0 },
        byState: data[0].byState,
        byComponent: data[0].byComponent
    };
    
    formattedResponse.overall.totalBudget /= 10000000;
    formattedResponse.overall.totalDisbursed /= 10000000;
    formattedResponse.byState.forEach(item => {
        item.budget /= 10000000;
        item.disbursed /= 10000000;
        item.state = item._id;
        delete item._id;
    });
     formattedResponse.byComponent.forEach(item => {
        item.budget /= 10000000;
        item.disbursed /= 10000000;
        item.name = item._id;
        item.value = item.budget;
        delete item._id;
    });
    return formattedResponse;
}

// @desc    Get aggregated fund summary
// @route   GET /api/funds/summary
// @access  Private/Admin
const getFundSummary = asyncHandler(async (req, res) => {
    const data = await getFundData();
    res.json(data);
});

// @desc    Generate and download a PDF report of the fund summary
// @route   GET /api/funds/report/download
// @access  Private/Admin
const generateFundReport = asyncHandler(async (req, res) => {
    // 1. Fetch the latest data
    const data = await getFundData();

    // 2. Generate HTML from the data
    const htmlContent = getReportHTML(data);
    
    // 3. Use Puppeteer to create the PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 4. Send the PDF back to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SAMANVAY-Fund-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    res.send(pdfBuffer);
});

export { getFundSummary, generateFundReport };