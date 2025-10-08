import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agency from '../models/agencyModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding...');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// ✅ CORRECT GEOGRAPHIC COORDINATES FOR INDIAN DISTRICTS
const districtCoordinates = {
  // West Bengal
  'Kolkata': [88.3639, 22.5726],
  'Howrah': [88.3106, 22.5958],
  'Darjeeling': [88.2663, 27.0410],
  'Siliguri': [88.4279, 26.7271],
  'Durgapur': [87.3119, 23.5204],
  
  // Maharashtra
  'Mumbai': [72.8777, 19.0760],
  'Pune': [73.8567, 18.5204],
  'Nagpur': [79.0882, 21.1458],
  'Nashik': [73.7898, 19.9975],
  'Aurangabad': [75.3433, 19.8762],
  
  // Karnataka
  'Bangalore': [77.5946, 12.9716],
  'Mysore': [76.6394, 12.2958],
  'Mangalore': [74.8560, 12.9141],
  'Hubli': [75.1240, 15.3647],
  'Belgaum': [74.4977, 15.8497],
  
  // Tamil Nadu
  'Chennai': [80.2707, 13.0827],
  'Coimbatore': [76.9558, 11.0168],
  'Madurai': [78.1198, 9.9252],
  'Trichy': [78.7047, 10.7905],
  'Salem': [78.1460, 11.6643],
  
  // Gujarat
  'Ahmedabad': [72.5714, 23.0225],
  'Surat': [72.8311, 21.1702],
  'Vadodara': [73.1812, 22.3072],
  'Rajkot': [70.8022, 22.3039],
  'Bhavnagar': [72.1519, 21.7645],
  
  // Rajasthan
  'Jaipur': [75.7873, 26.9124],
  'Jodhpur': [73.0243, 26.2389],
  'Udaipur': [73.7125, 24.5854],
  'Kota': [75.8648, 25.2138],
  'Ajmer': [74.6399, 26.4499],
};

// Helper function to get coordinates with small random offset for multiple projects in same district
const getCoordinatesForDistrict = (district) => {
  const baseCoords = districtCoordinates[district];
  if (!baseCoords) {
    console.warn(`⚠️  No coordinates found for ${district}, using default`);
    return [77.5946, 12.9716]; // Default to Bangalore
  }
  
  // Add small random offset (±0.05 degrees, roughly ±5km) for variation
  const offset = () => (Math.random() - 0.5) * 0.1;
  return [
    baseCoords[0] + offset(),
    baseCoords[1] + offset()
  ];
};

// Indian States and Districts
const statesData = [
  {
    state: 'West Bengal',
    districts: ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Durgapur'],
    officer: {
      name: 'Deb Kumar',
      email: 'debk619@gmail.com',
    }
  },
  {
    state: 'Maharashtra',
    districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  },
  {
    state: 'Karnataka',
    districts: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  },
  {
    state: 'Tamil Nadu',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'],
  },
  {
    state: 'Gujarat',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  },
  {
    state: 'Rajasthan',
    districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  },
];

// Agency Types
const agencyTypes = [
  'NGO',
  'Construction Company',
  'Educational Institution',
  'Social Welfare Organization',
  'Community Development Group',
  'Infrastructure Developer',
];

// Project Components
const components = ['Adarsh Gram', 'GIA', 'Hostel'];

// Project Statuses with weighted distribution
const statusWeights = [
  { status: 'Completed', weight: 0.35 },      // 35% completed
  { status: 'On Track', weight: 0.30 },       // 30% on track
  { status: 'Delayed', weight: 0.20 },        // 20% delayed
  { status: 'Pending Approval', weight: 0.15 } // 15% pending
];

const getWeightedStatus = () => {
  const random = Math.random();
  let cumulative = 0;
  for (const { status, weight } of statusWeights) {
    cumulative += weight;
    if (random < cumulative) return status;
  }
  return 'On Track';
};

// Generate realistic agency names
const agencyNamePrefixes = [
  'Bharat', 'Seva', 'Jan', 'Samaj', 'Vikas', 'Kalyan', 
  'Pragati', 'Uddhar', 'Sahyog', 'Navjyoti', 'Samrudhi',
  'Sterling', 'Pioneer', 'Apex', 'Prime', 'Elite',
];

const agencyNameSuffixes = [
  'Foundation', 'Trust', 'Society', 'Welfare Association',
  'Development Agency', 'Builders', 'Constructions', 
  'Contractors', 'Infrastructure', 'Services',
];

