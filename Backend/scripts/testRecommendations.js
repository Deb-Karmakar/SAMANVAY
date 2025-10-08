import dotenv from 'dotenv';
import agencyMatchingService from '../services/agencyMatchingService.js';
import mongoose from 'mongoose';
import Project from '../models/Project.js';

dotenv.config();

const testRecommendations = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  console.log('\n🧪 Testing AI Recommendation Engine\n');
  console.log('='.repeat(60));
  
  // Find an unassigned project
  const unassignedProject = await Project.findOne({
    assignments: { $exists: true, $size: 0 }
  });
  
  if (!unassignedProject) {
    console.log('❌ No unassigned projects found. Run seed script first.');
    process.exit(1);
  }
  
  console.log('\n📋 Test Project:');
  console.log(`   Name: ${unassignedProject.name}`);
  console.log(`   State: ${unassignedProject.state}`);
  console.log(`   District: ${unassignedProject.district}`);
  console.log(`   Component: ${unassignedProject.component}`);
  console.log(`   Budget: ₹${(unassignedProject.budget / 100000).toFixed(2)} Lakhs`);
  
  console.log('\n⏳ Generating recommendations...\n');
  
  const startTime = Date.now();
  
  try {
    const recommendations = await agencyMatchingService.getProjectAssignmentRecommendations(
      {
        name: unassignedProject.name,
        component: unassignedProject.component,
        district: unassignedProject.district,
        budget: unassignedProject.budget,
        description: unassignedProject.description,
      },
      unassignedProject.state
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (recommendations.success) {
      console.log(`✅ Recommendations generated in ${duration}s\n`);
      
      console.log('📊 Statistics:');
      console.log(`   Total Agencies Analyzed: ${recommendations.metadata.totalAgenciesAnalyzed}`);
      console.log(`   Qualified Agencies: ${recommendations.metadata.qualifiedAgencies}`);
      console.log(`   AI Analyzed: ${recommendations.metadata.aiAnalyzed}`);
      
      console.log('\n🎯 AI Recommendations:\n');
      recommendations.aiRecommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.agencyName} (${rec.confidenceScore}%)`);
        console.log(`   Recommendation: ${rec.recommendation}`);
        console.log(`   Reasoning: ${rec.reasoning}`);
        console.log(`   Strengths: ${rec.strengths.join(', ')}`);
        if (rec.concerns.length > 0) {
          console.log(`   Concerns: ${rec.concerns.join(', ')}`);
        }
        console.log(`   Best For: ${rec.bestFor}\n`);
      });
      
      console.log('💡 Summary:');
      console.log(`   ${recommendations.summary}\n`);
      
      console.log('📈 Rule-Based Scores (Top 5):');
      recommendations.ruleBasedScores.slice(0, 5).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.agency.name}: ${item.score}/100`);
        console.log(`      ${item.reasons.join(', ')}`);
      });
      
    } else {
      console.log(`❌ ${recommendations.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  process.exit(0);
};

testRecommendations();