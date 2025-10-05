// Backend/utils/emailService.js
// Backend/utils/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Add this
    logger: true  // Add this
});

// Test the connection on startup
transporter.verify(function(error, success) {
    if (error) {
        console.error('❌ Email transporter verification failed:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    try {
        console.log('📧 Attempting to send email to:', to);
        console.log('📧 Email config:', {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            hasPassword: !!process.env.EMAIL_PASSWORD
        });

        const info = await transporter.sendMail({
            from: `"SAMANVAY - PM-AJAY" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            attachments
        });
        
        console.log('✅ Email sent successfully:', info.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
        throw error;
    }
};

// Rest of your emailTemplates code...
// Email templates
const emailTemplates = {
    projectCreated: (projectName, stateName, projectId) => ({
        subject: `New Project Assigned: ${projectName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">New Project Assignment</h2>
                <p>Dear State Nodal Officer,</p>
                <p>A new project has been assigned to <strong>${stateName}</strong> under PM-AJAY scheme.</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Project Details:</h3>
                    <p><strong>Project Name:</strong> ${projectName}</p>
                    <p><strong>State:</strong> ${stateName}</p>
                </div>

                <p>Please log in to the SAMANVAY platform to view complete project details and assign executing agencies.</p>
                
                <a href="${process.env.FRONTEND_URL}/state/projects/${projectId}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin: 10px 0;">
                    View Project Details
                </a>

                <p style="margin-top: 20px;">Please find the project approval letter attached.</p>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">
                    This is an automated message from SAMANVAY - PM-AJAY Project Management System<br>
                    Ministry of Social Justice & Empowerment
                </p>
            </div>
        `
    }),

    agencyAssigned: (projectName, agencyName, milestones, projectId) => ({
        subject: `Project Assignment: ${projectName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">New Project Assignment</h2>
                <p>Dear ${agencyName},</p>
                <p>You have been assigned to execute a project under PM-AJAY scheme.</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Project Details:</h3>
                    <p><strong>Project Name:</strong> ${projectName}</p>
                    <p><strong>Your Role:</strong> Executing Agency</p>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0;">Key Milestones:</h4>
                    <ol style="margin: 0; padding-left: 20px;">
                        ${milestones.map(m => `<li>${m.text}</li>`).join('')}
                    </ol>
                </div>

                <p>Please log in to the SAMANVAY platform to view complete details and begin work.</p>
                
                <a href="${process.env.FRONTEND_URL}/agency/projects/${projectId}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin: 10px 0;">
                    View Project & Milestones
                </a>

                <p style="margin-top: 20px;">Please find the assignment order attached.</p>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">
                    This is an automated message from SAMANVAY - PM-AJAY Project Management System<br>
                    Ministry of Social Justice & Empowerment
                </p>
            </div>
        `
    }),

    milestoneSubmitted: (projectName, milestoneName, agencyName, projectId) => ({
        subject: `Milestone Submitted for Review: ${projectName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">Milestone Review Required</h2>
                <p>Dear State Nodal Officer,</p>
                <p>A milestone has been submitted for your review.</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Project:</strong> ${projectName}</p>
                    <p><strong>Agency:</strong> ${agencyName}</p>
                    <p><strong>Milestone:</strong> ${milestoneName}</p>
                </div>

                <p>Please review the submitted proof and approve or request changes.</p>
                
                <a href="${process.env.FRONTEND_URL}/state/reviews" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin: 10px 0;">
                    Review Submission
                </a>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">
                    This is an automated message from SAMANVAY
                </p>
            </div>
        `
    }),

    milestoneReviewed: (projectName, milestoneName, approved, comments, projectId) => ({
        subject: `Milestone ${approved ? 'Approved' : 'Rejected'}: ${projectName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: ${approved ? '#16a34a' : '#dc2626'};">
                    Milestone ${approved ? 'Approved ✓' : 'Rejected ✗'}
                </h2>
                <p>Dear Agency,</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Project:</strong> ${projectName}</p>
                    <p><strong>Milestone:</strong> ${milestoneName}</p>
                    <p><strong>Status:</strong> ${approved ? 'Approved' : 'Rejected'}</p>
                </div>

                ${comments ? `
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0;">Review Comments:</h4>
                        <p>${comments}</p>
                    </div>
                ` : ''}

                <p>${approved ? 
                    'Congratulations! You may proceed to the next milestone.' : 
                    'Please address the feedback and resubmit the milestone.'
                }</p>
                
                <a href="${process.env.FRONTEND_URL}/agency/projects/${projectId}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin: 10px 0;">
                    View Project
                </a>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">
                    This is an automated message from SAMANVAY
                </p>
            </div>
        `
    })
};


export { emailTemplates };