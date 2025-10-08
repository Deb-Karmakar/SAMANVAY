import agencyMatchingService from '../services/agencyMatchingService.js';

export const getAgencyRecommendations = async (req, res) => {
  try {
    const projectData = req.body;
    const userState = req.user.state;

    if (!projectData.name || !projectData.component || !projectData.district) {
      return res.status(400).json({
        success: false,
        error: 'Project name, component, and district are required',
      });
    }

    const recommendations = await agencyMatchingService.getProjectAssignmentRecommendations(
      projectData,
      userState
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
    });
  }
};