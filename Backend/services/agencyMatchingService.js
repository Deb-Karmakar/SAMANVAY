import Groq from 'groq-sdk';
import Agency from '../models/agencyModel.js';
import Project from '../models/projectModel.js';

class AgencyMatchingService {
  constructor() {
    this.groqClient = null; // ✅ Will be initialized on first use
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

  // Phase 1: Rule-Based Scoring (UPDATED)
  async scoreAgencies(projectData, agencies) {
    const scores = [];

    for (const agency of agencies) {
      let score = 0;
      const reasons = [];

      // 1. Completion Rate (25 points) - REDUCED from 30
      const completionRate = await this.getAgencyCompletionRate(agency._id);
      const completionScore = completionRate * 0.25;
      score += completionScore;
      reasons.push(`Completion rate: ${completionRate.toFixed(1)}%`);

      // 2. Experience with Similar Projects (20 points) - REDUCED from 25
      const similarProjectsCount = await this.getSimilarProjectsCount(
        agency._id,
        projectData.component
      );
      const experienceScore = Math.min(similarProjectsCount * 4, 20); // CHANGED from 5 to 4
      score += experienceScore;
      reasons.push(`Similar projects completed: ${similarProjectsCount}`);

      // 3. Current Workload (20 points)
      const workloadScore = await this.getWorkloadScore(agency._id);
      score += workloadScore;
      reasons.push(`Workload capacity: ${workloadScore.toFixed(1)}/20`);

      // 4. Geographic Proximity (20 points) - INCREASED from 15
      const proximityScore = this.getProximityScore(
        agency.district,
        projectData.district
      );
      score += proximityScore;
      reasons.push(`Location match: ${proximityScore.toFixed(1)}/20`);

      // 5. Budget Utilization Efficiency (10 points)
      const budgetEfficiency = await this.getBudgetEfficiency(agency._id);
      const budgetScore = budgetEfficiency * 0.1;
      score += budgetScore;
      reasons.push(`Budget efficiency: ${budgetEfficiency.toFixed(1)}%`);

      // ✅ NEW: 6. New Agency Bonus (5 points)
      // Give new/less experienced agencies a fair chance
      if (similarProjectsCount === 0) {
        const newAgencyBonus = 5;
        score += newAgencyBonus;
        reasons.push(`New agency bonus: ${newAgencyBonus} points`);
      }

      scores.push({
        agency,
        score: Math.round(score),
        reasons,
        details: {
          completionRate,
          similarProjectsCount,
          workloadScore,
          proximityScore,
          budgetEfficiency,
        },
      });
    }

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  }

  // Helper: Get agency completion rate
  async getAgencyCompletionRate(agencyId) {
    const projects = await Project.find({
      'assignments.agency': agencyId,
    });

    if (projects.length === 0) return 0;

    const completed = projects.filter(p => p.status === 'Completed').length;
    return (completed / projects.length) * 100;
  }

  // Helper: Get count of similar projects
  async getSimilarProjectsCount(agencyId, component) {
    return await Project.countDocuments({
      'assignments.agency': agencyId,
      component,
      status: 'Completed',
    });
  }

  // Helper: Calculate workload score (20 - less is better)
  async getWorkloadScore(agencyId) {
    const activeProjects = await Project.countDocuments({
      'assignments.agency': agencyId,
      status: { $in: ['On Track', 'Delayed', 'Pending Approval'] },
    });

    // Penalize agencies with too many active projects
    if (activeProjects === 0) return 20;
    if (activeProjects <= 2) return 18;
    if (activeProjects <= 4) return 15;
    if (activeProjects <= 6) return 10;
    return 5;
  }

  // Helper: Calculate proximity score (UPDATED)
  getProximityScore(agencyDistrict, projectDistrict) {
    if (agencyDistrict === projectDistrict) return 20; // INCREASED from 15
    return 10; // INCREASED from 8
  }

  // Helper: Get budget utilization efficiency
  async getBudgetEfficiency(agencyId) {
    const projects = await Project.find({
      'assignments.agency': agencyId,
      status: 'Completed',
    });

    if (projects.length === 0) return 85; // INCREASED default from 80 to 85

    let totalEfficiency = 0;
    let count = 0;

    for (const project of projects) {
      const assignment = project.assignments.find(
        a => a.agency.toString() === agencyId.toString()
      );
      if (assignment && assignment.allocatedFunds > 0) {
        const utilized = (project.progress / 100) * assignment.allocatedFunds;
        const efficiency = Math.min((utilized / assignment.allocatedFunds) * 100, 100);
        totalEfficiency += efficiency;
        count++;
      }
    }

    return count > 0 ? totalEfficiency / count : 85;
  }

  // Phase 2: Gen AI Enhancement
  async getAIRecommendation(projectData, topAgencies) {
    try {
      const agenciesContext = topAgencies.map((item, index) => ({
        rank: index + 1,
        name: item.agency.name,
        type: item.agency.type,
        district: item.agency.district,
        score: item.score,
        details: item.details,
        reasons: item.reasons,
      }));

      const prompt = `You are an expert project management advisor for the SAMANVAY government platform. Analyze the following agencies and provide intelligent recommendations for project assignment.

PROJECT DETAILS:
- Name: ${projectData.name}
- Component: ${projectData.component}
- District: ${projectData.district}
- Budget: ₹${projectData.budget?.toLocaleString() || 'Not specified'}
- Description: ${projectData.description || 'N/A'}

TOP CANDIDATE AGENCIES (Pre-filtered by rule engine):
${JSON.stringify(agenciesContext, null, 2)}

IMPORTANT NOTES:
- Some agencies may be new with limited history - this is normal
- Geographic proximity is very important for project success
- Agencies with high workload capacity (score 18-20) are readily available
- Consider both experience AND availability

TASK:
1. Analyze each agency's strengths and weaknesses
2. Rank them from best to worst for THIS specific project
3. Provide clear, actionable reasoning for each recommendation
4. Be encouraging about new agencies if they show good potential
5. Suggest the TOP 3 agencies with confidence levels

Respond in this JSON format:
{
  "recommendations": [
    {
      "agencyName": "Agency Name",
      "rank": 1,
      "confidenceScore": 85,
      "recommendation": "Highly Recommended",
      "reasoning": "Clear explanation of why this agency is best",
      "strengths": ["strength 1", "strength 2"],
      "concerns": ["concern 1"] or [],
      "bestFor": "What makes this agency ideal for this project"
    }
  ],
  "summary": "Overall recommendation summary in 2-3 sentences"
}

Be professional, objective, and focus on the project's success. Don't penalize new agencies too harshly - everyone starts somewhere.`;

      // ✅ Use lazy-initialized client
      const groq = this.getGroqClient();

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a government project management AI advisor specializing in agency selection and project assignment optimization. You are practical and give new agencies a fair chance.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const aiResponse = JSON.parse(completion.choices[0].message.content);
      return aiResponse;
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      // Fallback: return rule-based ranking if AI fails
      return {
        recommendations: topAgencies.slice(0, 3).map((item, index) => ({
          agencyName: item.agency.name,
          rank: index + 1,
          confidenceScore: item.score,
          recommendation: item.score > 70 ? 'Recommended' : 'Consider',
          reasoning: item.reasons.join('. '),
          strengths: item.reasons,
          concerns: item.score < 50 ? ['Limited project history'] : [],
          bestFor: 'Based on rule-based scoring',
        })),
        summary: 'AI analysis unavailable. Showing rule-based recommendations.',
      };
    }
  }

  // Main Function: Get Complete Recommendations (UPDATED threshold)
  async getProjectAssignmentRecommendations(projectData, stateFilter) {
    try {
      // Fetch all eligible agencies
      const agencies = await Agency.find({
        state: stateFilter,
        status: 'Active',
      });

      if (agencies.length === 0) {
        return {
          success: false,
          message: 'No active agencies found in this state',
        };
      }

      // Phase 1: Rule-based scoring
      const scoredAgencies = await this.scoreAgencies(projectData, agencies);

      // ✅ UPDATED: Lower minimum threshold from 60 to 40
      const qualifiedAgencies = scoredAgencies.filter(item => item.score >= 40);

      if (qualifiedAgencies.length === 0) {
        return {
          success: false,
          message: 'No agencies meet the minimum qualification criteria',
          allScores: scoredAgencies, // Show all for transparency
          debug: {
            totalAgencies: agencies.length,
            highestScore: scoredAgencies[0]?.score || 0,
            threshold: 40,
            suggestion: 'Try adjusting project criteria or consider agencies with lower scores',
          }
        };
      }

      // Get top 5 for AI analysis (or all if less than 5)
      const topAgencies = qualifiedAgencies.slice(0, Math.min(5, qualifiedAgencies.length));

      // Phase 2: Gen AI enhancement
      const aiRecommendations = await this.getAIRecommendation(
        projectData,
        topAgencies
      );

      return {
        success: true,
        ruleBasedScores: scoredAgencies,
        aiRecommendations: aiRecommendations.recommendations,
        summary: aiRecommendations.summary,
        metadata: {
          totalAgenciesAnalyzed: agencies.length,
          qualifiedAgencies: qualifiedAgencies.length,
          aiAnalyzed: topAgencies.length,
          threshold: 40,
        },
      };
    } catch (error) {
      console.error('Agency Matching Error:', error);
      throw error;
    }
  }
}

export default new AgencyMatchingService();