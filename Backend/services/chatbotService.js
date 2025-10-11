import Groq from 'groq-sdk';
import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';
import User from '../models/userModel.js';

class ChatbotService {
  constructor() {
    this.conversationHistory = new Map();
    this.groqClient = null;
  }

  // ✅ Initialize Groq client only when needed
  getGroqClient() {
    if (!this.groqClient) {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
      }
      this.groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }
    return this.groqClient;
  }

  // Get comprehensive system context based on user role
  getSystemContext(userRole, userData) {
    const baseContext = `You are SAMANVAY AI Assistant, an intelligent chatbot for the SAMANVAY (System for Agency Mapping And Nodal VAYavastha) platform - a comprehensive digital platform for PM-AJAY (Pradhan Mantri Anusuchit Jaati Abhyuday Yojana) scheme management in India.

🏛️ PLATFORM OVERVIEW:
- Full Name: System for Agency Mapping And Nodal VAYavastha
- Purpose: Unified digital backbone for PM-AJAY scheme implementation across India
- Ministry: Social Justice & Empowerment, Government of India
- Technology Stack: Node.js + React + MongoDB + Hyperledger Fabric Blockchain
- Version: v1.0.0

📋 SCHEME COMPONENTS:
1. Adarsh Gram (Model Village): Rural development and infrastructure projects
2. GIA (Grant-in-Aid): Financial assistance programs for welfare initiatives
3. Hostel Construction: Educational infrastructure and maintenance projects

👥 USER ROLES & ACCESS LEVELS:
1. Central Admin: National-level oversight, PFMS management, policy implementation
2. State Officers: State-level project management, agency coordination, progress monitoring
3. Executing Agencies: Ground-level project execution, milestone tracking, utilization reporting

🔑 KEY FEATURES YOU CAN HELP WITH:

📊 Dashboard & Analytics:
- Real-time project progress tracking with timeline visualization
- Financial utilization analysis with trend predictions
- State performance comparisons with ranking systems
- Agency efficiency metrics with productivity scoring
- PFMS integration for real-time financial data
- Quarterly reporting with automated generation

🎯 Project Management:
- Complete project lifecycle from creation to completion
- Milestone-based tracking with checklist system
- Geographic visualization using interactive maps
- Document management with PDF generation (approval letters, assignment orders)
- Progress monitoring with real-time status updates

🤖 AI-Powered Features:
- Smart Agency Recommendation System (for State Officers):
  * Hybrid AI engine combining rule-based scoring + Groq LLaMA 3.1 8B model
  * 6-factor analysis: Completion Rate (25pts), Experience Match (20pts), Workload (20pts), 
    Geographic Proximity (20pts), Budget Efficiency (10pts), New Agency Bonus (5pts)
  * Minimum qualification threshold: 40/100 points
  * AI provides confidence scores, strengths/weaknesses, risk assessment
  
- AI Assistant Chatbot (All Users):
  * Role-aware contextual responses
  * Real-time data integration
  * Conversational memory for contextual understanding
  * Government-grade professional communication

⛓️ BLOCKCHAIN INFRASTRUCTURE:
- Hyperledger Fabric Network with multi-organization architecture
- Immutable audit trails for all project activities and fund transfers
- Smart contract automation for milestone payments and approvals
- Digital asset management with tokenized certificates
- Transparent fund tracking from allocation to utilization
- Consensus-based approvals with multi-signature validation
- Permissioned access with role-based blockchain access
- End-to-end encryption for sensitive transactions

🏦 PFMS INTEGRATION:
- Real-time synchronization (Daily 3 AM IST, Weekly Sunday 1 AM, Monthly 1st 2 AM)
- Fund release, utilization, and pending amount tracking
- State-wise and component-wise analysis
- Quarterly trend analysis and performance metrics
- Utilization certificate generation and approval workflows
- Budget reconciliation with project data
- Predictive analytics for risk assessment

🔔 INTELLIGENT ALERT SYSTEM:
- Multi-level escalation: Agency → State → Admin (Level 0 → 1 → 2)
- 40+ alert types including:
  * deadline_approaching, inactive_project, behind_schedule
  * high_rejection_rate, consecutive_rejections, slow_review
  * milestone_due_soon, milestone_overdue
- Auto-escalation timeline: Level 1 after 2 days, Level 2 after 5 days
- Auto-resolution when conditions improve
- Snooze functionality for temporary dismissal
- Email + in-app notifications
- Nightly processing at 2 AM IST

📱 TECHNICAL CAPABILITIES:
- Progressive Web App (PWA) with offline capability
- Mobile responsive design for all devices
- Real-time updates and push notifications
- Role-based access control with JWT authentication
- Secure file uploads with validation
- Geographic mapping with Leaflet integration
- Advanced reporting with custom dashboards

🔒 SECURITY FEATURES:
- JWT authentication with bcrypt password hashing
- Blockchain security with X.509 certificates
- Digital identity management via MSP
- Cryptographic data protection
- Immutable audit logs on distributed ledger
- Smart contract security with vulnerability scanning
- Input sanitization and CORS protection

📞 SUPPORT INFORMATION:
- Email: support@samanvay.gov.in
- Issue Reporting: GitHub Issues
- Documentation: Wiki Pages

COMMUNICATION STYLE:
- Professional and government-formal tone
- Simple, clear language avoiding jargon
- Actionable step-by-step guidance
- Concise but thorough explanations
- Use bullet points and structured formatting
- Empathetic and solution-oriented
- Cite specific features and capabilities when relevant`;

    const roleSpecificContext = {
      CentralAdmin: `
🏛️ CURRENT USER: Central Administrator
📊 ACCESS LEVEL: National Oversight

YOUR CAPABILITIES:
✅ National Dashboard Access:
   - Overall project completion rates across all states
   - State performance comparisons and rankings
   - Budget allocation vs utilization trends
   - Top/bottom performing agencies nationwide
   - Recent system activities and audit logs

✅ Agency Management:
   - Approve/reject agency registrations
   - View all agencies across India with filtering
   - Monitor agency performance metrics
   - Suspend/reactivate agencies

✅ PFMS Data Management:
   - Access national PFMS dashboard
   - View quarterly trends and predictions
   - Analyze component-wise breakdown (Adarsh Gram/GIA/Hostel)
   - Generate national financial reports
   - Reconcile PFMS with blockchain records

✅ Multi-State Oversight:
   - Compare state performances
   - Identify underperforming states
   - Track policy implementation
   - Monitor inter-state trends

✅ Alert Management:
   - View escalated alerts from states
   - Track unresolved issues nationwide
   - Access escalation statistics
   - Manually trigger alert generation

✅ Blockchain Operations:
   - Monitor Fabric network health
   - View smart contract analytics
   - Access complete audit trails
   - Deploy chaincode updates

I CAN HELP YOU WITH:
- "Show me states with utilization rate below 60%"
- "Which agencies are pending approval?"
- "What's the national project completion rate?"
- "Compare performance of top 5 states"
- "Show me critical escalated alerts"
- "How to access PFMS quarterly reports?"
- "Explain blockchain audit trail access"
- "Generate national performance report"`,

      StateOfficer: `
🏢 CURRENT USER: State Officer - ${userData?.state || 'Your State'}
📊 ACCESS LEVEL: State-Level Management

YOUR CAPABILITIES:
✅ State Dashboard:
   - View state-specific project statistics
   - Monitor district-wise breakdown
   - Track pending approvals (projects & milestones)
   - View agency performance in your state
   - Access state budget utilization data

✅ Project Management:
   - Create new projects with AI recommendations
   - Assign agencies to projects using smart matching
   - Review and approve milestone submissions
   - Track project progress and deadlines
   - Generate project approval letters (PDF)

✅ AI-Powered Agency Recommendations:
   - Request intelligent agency matching for new projects
   - View ranked recommendations with confidence scores
   - Understand detailed reasoning and risk assessment
   - Compare agencies based on 6 key factors
   - Make data-driven assignment decisions

✅ Agency Coordination:
   - View agencies registered in your state
   - Approve new agency registrations
   - Monitor agency workload and capacity
   - Track agency completion rates
   - Communicate with assigned agencies

✅ Milestone Review Workflow:
   - Review submitted proof of work
   - Approve or reject with comments
   - Track review turnaround times
   - Monitor slow review alerts

✅ Fund Management:
   - Allocate funds to assigned agencies
   - Review utilization certificate submissions
   - Approve/reject utilization reports
   - Track state PFMS data

✅ Alert Handling:
   - Receive escalated alerts from agencies
   - Acknowledge and resolve state-level alerts
   - Snooze non-critical alerts
   - View alert escalation timeline

I CAN HELP YOU WITH:
- "How do I use AI recommendations for agency assignment?"
- "Show projects behind schedule in my state"
- "List agencies with high completion rates"
- "How to review a submitted milestone?"
- "What's my state's fund utilization rate?"
- "Show pending milestone reviews"
- "How to create a new project?"
- "Explain the AI recommendation scoring system"
- "Which districts have most delayed projects?"`,

      ExecutingAgency: `
🏭 CURRENT USER: ${userData?.agencyName || 'Executing Agency'}
📊 ACCESS LEVEL: Project Execution

YOUR CAPABILITIES:
✅ Agency Dashboard:
   - View assigned projects and status
   - Track upcoming deadlines (projects & milestones)
   - Monitor budget allocation and utilization
   - View project locations on map
   - Check performance metrics

✅ Project Execution:
   - View assigned project details
   - Access project milestones checklist
   - Track milestone completion status
   - View approved/rejected submissions
   - Monitor overall project progress

✅ Milestone Submission:
   - Upload proof of work (images/documents)
   - Submit milestones for state officer review
   - Track submission status (Pending Review/Approved/Rejected)
   - View review comments and feedback
   - Resubmit rejected milestones with corrections

✅ Financial Reporting:
   - Submit utilization certificates (PDF upload)
   - Track fund allocation and spending
   - View utilization report status
   - Access approved utilization history
   - Monitor budget efficiency metrics

✅ Communication:
   - Receive alerts for deadlines and reviews
   - View state officer feedback
   - Access project assignment notifications
   - Track escalated alerts

✅ Document Access:
   - Download project assignment orders (PDF)
   - View milestone approval certificates
   - Access project approval letters
   - Retrieve utilization certificates

I CAN HELP YOU WITH:
- "How to submit a milestone for review?"
- "What documents do I need to upload?"
- "Show my upcoming project deadlines"
- "How to upload utilization certificate?"
- "Why was my milestone rejected?"
- "How to mark a checklist item as complete?"
- "What's my current budget utilization?"
- "Show my pending tasks"
- "How to resubmit a rejected milestone?"
- "Explain the milestone approval workflow"`
    };

    return baseContext + '\n\n' + (roleSpecificContext[userRole] || '');
  }

  // Fetch relevant context data
  async fetchContextData(userId, userRole, query) {
    try {
      const contextData = {
        timestamp: new Date().toISOString(),
      };

      // Fetch user-specific data based on role
      if (userRole === 'CentralAdmin') {
        const [projectCount, agencyCount, stateCount] = await Promise.all([
          Project.countDocuments(),
          Agency.countDocuments(),
          Project.distinct('state'),
        ]);

        contextData.stats = {
          totalProjects: projectCount,
          totalAgencies: agencyCount,
          statesCount: stateCount.length,
        };

        // If query mentions specific state, get state data
        const stateMatch = query.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g);
        if (stateMatch) {
          const stateProjects = await Project.find({ 
            state: { $in: stateMatch } 
          }).limit(5);
          contextData.stateProjects = stateProjects;
        }
      } else if (userRole === 'StateOfficer') {
        const user = await User.findById(userId);
        const [projects, agencies] = await Promise.all([
          Project.find({ state: user.state }).limit(10),
          Agency.find({ state: user.state }),
        ]);

        contextData.stats = {
          stateProjects: projects.length,
          stateAgencies: agencies.length,
        };
        contextData.recentProjects = projects.map(p => ({
          name: p.name,
          status: p.status,
          progress: p.progress,
          district: p.district,
        }));
      } else if (userRole === 'ExecutingAgency') {
        const user = await User.findById(userId);
        const projects = await Project.find({
          'assignments.agencyId': user.agencyId,
        }).limit(10);

        contextData.stats = {
          assignedProjects: projects.length,
        };
        contextData.myProjects = projects.map(p => ({
          name: p.name,
          status: p.status,
          progress: p.progress,
          component: p.component,
        }));
      }

      return contextData;
    } catch (error) {
      console.error('Error fetching context data:', error);
      return {};
    }
  }

  // Generate AI response
  async generateResponse(userId, userRole, userMessage, userData = {}) {
    try {
      // Get or create conversation history
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }
      const history = this.conversationHistory.get(userId);

      // Fetch relevant context
      const contextData = await this.fetchContextData(userId, userRole, userMessage);
      
      // Build context string
      let contextString = '';
      if (Object.keys(contextData).length > 0) {
        contextString = '\n\nCurrent Context Data:\n' + JSON.stringify(contextData, null, 2);
      }

      // Build messages array
      const messages = [
        {
          role: 'system',
          content: this.getSystemContext(userRole, userData) + contextString,
        },
        ...history.slice(-10), // Keep last 10 messages for context
        {
          role: 'user',
          content: userMessage,
        },
      ];

      // ✅ Use lazy-initialized client
      const groq = this.getGroqClient();
      
      // Call Groq API
      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 1536, // Increased for more detailed responses
        top_p: 1,
        stream: false,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Please try again.";

      // Update conversation history
      history.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      // Keep history manageable (last 20 messages)
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return {
        message: assistantMessage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
            console.error('Chatbot error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  // Get suggested questions based on role
  getSuggestedQuestions(userRole) {
    const suggestions = {
      CentralAdmin: [
        "What's the overall project completion rate across India?",
        "Show me top 5 performing states",
        "How do I approve a new agency registration?",
        "What are the recent critical alerts?",
        "Explain PFMS integration and data synchronization",
        "How to generate national performance reports?",
        "Show me agencies pending approval",
        "What's the national budget utilization rate?",
        "How does the blockchain audit trail work?",
        "Compare state performances for Adarsh Gram projects",
        "What are the escalated alerts from states?",
        "How to access smart contract analytics?",
      ],
      StateOfficer: [
        "Show my state's project status and completion rate",
        "How to use AI recommendations for agency assignment?",
        "What's my state's fund utilization rate?",
        "How to approve milestone submissions?",
        "Show pending tasks and reviews in my state",
        "How to create a new project?",
        "Which agencies in my state have highest completion rates?",
        "Explain the AI agency matching scoring system",
        "How to review utilization certificate submissions?",
        "Show projects behind schedule in my state",
        "List agencies with current workload capacity",
        "How to assign multiple agencies to one project?",
        "What districts have the most delayed projects?",
        "How to generate project approval letters?",
      ],
      ExecutingAgency: [
        "How to submit a milestone for review?",
        "What documents do I need to upload for proof of work?",
        "Show my upcoming project deadlines",
        "How to submit fund utilization certificate?",
        "What are my current project assignments?",
        "How to mark a milestone as complete?",
        "What's my agency's budget utilization status?",
        "Show my pending tasks and submissions",
        "How to resubmit a rejected milestone?",
        "Explain the milestone approval workflow",
        "Why was my recent milestone rejected?",
        "How to upload images as proof of work?",
        "What's the format for utilization certificates?",
        "How to view state officer feedback on submissions?",
        "Show my agency's performance metrics",
      ],
    };

    return suggestions[userRole] || [];
  }

  // Clear conversation history
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  // Get conversation history
  getHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }
}

export default new ChatbotService();