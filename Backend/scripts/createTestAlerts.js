import mongoose from 'mongoose';
import Alert from '../models/alertModel.js';
import User from '../models/userModel.js';
import Project from '../models/projectModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestAlerts = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find test users and projects
  const agencyUser = await User.findOne({ role: 'ExecutingAgency' });
  const stateOfficer = await User.findOne({ role: 'StateOfficer' });
  const project = await Project.findOne();
  
  if (!agencyUser || !stateOfficer || !project) {
    console.error('❌ Missing required test data');
    process.exit(1);
  }
  
  // Create old agency alert (should escalate to state)
  await Alert.create({
    recipient: agencyUser._id,
    escalationLevel: 0,
    type: 'milestone_overdue',
    severity: 'critical',
    project: project._id,
    agency: project.assignments[0]?.agency,
    message: 'TEST: Milestone overdue - should escalate to state',
    acknowledged: false,
    autoResolved: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });
  
  // Create old state alert (should escalate to admin)
  await Alert.create({
    recipient: stateOfficer._id,
    escalationLevel: 1,
    type: 'escalated_behind_schedule',
    severity: 'critical',
    project: project._id,
    message: 'TEST: Escalated alert - should escalate to admin',
    acknowledged: false,
    autoResolved: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  });
  
  console.log('✅ Test alerts created');
  process.exit(0);
};

createTestAlerts();