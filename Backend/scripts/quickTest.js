import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agency from '../models/agencyModel.js';
import Project from '../models/projectModel.js';

dotenv.config();

const quickAnalysis = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  console.log('\n📊 Quick Database Analysis\n');
  console.log('='.repeat(50));
  
  // Agency Analysis
  const totalAgencies = await Agency.countDocuments();
  const agenciesByState = await Agency.aggregate([
    { $group: { _id: '$state', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\n🏢 Agencies:');
  console.log(`   Total: ${totalAgencies}`);
  agenciesByState.forEach(({ _id, count }) => {
    console.log(`   ${_id}: ${count}`);
  });
  
  // Project Analysis
  const totalProjects = await Project.countDocuments();
  const assignedProjects = await Project.countDocuments({ 
    assignments: { $exists: true, $ne: [] } 
  });
  const unassignedProjects = totalProjects - assignedProjects;
  
  const projectsByStatus = await Project.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\n📦 Projects:');
  console.log(`   Total: ${totalProjects}`);
  console.log(`   Assigned: ${assignedProjects}`);
  console.log(`   Unassigned: ${unassignedProjects}`);
  console.log('\n   By Status:');
  projectsByStatus.forEach(({ _id, count }) => {
    console.log(`      ${_id}: ${count}`);
  });
  
  // Agency Performance
  const agencyPerformance = await Project.aggregate([
    { $unwind: '$assignments' },
    {
      $lookup: {
        from: 'agencies',
        localField: 'assignments.agency',
        foreignField: '_id',
        as: 'agencyInfo'
      }
    },
    { $unwind: '$agencyInfo' },
    {
      $group: {
        _id: '$agencyInfo.name',
        totalProjects: { $sum: 1 },
        completedProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        }
      }
    },
    { $sort: { completedProjects: -1 } },
    { $limit: 10 }
  ]);
  
  console.log('\n🏆 Top 10 Agencies by Completed Projects:');
  agencyPerformance.forEach(({ _id, totalProjects, completedProjects }, index) => {
    const rate = ((completedProjects / totalProjects) * 100).toFixed(1);
    console.log(`   ${index + 1}. ${_id}`);
    console.log(`      Completed: ${completedProjects}/${totalProjects} (${rate}%)`);
  });
  
  // Recommendations-ready projects
  const recommendationReady = await Project.find({
    assignments: { $exists: true, $size: 0 },
    state: { $exists: true },
    district: { $exists: true },
    component: { $exists: true }
  }).limit(5);
  
  console.log('\n🎯 Projects Ready for AI Recommendations:');
  recommendationReady.forEach((project, index) => {
    console.log(`   ${index + 1}. ${project.name}`);
    console.log(`      ${project.state} - ${project.district} - ${project.component}`);
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  process.exit(0);
};

quickAnalysis();