const generateAgencyName = () => {
  const prefix = agencyNamePrefixes[Math.floor(Math.random() * agencyNamePrefixes.length)];
  const suffix = agencyNameSuffixes[Math.floor(Math.random() * agencyNameSuffixes.length)];
  return `${prefix} ${suffix}`;
};

// Generate realistic project names
const projectPrefixes = [
  'PM-AJAY', 'Integrated', 'Community', 'Rural', 'Urban',
  'Model', 'Smart', 'Digital', 'Sustainable', 'Green',
];

const projectTypes = [
  'Village Development', 'School Building', 'Hostel Construction',
  'Community Center', 'Skill Training Center', 'Health Center',
  'Library Building', 'Sports Complex', 'Vocational Training Center',
];

const generateProjectName = (component, district) => {
  const prefix = projectPrefixes[Math.floor(Math.random() * projectPrefixes.length)];
  const type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
  return `${prefix} ${type} - ${district}`;
};

// Random date generator
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate budget based on component
const generateBudget = (component) => {
  const budgetRanges = {
    'Adarsh Gram': { min: 5000000, max: 20000000 }, // 50L - 2Cr
    'GIA': { min: 2000000, max: 10000000 }, // 20L - 1Cr
    'Hostel': { min: 10000000, max: 50000000 }, // 1Cr - 5Cr
  };
  
  const range = budgetRanges[component];
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
};

// Generate mobile number
const generateMobile = () => {
  return `98${Math.floor(10000000 + Math.random() * 90000000)}`;
};

// Seed State Officers
const seedStateOfficers = async () => {
  console.log('\n📋 Seeding State Officers...');
  
  const stateOfficers = [];
  
  for (const stateData of statesData) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const officer = {
      fullName: stateData.officer?.name || `${stateData.state} State Officer`,
      email: stateData.officer?.email || `officer.${stateData.state.toLowerCase().replace(/ /g, '')}@samanvay.gov.in`,
      password: hashedPassword,
      mobile: generateMobile(),
      role: 'StateOfficer',
      state: stateData.state,
      isActive: true,
    };
    
    stateOfficers.push(officer);
  }
  
  // ✅ UPDATED: Use updateMany with upsert to avoid duplicates
  for (const officer of stateOfficers) {
    await User.updateOne(
      { email: officer.email },
      { $set: officer },
      { upsert: true }
    );
  }
  
  const createdOfficers = await User.find({ role: 'StateOfficer' });
  
  console.log(`✅ Created/Updated ${createdOfficers.length} state officers`);
  createdOfficers.forEach(officer => {
    console.log(`   📧 ${officer.email} / password123`);
  });
  
  return createdOfficers;
};

// Seed Agencies
const seedAgencies = async () => {
  console.log('\n🏢 Seeding Agencies...');
  
  const agencies = [];
  
  for (const stateData of statesData) {
    // Create 8-12 agencies per state
    const agencyCount = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < agencyCount; i++) {
      const district = stateData.districts[Math.floor(Math.random() * stateData.districts.length)];
      const agencyType = agencyTypes[Math.floor(Math.random() * agencyTypes.length)];
      const agencyName = generateAgencyName();
      
      const agency = {
        name: `${agencyName} - ${district}`,
        type: agencyType,
        state: stateData.state,
        district: district,
        contactPerson: `${['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Pooja'][Math.floor(Math.random() * 6)]} ${['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy'][Math.floor(Math.random() * 5)]}`,
        email: `${agencyName.toLowerCase().replace(/ /g, '.')}.${district.toLowerCase()}@agency.com`,
        mobile: generateMobile(),
        address: `${Math.floor(Math.random() * 500) + 1}, ${['MG Road', 'Main Street', 'Station Road', 'Park Avenue', 'Gandhi Nagar'][Math.floor(Math.random() * 5)]}, ${district}`,
        status: 'Active',
        registrationNumber: `REG/${stateData.state.substring(0, 2).toUpperCase()}/${district.substring(0, 3).toUpperCase()}/${Math.floor(1000 + Math.random() * 9000)}`,
      };
      
      agencies.push(agency);
    }
  }
  
  await Agency.deleteMany({});
  const createdAgencies = await Agency.insertMany(agencies);
  
  console.log(`✅ Created ${createdAgencies.length} agencies across ${statesData.length} states`);
  
  // Show distribution
  statesData.forEach(stateData => {
    const count = createdAgencies.filter(a => a.state === stateData.state).length;
    console.log(`   ${stateData.state}: ${count} agencies`);
  });
  
  return createdAgencies;
};

