// Backend/utils/pdfService.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const generateProjectApprovalPDF = (project) => {
    return new Promise((resolve, reject) => {
        const filename = `project-approval-${project._id}-${Date.now()}.pdf`;
        const filepath = path.join(uploadDir, filename);
        
        const doc = new PDFDocument({ 
            margin: 50, 
            size: 'A4',
            bufferPages: true
        });
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);

        // Header
        doc.fontSize(22)
           .fillColor('#2563eb')
           .text('SAMANVAY', { align: 'center' });
        
        doc.fontSize(11)
           .fillColor('#000000')
           .text('Ministry of Social Justice & Empowerment', { align: 'center' });
        
        doc.fontSize(9)
           .text('PM-AJAY Project Management System', { align: 'center' });
        
        doc.moveDown(2);

        // Document title
        doc.fontSize(16)
           .fillColor('#2563eb')
           .text('PROJECT APPROVAL LETTER', { align: 'center', underline: true });
        
        doc.moveDown(2);

        // Reference and date
        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Reference No: PMAJAY/${new Date().getFullYear()}/${project._id.toString().slice(-6).toUpperCase()}`)
           .text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`);
        
        doc.moveDown(2);

        // Recipient
        doc.text('To,')
           .text('The State Nodal Officer')
           .text('PM-AJAY Implementation')
           .text(project.state);
        
        doc.moveDown(2);

        // Subject
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('Subject: Approval and Sanction of Project under PM-AJAY Scheme');
        
        doc.font('Helvetica')
           .fontSize(10);
        
        doc.moveDown(1);

        // Body
        doc.text('Sir/Madam,');
        doc.moveDown(0.5);
        
        doc.text('With reference to the above subject, it is informed that the following project has been sanctioned and approved for implementation in your state under the Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY):', {
            align: 'justify',
            width: 495
        });
        
        doc.moveDown(2);

        // Project Details Box
        const boxTop = doc.y;
        const boxLeft = 50;
        const boxWidth = 495;
        
        doc.fontSize(12)
           .fillColor('#2563eb')
           .font('Helvetica-Bold')
           .text('PROJECT DETAILS', boxLeft + 10, boxTop + 10, { width: boxWidth - 20, align: 'center' });
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#000000');
        
        let yPos = boxTop + 35;
        const labelX = boxLeft + 20;
        const valueX = boxLeft + 180;
        
        // Project Name
        doc.text('Project Name:', labelX, yPos);
        doc.text(project.name, valueX, yPos, { width: 300 });
        yPos += 20;
        
        // Component
        doc.text('Component:', labelX, yPos);
        doc.text(project.component, valueX, yPos);
        yPos += 20;
        
        // State
        doc.text('State/UT:', labelX, yPos);
        doc.text(project.state, valueX, yPos);
        yPos += 20;
        
        // District
        if (project.district) {
            doc.text('District:', labelX, yPos);
            doc.text(project.district, valueX, yPos);
            yPos += 20;
        }
        
        // Budget
        doc.text('Sanctioned Budget:', labelX, yPos);
        doc.text(`₹${(project.budget / 100000).toFixed(2)} Lakhs`, valueX, yPos);
        yPos += 25;
        
        // Draw box around details
        doc.rect(boxLeft, boxTop, boxWidth, yPos - boxTop).stroke();
        
        doc.y = yPos + 10;
        doc.moveDown(1);

        // Instructions
        doc.fontSize(10)
           .text('You are hereby requested to:', { continued: false });
        
        doc.moveDown(0.5);
        
        const instructions = [
            'Log in to the SAMANVAY platform and review the complete project details',
            'Identify and assign suitable executing agencies for project implementation',
            'Define clear milestones and timelines for project execution',
            'Monitor progress regularly through the platform',
            'Ensure timely submission of progress reports and utilization certificates'
        ];
        
        instructions.forEach((instruction, i) => {
            const bulletY = doc.y;
            doc.text(`${i + 1}.`, 70, bulletY, { width: 20, continued: false });
            doc.text(instruction, 95, bulletY, { width: 450, align: 'left' });
            doc.moveDown(0.3);
        });
        
        doc.moveDown(1);

        // Closing
        doc.text('The project must be completed within the stipulated timeframe with proper documentation and adherence to all guidelines.', {
            align: 'justify',
            width: 495
        });
        
        doc.moveDown(2);

        // Signature
        doc.text('Yours faithfully,');
        doc.moveDown(2);
        doc.text('Authorized Signatory');
        doc.text('Ministry of Social Justice & Empowerment');
        doc.text('Government of India');

        // Footer
        doc.fontSize(8)
           .fillColor('#6b7280')
           .text(
               'This is a system-generated document and does not require a physical signature.',
               50,
               doc.page.height - 50,
               { align: 'center', width: 495 }
           );

        doc.end();

        stream.on('finish', () => {
            resolve({
                filename,
                filepath,
                url: `/uploads/pdfs/${filename}`
            });
        });

        stream.on('error', reject);
    });
};

