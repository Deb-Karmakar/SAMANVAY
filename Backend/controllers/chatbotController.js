import chatbotService from '../services/chatbotService.js';

export const chatController = {
  // Send message to chatbot
  sendMessage: async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user._id.toString();
      const userRole = req.user.role;
      const userData = {
        name: req.user.fullName,
        email: req.user.email,
        state: req.user.state,
        agencyName: req.user.agencyId?.name,
      };

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message is required',
        });
      }

      const response = await chatbotService.generateResponse(
        userId,
        userRole,
        message,
        userData
      );

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Chat controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process message',
      });
    }
  },

  // Get suggested questions
  getSuggestions: async (req, res) => {
    try {
      const suggestions = chatbotService.getSuggestedQuestions(req.user.role);
      
      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get suggestions',
      });
    }
  },

  // Get chat history
  getHistory: async (req, res) => {
    try {
      const userId = req.user._id.toString();
      const history = chatbotService.getHistory(userId);
      
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get chat history',
      });
    }
  },

  // Clear chat history
  clearHistory: async (req, res) => {
    try {
      const userId = req.user._id.toString();
      chatbotService.clearHistory(userId);
      
      res.json({
        success: true,
        message: 'Chat history cleared',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to clear chat history',
      });
    }
  },
};