// Seed Projects with Assignment History
const seedProjects = async (agencies, stateOfficers) => {
  console.log('\n📦 Seeding Projects...');
  
  const projects = [];
  const assignmentHistory = [];
  
  for (const stateData of statesData) {
    const stateAgencies = agencies.filter(a => a.state === stateData.state);
    const stateOfficer = stateOfficers.find(o => o.state === stateData.state);
    
    // Create 15-25 projects per state
    const projectCount = Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < projectCount; i++) {
      const district = stateData.districts[Math.floor(Math.random() * stateData.districts.length)];
      const component = components[Math.floor(Math.random() * components.length)];
      const status = getWeightedStatus(); // ✅ UPDATED: Using weighted distribution
      
      const startDate = randomDate(new Date(2023, 0, 1), new Date(2024, 0, 1));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 12) + 6);
      
      const budget = generateBudget(component);
      
      // ✅ UPDATED: 85% assigned, 15% unassigned
      const shouldAssign = Math.random() > 0.15;
      
      let progress = 0;
      let assignments = [];
      
      if (shouldAssign && stateAgencies.length > 0) {
        // Assign to 1-3 agencies
        const numAgencies = Math.floor(Math.random() * 3) + 1;
        const selectedAgencies = [];
        
        // Prefer agencies from same district
        const localAgencies = [...stateAgencies.filter(a => a.district === district)];
        const otherAgencies = [...stateAgencies.filter(a => a.district !== district)];
        
        for (let j = 0; j < Math.min(numAgencies, stateAgencies.length); j++) {
          let agency;
          if (localAgencies.length > 0 && Math.random() > 0.3) {
            const index = Math.floor(Math.random() * localAgencies.length);
            agency = localAgencies.splice(index, 1)[0];
          } else if (otherAgencies.length > 0) {
            const index = Math.floor(Math.random() * otherAgencies.length);
            agency = otherAgencies.splice(index, 1)[0];
          }
          
          if (agency) selectedAgencies.push(agency);
        }
        
        // Create assignments
        const budgetPerAgency = Math.floor(budget / selectedAgencies.length);
        
        selectedAgencies.forEach(agency => {
          const numMilestones = Math.floor(Math.random() * 5) + 3;
          const checklist = [];
          
          const milestoneTemplates = [
            'Site survey and preparation',
            'Foundation and structural work',
            'Construction of main building',
            'Electrical and plumbing installation',
            'Interior finishing work',
            'External landscaping',
            'Final inspection and handover',
            'Equipment installation',
            'Staff training and orientation',
            'Documentation and reporting',
          ];
          
          for (let k = 0; k < numMilestones; k++) {
            checklist.push({
              text: milestoneTemplates[k % milestoneTemplates.length],
              completed: status === 'Completed' ? true : Math.random() > 0.5,
            });
          }
          
          assignments.push({
            agency: agency._id,
            allocatedFunds: budgetPerAgency,
            checklist,
          });
          
          // Track assignment history
          assignmentHistory.push({
            agencyId: agency._id,
            component,
            status,
            completedOn: status === 'Completed' ? new Date() : null,
          });
        });
        
        // Calculate progress based on status
        if (status === 'Completed') {
          progress = 100;
        } else if (status === 'On Track') {
          progress = Math.floor(Math.random() * 40) + 40; // 40-80%
        } else if (status === 'Delayed') {
          progress = Math.floor(Math.random() * 30) + 20; // 20-50%
        } else {
          progress = Math.floor(Math.random() * 20); // 0-20%
        }
      }
      
      const project = {
        name: generateProjectName(component, district),
        state: stateData.state,
        district,
        component,
        status: shouldAssign ? status : 'Pending Approval',
        progress,
        budget,
        startDate,
        endDate,
        description: `Implementation of ${component} scheme in ${district} district under PM-AJAY program. This project aims to provide comprehensive development and welfare services to the scheduled caste community.`,
        assignments,
        // ✅ UPDATED: Using correct coordinates
        location: {
          type: 'Point',
          coordinates: getCoordinatesForDistrict(district),
        },
        createdBy: stateOfficer?._id,
      };
      
      projects.push(project);
    }
  }
  
  await Project.deleteMany({});
  const createdProjects = await Project.insertMany(projects);
  
  console.log(`✅ Created ${createdProjects.length} projects`);
  
  // Show statistics
  console.log('\n📊 Project Statistics:');
  statesData.forEach(stateData => {
    const stateProjects = createdProjects.filter(p => p.state === stateData.state);
    const assigned = stateProjects.filter(p => p.assignments.length > 0).length;
    const unassigned = stateProjects.length - assigned;
    
    console.log(`\n   ${stateData.state}:`);
    console.log(`      Total: ${stateProjects.length}`);
    console.log(`      Assigned: ${assigned}`);
    console.log(`      Unassigned: ${unassigned}`);
    
    // Show status distribution
    const statusCounts = {};
    stateProjects.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`);
    });
  });
  
  // Show component distribution
  console.log('\n   By Component:');
  components.forEach(component => {
    const count = createdProjects.filter(p => p.component === component).length;
    console.log(`      ${component}: ${count}`);
  });
  
  // Show assignment statistics
  console.log('\n   Assignment History:');
  const agencyStats = {};
  assignmentHistory.forEach(({ agencyId, component, status }) => {
    const key = agencyId.toString();
    if (!agencyStats[key]) {
      agencyStats[key] = { total: 0, completed: 0, components: {} };
    }
    agencyStats[key].total++;
    if (status === 'Completed') agencyStats[key].completed++;
    agencyStats[key].components[component] = (agencyStats[key].components[component] || 0) + 1;
  });
  
  const topAgencies = Object.entries(agencyStats)
    .sort((a, b) => b[1].completed - a[1].completed)
    .slice(0, 5);
  
  console.log('   Top 5 Agencies by Completed Projects:');
  for (const [agencyId, stats] of topAgencies) {
    const agency = agencies.find(a => a._id.toString() === agencyId);
    console.log(`      ${agency?.name}: ${stats.completed} completed / ${stats.total} total`);
  }
  
  return createdProjects;
};

// Seed Agency Users
const seedAgencyUsers = async () => {
  console.log('\n👥 Seeding Agency Users...');
  
  const agencyUsers = [];
  
  // Re-fetch agencies to ensure all fields are populated
  const agencies = await Agency.find({});
  
  for (const agency of agencies) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = {
      fullName: agency.contactPerson || 'Agency Contact',
      email: agency.email,
      password: hashedPassword,
      mobile: agency.mobile || generateMobile(),
      role: 'ExecutingAgency',
      state: agency.state,
      district: agency.district,
      agencyId: agency._id,
      isActive: true,
    };
    
    agencyUsers.push(user);
  }
  
  await User.deleteMany({ role: 'ExecutingAgency' });
  const createdUsers = await User.insertMany(agencyUsers);
  
  console.log(`✅ Created ${createdUsers.length} agency users`);
  console.log(`   📧 Login: [agency-email] / password123`);
  
  return createdUsers;
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting database seeding...\n');
    console.log('=' .repeat(60));
    
    const stateOfficers = await seedStateOfficers();
    const agencies = await seedAgencies();
    const projects = await seedProjects(agencies, stateOfficers);
    const agencyUsers = await seedAgencyUsers();
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Database seeding completed successfully!\n');
    
    console.log('📝 Summary:');
    console.log(`   States: ${statesData.length}`);
    console.log(`   State Officers: ${stateOfficers.length}`);
    console.log(`   Agencies: ${agencies.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Agency Users: ${agencyUsers.length}`);
    
    console.log('\n🔐 Test Credentials:');
    console.log('\n   🌟 YOUR ACCOUNT (West Bengal):');
    console.log(`      📧 debk619@gmail.com / password123`);
    
    console.log('\n   Other State Officers:');
    stateOfficers.filter(o => o.email !== 'debk619@gmail.com').forEach(officer => {
      console.log(`      ${officer.email} / password123`);
    });
    
    console.log('\n   Sample Agency Users (West Bengal):');
    const wbAgencies = agencyUsers.filter(u => u.state === 'West Bengal').slice(0, 3);
    wbAgencies.forEach(user => {
      console.log(`      ${user.email} / password123`);
    });
    
    console.log('\n🗺️  Geographic Coverage:');
    console.log('   All projects now have CORRECT coordinates:');
    statesData.forEach(stateData => {
      const districtList = stateData.districts.join(', ');
      console.log(`   ${stateData.state}: ${districtList}`);
    });
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Login as: debk619@gmail.com / password123');
    console.log('   2. Go to Projects page');
    console.log('   3. Click on an unassigned project (orange highlight)');
    console.log('   4. Click "Assign Project"');
    console.log('   5. Test AI recommendations!');
    console.log('   6. Check GIS map - locations should be accurate now!');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed
seedDatabase();