export const generateAssignmentOrderPDF = (project, assignments) => {
    return new Promise((resolve, reject) => {
        const filename = `assignment-order-${project._id}-${Date.now()}.pdf`;
        const filepath = path.join(uploadDir, filename);
        
        const doc = new PDFDocument({ 
            margin: 50, 
            size: 'A4',
            bufferPages: true
        });
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);

        // Header
        doc.fontSize(22)
           .fillColor('#2563eb')
           .text('SAMANVAY', { align: 'center' });
        
        doc.fontSize(11)
           .fillColor('#000000')
           .text('Ministry of Social Justice & Empowerment', { align: 'center' });
        
        doc.fontSize(9)
           .text('PM-AJAY Project Management System', { align: 'center' });
        
        doc.moveDown(2);

        // Document title
        doc.fontSize(16)
           .fillColor('#2563eb')
           .text('ASSIGNMENT ORDER', { align: 'center', underline: true });
        
        doc.moveDown(2);

        // Reference
        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Reference No: PMAJAY/${project.state}/${new Date().getFullYear()}/${project._id.toString().slice(-6).toUpperCase()}`)
           .text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`);
        
        doc.moveDown(2);

        // Project Info
        doc.fontSize(12)
           .fillColor('#2563eb')
           .font('Helvetica-Bold')
           .text('PROJECT INFORMATION');
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#000000');
        
        doc.moveDown(0.5);
        
        doc.text(`Project Name: ${project.name}`);
        doc.text(`Component: ${project.component}`);
        doc.text(`State: ${project.state}`);
        if (project.district) doc.text(`District: ${project.district}`);
        doc.text(`Budget: ₹${(project.budget / 100000).toFixed(2)} Lakhs`);
        
        doc.moveDown(2);

        // Assignments
        doc.fontSize(12)
           .fillColor('#2563eb')
           .font('Helvetica-Bold')
           .text('AGENCY ASSIGNMENTS');
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#000000');
        
        doc.moveDown(1);

        assignments.forEach((assignment, index) => {
            doc.font('Helvetica-Bold')
               .text(`${index + 1}. Agency: ${assignment.agency.name}`);
            
            doc.font('Helvetica')
               .moveDown(0.3);
            
            if (assignment.checklist && assignment.checklist.length > 0) {
                doc.fontSize(9)
                   .text('Assigned Milestones:');
                
                assignment.checklist.forEach((milestone, mIdx) => {
                    doc.text(`   ${mIdx + 1}. ${milestone.text}`, { width: 460 });
                });
            }
            
            doc.fontSize(10)
               .moveDown(0.8);
        });

        doc.moveDown(1);

        // Terms
        doc.fontSize(12)
           .fillColor('#2563eb')
           .font('Helvetica-Bold')
           .text('TERMS & CONDITIONS');
        
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor('#000000');
        
        doc.moveDown(0.5);
        
        const terms = [
            'All assigned agencies must log in to SAMANVAY platform within 7 days',
            'Milestone completion must be documented with photographic evidence',
            'Regular progress updates must be submitted through the platform',
            'All work must comply with PM-AJAY guidelines and quality standards',
            'Fund utilization certificates must be submitted as per schedule'
        ];
        
        terms.forEach((term, i) => {
            const termY = doc.y;
            doc.text(`${i + 1}.`, 70, termY, { width: 20, continued: false });
            doc.text(term, 95, termY, { width: 450 });
            doc.moveDown(0.2);
        });
        
        doc.moveDown(2);

        // Signature
        doc.fontSize(10);
        doc.text('Approved by,');
        doc.moveDown(1.5);
        doc.text('State Nodal Officer');
        doc.text(project.state);
        doc.text('PM-AJAY Implementation');

        // Footer
        doc.fontSize(8)
           .fillColor('#6b7280')
           .text(
               'This is a system-generated document.',
               50,
               doc.page.height - 50,
               { align: 'center', width: 495 }
           );

        doc.end();

        stream.on('finish', () => {
            resolve({
                filename,
                filepath,
                url: `/uploads/pdfs/${filename}`
            });
        });

        stream.on('error', reject);
    });
};