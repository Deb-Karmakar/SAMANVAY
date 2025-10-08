import Groq from 'groq-sdk';
import Project from '../models/projectModel.js';
import Agency from '../models/agencyModel.js';
import User from '../models/userModel.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class ChatbotService {
  constructor() {
    this.conversationHistory = new Map();
  }

  // Get system context based on user role
  getSystemContext(userRole, userData) {
    const baseContext = `You are SAMANVAY AI Assistant, a helpful chatbot for the SAMANVAY (System for Agency Mapping And Nodal VAYavastha) platform - a government project management system for PM-AJAY scheme implementation in India.

Key System Information:
- Platform Name: SAMANVAY
- Purpose: Coordination between government agencies and implementing bodies
- Scheme: PM-AJAY (Pradhan Mantri Anusuchit Jaati Abhyuday Yojana)
- Components: Adarsh Gram, Grant-in-Aid (GIA), Hostel Construction
- Users: Central Admin, State Officers, and Executing Agencies

Your capabilities:
- Answer questions about the platform and scheme
- Help users navigate features
- Provide project status updates
- Explain workflows and processes
- Offer guidance on fund management
- Assist with troubleshooting

Communication Style:
- Be professional and courteous
- Use simple, clear language
- Provide actionable guidance
- Be concise but thorough
- Use bullet points for multiple items
- Always maintain government formality`;

    const roleSpecificContext = {
      CentralAdmin: `
Current User: Central Administrator
Access Level: National oversight
Capabilities:
- Monitor all states and projects
- Approve agencies
- View PFMS data
- Generate national reports
- Track overall performance

You can help with:
- National-level statistics and trends
- Multi-state comparisons
- Policy implementation guidance
- Agency approval workflows
- PFMS integration queries
- Report generation assistance`,

      StateOfficer: `
Current User: State Officer (${userData?.state || 'State'})
Access Level: State-level management
Capabilities:
- Manage state projects
- Coordinate with agencies
- Approve project progress
- Allocate funds
- Monitor state performance

You can help with:
- State-specific project information
- Agency coordination
- Progress review processes
- Fund allocation guidance
- Performance improvement tips`,

      ExecutingAgency: `
Current User: Executing Agency (${userData?.agencyName || 'Agency'})
Access Level: Project execution
Capabilities:
- Update project progress
- Submit reports
- Upload proof of work
- Track milestones
- Manage budgets

You can help with:
- Project update procedures
- Report submission guidance
- Document upload help
- Milestone tracking
- Budget utilization queries`
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

      // Call Groq API
      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.1-8b-instant', // or 'mixtral-8x7b-32768'
        temperature: 0.7,
        max_tokens: 1024,
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
        "What's the overall project completion rate?",
        "Show me top performing states",
        "How do I approve a new agency?",
        "What are the recent alerts?",
        "Explain PFMS integration",
        "How to generate national reports?",
      ],
      StateOfficer: [
        "Show my state's project status",
        "How to assign a project to an agency?",
        "What's the fund utilization rate?",
        "How to approve project progress?",
        "Show pending tasks",
        "How to add a new project?",
      ],
      ExecutingAgency: [
        "How to update project progress?",
        "What documents do I need to upload?",
        "Show my pending tasks",
        "How to submit fund utilization report?",
        "What are my project deadlines?",
        "How to mark a milestone complete?",
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