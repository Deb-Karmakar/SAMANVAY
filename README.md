# SAMANVAY - System for Agency Mapping And Nodal VAYavastha

![SAMANVAY Logo](https://img.shields.io/badge/SAMANVAY-System%20for%20Agency%20Mapping-blue?style=for-the-badge)
![PM-AJAY](https://img.shields.io/badge/PM--AJAY-Management%20System-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=flat-square&logo=mongodb)

**SAMANVAY** is a comprehensive digital platform specifically designed for the **PM-AJAY (Prime Minister's Atal Jyoti Abhiyan Yojana)** scheme management. The system streamlines coordination between government agencies and implementing bodies for effective project management, real-time monitoring, financial tracking through PFMS integration, blockchain-based transparency using Hyperledger Fabric, and intelligent alert systems with automated escalation workflows.

## 🏛️ Project Overview

SAMANVAY serves as the unified digital backbone for PM-AJAY scheme implementation across India. It manages three major components:
- **Adarsh Gram** (Model Village) projects
- **GIA** (Grant-in-Aid) programs  
- **Hostel** construction and maintenance projects

The platform provides three distinct user roles with specialized dashboards and role-based access control:

- **Central Admin**: National-level oversight, PFMS data management, and policy implementation
- **State Officers**: State-level project management, agency coordination, and progress monitoring
- **Executing Agencies**: Ground-level project execution, milestone tracking, and utilization reporting

## ✨ Key Features

### 🎯 Core Functionalities
- **Three-Tier Role System**: Central Admin, State Officers, and Executing Agencies with distinct permissions
- **Project Lifecycle Management**: Complete workflow from project creation to completion
- **Agency Management**: Registration, onboarding, and assignment workflows
- **Milestone Tracking**: Checklist-based project monitoring with proof of work uploads
- **Financial Integration**: Real-time PFMS data synchronization and utilization reporting
- **Blockchain Transparency**: Hyperledger Fabric network for immutable audit trails and smart contracts
- **Geographic Visualization**: Interactive maps with project locations using Leaflet
- **Document Management**: PDF generation for project approvals and assignment orders
- **Communication System**: Email notifications and in-app messaging
- **Progress Monitoring**: Real-time status updates and completion tracking

### 📊 Advanced Analytics & Dashboards
- **Admin Dashboard**: National-level overview with state performance metrics
- **State Dashboard**: State-specific project tracking and agency performance
- **Agency Dashboard**: Project assignments, deadlines, and budget utilization
- **PFMS Dashboard**: Financial data visualization with quarterly trends
- **Performance Analytics**: State comparisons, agency rankings, and completion rates
- **Budget Analysis**: Allocation vs utilization with trend forecasting
- **Predictive Insights**: Risk scoring and performance predictions

### 🔔 Intelligent Alert System
- **Multi-Level Escalation**: Agency → State → Admin escalation workflow
- **Automated Alert Generation**: Deadline tracking, inactivity detection, review delays
- **Smart Notifications**: Email + in-app alerts with snooze functionality
- **Performance-Based Alerts**: High rejection rates, consecutive failures
- **Timeline Alerts**: Behind schedule detection, milestone overdue warnings
- **Auto-Resolution**: Alerts automatically resolve when conditions improve
- **Escalation Analytics**: Statistics and tracking for unresolved issues

### ⛓️ Blockchain Infrastructure & Smart Contracts
- **Hyperledger Fabric Network**: Multi-organization blockchain with government entities as peers
- **Immutable Audit Trails**: All project activities, fund transfers, and approvals recorded on blockchain
- **Smart Contract Automation**: Automated milestone payments and approval workflows
- **Digital Asset Management**: Tokenized representation of project assets and certificates
- **Transparent Fund Tracking**: Complete visibility of fund flow from allocation to utilization
- **Consensus-Based Approvals**: Multi-signature validation for critical project decisions
- **Chaincode Integration**: Custom business logic for PM-AJAY scheme compliance
- **Permissioned Access**: Role-based blockchain access with encrypted data channels
- **Cross-Ledger Reconciliation**: Automated matching between PFMS and blockchain records

### 🏦 PFMS Integration Features
- **Real-time Data Sync**: Daily, weekly, and monthly PFMS data synchronization
- **Financial Tracking**: Fund release, utilization, and pending amounts
- **State-wise Analysis**: Component breakdown by Adarsh Gram, GIA, and Hostel
- **Quarterly Reporting**: Automated trend analysis and performance metrics
- **Utilization Certificates**: PDF generation and approval workflows
- **Budget Reconciliation**: Project data integration with PFMS figures
- **Predictive Analytics**: Risk assessment and utilization forecasting

### 🤖 AI-Powered Features

#### 🎯 Smart Agency Recommendation System
- **Hybrid AI Engine**: Combines rule-based scoring with Groq LLaMA 3.1 8B model
- **Multi-Factor Analysis**: 6 key metrics with weighted scoring (100-point scale)
  - **Completion Rate** (25 points): Historical project success rate
  - **Experience Match** (20 points): Similar project component expertise
  - **Current Workload** (20 points): Capacity and availability assessment
  - **Geographic Proximity** (20 points): District/state location matching
  - **Budget Efficiency** (10 points): Financial utilization track record
  - **New Agency Bonus** (5 points): Fair opportunity for emerging agencies
- **AI Enhancement**: LLaMA model provides contextual analysis and confidence scoring
- **State Officer Exclusive**: Available only to State Officers for project assignment
- **Intelligent Filtering**: Minimum qualification threshold with transparent scoring

#### 💬 AI Assistant Chatbot
- **Role-Aware Intelligence**: Context-sensitive responses based on user role and permissions
- **Real-Time Data Integration**: Fetches live project, agency, and performance data
- **Conversational Memory**: Maintains chat history for contextual conversations
- **Groq-Powered**: Uses LLaMA 3.1 8B Instant model for fast, accurate responses
- **Smart Suggestions**: Role-specific question recommendations
- **Multi-User Support**: Concurrent conversations with personalized context
- **Government-Grade**: Professional tone with scheme-specific knowledge

## ⚙️ Automated Systems

### 🔔 Alert System Architecture

The SAMANVAY alert system uses a sophisticated multi-level escalation mechanism:

**Alert Types:**
- `deadline_approaching`: Projects nearing completion deadlines
- `inactive_project`: No activity for 14+ days
- `behind_schedule`: Progress below expected timeline
- `high_rejection_rate`: Agency rejection rate >40%
- `consecutive_rejections`: 2+ consecutive milestone rejections
- `slow_review`: State officer review pending 3+ days
- `milestone_due_soon`: Milestone due in ≤3 days
- `milestone_overdue`: Past due milestones

**Escalation Workflow:**
1. **Level 0**: Original alert sent to responsible party
2. **Level 1**: After 2 days → Escalated to State Officer
3. **Level 2**: After 5 days → Escalated to Central Admin

**Auto-Resolution:** Alerts automatically resolve when conditions improve

### ⏰ Cron Job Schedule

**Alert Processing (Daily 2:00 AM IST):**
```javascript
// Nightly Job Workflow:
1. Generate new alerts for all active projects
2. Update project statuses based on progress
3. Escalate unacknowledged alerts
4. Auto-resolve fixed conditions
5. Send email notifications
```

**PFMS Synchronization:**
- **Daily Sync**: 3:00 AM IST - PFMS data + project reconciliation
- **Weekly Analysis**: Sunday 1:00 AM IST - Comprehensive analysis
- **Monthly Reconciliation**: 1st of month 2:00 AM IST - Full reconciliation

### 🤖 AI Recommendation Algorithm

**Phase 1: Rule-Based Scoring Engine**
```javascript
// Scoring Algorithm (100-point scale)
1. Completion Rate (25 points)
   - Historical success rate of completed projects
   - Formula: (Completed Projects / Total Projects) * 25

2. Experience Match (20 points)  
   - Count of similar component projects (Adarsh Gram/GIA/Hostel)
   - Formula: min(Similar Projects * 4, 20)

3. Current Workload (20 points)
   - Penalty system for overloaded agencies
   - 0 projects: 20 points, 1-2: 18 points, 3-4: 15 points, 5-6: 10 points, 7+: 5 points

4. Geographic Proximity (20 points)
   - Same district: 20 points, Different district: 10 points

5. Budget Efficiency (10 points)
   - Average utilization rate of allocated funds
   - Formula: (Average Efficiency / 100) * 10

6. New Agency Bonus (5 points)
   - Encouragement for agencies with no project history
```

**Phase 2: AI Enhancement**
```javascript
// Groq LLaMA 3.1 8B Analysis
- Contextual evaluation of rule-based scores
- Confidence scoring (0-100%)
- Strength/weakness analysis
- Risk assessment
- Final ranking with reasoning
- Recommendation levels: "Highly Recommended", "Recommended", "Consider"
```

**Qualification Threshold:** Minimum 40/100 points to be considered by AI

## 🏗️ System Architecture

```
SAMANVAY/
├── Backend/                 # Node.js Express API Server
│   ├── controllers/         # Route handlers and business logic
│   ├── models/             # MongoDB data models
│   ├── routes/             # API route definitions
│   ├── middleware/         # Authentication and upload middleware
│   ├── services/           # Business logic and external integrations
│   ├── blockchain/         # Hyperledger Fabric integration
│   │   ├── gateway.js      # Fabric Gateway API client
│   │   ├── wallet.js       # Identity wallet management
│   │   └── contracts.js    # Smart contract interactions
│   ├── chaincode/          # Smart contract business logic
│   │   ├── project.js      # Project lifecycle chaincode
│   │   ├── fund.js         # Financial transaction chaincode
│   │   └── audit.js        # Audit trail chaincode
│   ├── fabric-network/     # Hyperledger Fabric network configuration
│   │   ├── docker/         # Docker compose files for network
│   │   ├── configtx/       # Channel and genesis block config
│   │   ├── crypto-config/  # Cryptographic materials
│   │   └── scripts/        # Network management scripts
│   ├── config/             # Database and configuration
│   └── uploads/            # File storage directory
│
└── Frontend/               # React-based Web Application
    └── SAMANVAY/
        ├── src/
        │   ├── components/  # Reusable UI components
        │   │   └── blockchain/  # Blockchain-specific UI components
        │   ├── pages/       # Role-specific page components
        │   ├── contexts/    # React context providers
        │   ├── lib/         # Utility functions
        │   └── data/        # Static data files
        └── public/         # Static assets and Indian state topojson files
```

## 🛠️ Technology Stack

### Backend Technologies
- **Runtime**: Node.js with ES6+ modules
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Hyperledger Fabric 2.5.x with Node.js SDK
- **Authentication**: JWT tokens with bcrypt hashing
- **AI/ML Services**: Groq SDK with LLaMA 3.1 8B Instant model
- **Smart Contracts**: Hyperledger Fabric Chaincode (JavaScript/TypeScript)
- **File Handling**: Multer for multipart uploads
- **PDF Generation**: PDFKit for report generation
- **Web Scraping**: Puppeteer for data extraction
- **Cron Jobs**: Node-cron for scheduled tasks
- **Email Service**: Nodemailer for notifications

### Frontend Technologies
- **Framework**: React 19.x with React Router DOM
- **Build Tool**: Vite with PWA support
- **Styling**: Tailwind CSS with custom components
- **UI Library**: Radix UI primitives
- **State Management**: TanStack Query for server state
- **Charts**: Recharts for data visualization
- **Maps**: React Leaflet with clustering support
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React and React Icons
- **Animations**: Framer Motion

### Development Tools
- **Linting**: ESLint with React-specific rules
- **Type Safety**: TypeScript configuration
- **Version Control**: Git with conventional commits
- **Package Management**: npm with lock files

## 📋 Prerequisites

Before setting up SAMANVAY, ensure you have:

- **Node.js** (v18.0 or higher)
- **npm** (v8.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Docker** (v20.0 or higher) for Hyperledger Fabric
- **Docker Compose** (v2.0 or higher)
- **Hyperledger Fabric** (v2.5.x) with sample binaries
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SAMANVAY.git
cd SAMANVAY
```

### 2. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
nano .env
```

**Backend Environment Variables:**
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/samanvay

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# PFMS Integration (if applicable)
PFMS_API_URL=https://pfms.gov.in/api
PFMS_API_KEY=your_pfms_api_key

# AI Services Configuration
GROQ_API_KEY=your_groq_api_key_for_llama

# Hyperledger Fabric Configuration
FABRIC_NETWORK_PATH=./fabric-network
FABRIC_CHANNEL_NAME=samanvay-channel
FABRIC_CHAINCODE_NAME=samanvay-chaincode
FABRIC_ORG_MSP_ID=SamanvayMSP
FABRIC_PEER_ENDPOINT=grpc://localhost:7051
FABRIC_ORDERER_ENDPOINT=grpc://localhost:7050
FABRIC_CA_ENDPOINT=https://localhost:7054
FABRIC_WALLET_PATH=./wallet
FABRIC_CONNECTION_PROFILE=./connection-profile.json

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd Frontend/SAMANVAY

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
nano .env
```

**Frontend Environment Variables:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SAMANVAY
```

### 4. Database Setup
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or using MongoDB Atlas (cloud)
# Update MONGO_URI in .env with your Atlas connection string
```

### 5. Hyperledger Fabric Network Setup
```bash
# Navigate to fabric network directory
cd Backend/fabric-network

# Start the Hyperledger Fabric network
./network.sh up createChannel -c samanvay-channel

# Deploy the SAMANVAY chaincode
./network.sh deployCC -ccn samanvay-chaincode -ccp ../chaincode -ccl javascript

# Initialize the ledger with genesis data
node scripts/initLedger.js

# Verify network status
docker ps -f label=service=hyperledger-fabric
```

## 🏃‍♂️ Running the Application

### Development Mode

**Start Backend Server:**
```bash
cd Backend
npm run dev
# Server will run on http://localhost:5000
```

**Start Frontend Development Server:**
```bash
cd Frontend/SAMANVAY
npm run dev
# Application will open on http://localhost:5173
```

### Production Mode

**Build and Deploy:**
```bash
# Build Frontend
cd Frontend/SAMANVAY
npm run build

# Start Backend in production
cd ../../Backend
NODE_ENV=production npm start
```

## 👥 User Roles & Access

### 🏛️ Central Admin
**Capabilities:**
- National-level dashboard with comprehensive analytics
- Agency approval and management
- State performance monitoring
- PFMS data integration and analysis
- Policy implementation tracking
- Multi-state project oversight

**Default Credentials:** (Change in production)
```
Email: admin@samanvay.gov.in
Password: admin123
```

### 🏢 State Officer
**Capabilities:**
- State-specific project management
- Agency assignment and coordination
- Progress review and approval
- Fund allocation monitoring
- Performance reporting
- Inter-agency communication

**Registration:** State officers register through the signup portal and await admin approval.

### 🏭 Executing Agency
**Capabilities:**
- Project milestone tracking
- Progress report submission
- Financial utilization reporting
- Proof of work uploads
- Real-time status updates
- Direct communication with state officers

**Onboarding:** Agencies register and are approved by respective state officers.

## 🤖 AI Features Usage

### Smart Agency Recommendation Workflow

**For State Officers:**
1. **Create New Project**: Fill project details (name, component, district, budget)
2. **Request AI Recommendations**: System analyzes all active agencies in your state
3. **Review AI Analysis**: Get ranked recommendations with confidence scores
4. **View Detailed Reasoning**: Understand why each agency was recommended
5. **Make Informed Decision**: Assign project based on AI insights

**Example API Request:**
```javascript
POST /api/agency-matching/recommendations
{
  "name": "Rural Connectivity Project Phase 2",
  "component": "Adarsh Gram", 
  "district": "Pune",
  "budget": 5000000,
  "description": "Digital infrastructure development"
}
```

**Example AI Response:**
```javascript
{
  "success": true,
  "aiRecommendations": [
    {
      "agencyName": "Maharashtra Rural Development Corp",
      "rank": 1,
      "confidenceScore": 87,
      "recommendation": "Highly Recommended",
      "reasoning": "Excellent track record with 15 Adarsh Gram projects completed...",
      "strengths": ["High completion rate (95%)", "Local presence in Pune"],
      "concerns": [],
      "bestFor": "Complex rural development with proven expertise"
    }
  ],
  "summary": "Strong candidates available with excellent local expertise."
}
```

### AI Chatbot Usage Examples

**Central Admin Queries:**
- "What's the national project completion rate?"
- "Show me states with budget utilization below 60%"
- "How many agencies are pending approval?"

**State Officer Queries:**
- "List projects in my state that are behind schedule"
- "Which agencies in my state have the highest completion rates?"
- "How do I get AI recommendations for project assignment?"

**Executing Agency Queries:**
- "What are my upcoming project deadlines?"
- "How do I upload proof of work for milestone completion?"
- "Show my current budget utilization status"

## 🗄️ Database Schema

### Core Models

**User Model:**
```javascript
{
  fullName: String,
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  mobile: String,
  role: Enum ['CentralAdmin', 'StateOfficer', 'ExecutingAgency'],
  state: String,           // For StateOfficer & ExecutingAgency
  district: String,        // For ExecutingAgency
  designation: String,     // For CentralAdmin
  agencyName: String,      // For ExecutingAgency
  agencyType: String,      // For ExecutingAgency
  agencyId: ObjectId,      // Reference to Agency
  isActive: Boolean,
  timestamps: true
}
```

**Project Model:**
```javascript
{
  name: String,
  state: String,
  district: String,
  component: Enum ['Adarsh Gram', 'GIA', 'Hostel'],
  status: Enum ['Pending Approval', 'On Track', 'Delayed', 'Completed'],
  progress: Number (0-100),
  budget: Number,
  startDate: Date,
  endDate: Date,
  
  // Assignment structure with embedded checklists
  assignments: [{
    agency: ObjectId (ref: Agency),
    allocatedFunds: Number,
    checklist: [{
      text: String,
      completed: Boolean,
      status: Enum ['Not Started', 'Pending Review', 'Approved', 'Rejected'],
      proofImages: [String],  // File URLs
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: ObjectId (ref: User),
      reviewComments: String
    }]
  }],
  
  // GeoJSON for mapping
  location: {
    type: 'Point',
    coordinates: [Number, Number]  // [longitude, latitude]
  },
  
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

**Agency Model:**
```javascript
{
  name: String (unique),
  type: String,
  state: String,
  district: String,
  contactPerson: String,
  email: String,
  status: Enum ['Active', 'Onboarding', 'Inactive'],
  timestamps: true
}
```

**Alert Model:**
```javascript
{
  recipient: ObjectId (ref: User, indexed),
  escalationLevel: Number (0=Normal, 1=State, 2=Admin),
  type: String (40+ alert types including escalated variants),
  severity: Enum ['critical', 'warning', 'info'],
  project: ObjectId (ref: Project, indexed),
  agency: ObjectId (ref: Agency),
  message: String,
  metadata: Mixed,
  
  // Status tracking
  acknowledged: Boolean (indexed),
  acknowledgedBy: ObjectId (ref: User),
  acknowledgedAt: Date,
  autoResolved: Boolean (indexed),
  resolvedAt: Date,
  snoozedUntil: Date,
  timestamps: true
}
```

**PFMS Data Model:**
```javascript
{
  fiscalYear: String (unique, indexed),
  
  // National totals
  totalAllocated: Number,
  totalReleased: Number,
  totalUtilized: Number,
  totalPending: Number,
  nationalUtilizationRate: Number,
  nationalReleaseRate: Number,
  
  // Component breakdown
  componentBreakdown: [{
    component: Enum ['Adarsh Gram', 'GIA', 'Hostel'],
    allocated: Number,
    released: Number,
    utilized: Number,
    pending: Number,
    projects: Number,
    completedProjects: Number
  }],
  
  // State-wise data
  stateBreakdown: [{
    state: String,
    allocated: Number,
    released: Number,
    utilized: Number,
    pending: Number,
    utilizationRate: Number,
    releaseRate: Number,
    performance: Enum ['Excellent', 'Good', 'Average', 'Poor'],
    components: [ComponentBreakdown],
    lastSync: Date
  }],
  
  // Quarterly trends
  quarterlyData: [{
    quarter: Enum ['Q1', 'Q2', 'Q3', 'Q4'],
    released: Number,
    utilized: Number,
    projects: Number
  }],
  
  // AI/ML predictions
  predictions: {
    projectedUtilization: Number,
    projectedCompletion: Number,
    riskScore: Number (0-100),
    recommendations: [String]
  },
  
  // Sync metadata
  lastSyncedAt: Date,
  syncStatus: Enum ['Success', 'Partial', 'Failed', 'In Progress'],
  dataSource: Enum ['PFMS_API', 'Manual_Entry', 'Auto_Calculated', 'Real_Project_Data'],
  timestamps: true
}
```

**Utilization Report Model:**
```javascript
{
  project: ObjectId (ref: Project),
  agency: ObjectId (ref: Agency),
  amount: Number,
  certificateUrl: String,  // PDF file path
  comments: String,
  submittedBy: ObjectId (ref: User),
  status: Enum ['Pending Approval', 'Approved', 'Rejected'],
  reviewedBy: ObjectId (ref: User),
  reviewComments: String,
  reviewedAt: Date,
  timestamps: true
}
```

## 🔗 API Documentation

### Authentication Endpoints
```
POST /api/users/register     # User registration (all roles)
POST /api/users/login       # User authentication with role-based redirection
```

### Dashboard Endpoints
```
# Admin Dashboard
GET /api/dashboard/stats                    # Key metrics (projects, agencies, alerts)
GET /api/dashboard/project-status-chart     # Project status distribution
GET /api/dashboard/state-performance        # State-wise completion rates
GET /api/dashboard/budget-trends            # Monthly budget allocation/utilization
GET /api/dashboard/component-breakdown      # Adarsh Gram/GIA/Hostel distribution
GET /api/dashboard/top-agencies            # Best performing agencies
GET /api/dashboard/recent-activity          # Latest system activities

# State Dashboard
GET /api/dashboard/state-stats              # State-specific statistics
GET /api/dashboard/pending-approvals        # Projects/milestones awaiting review
GET /api/dashboard/district-breakdown       # District-wise project data

# Agency Dashboard  
GET /api/dashboard/agency-stats             # Agency-specific metrics
GET /api/dashboard/upcoming-deadlines       # Project and milestone deadlines
GET /api/dashboard/agency-budget            # Budget allocation and utilization
```

### Project Management
```
GET  /api/projects                  # List all projects (admin)
POST /api/projects                  # Create new project with PDF generation
GET  /api/projects/:id              # Get project details (role-filtered)
GET  /api/projects/mystate          # State officer's projects
GET  /api/projects/myagency         # Agency's assigned projects
GET  /api/projects/pending-reviews  # Projects with pending milestone reviews
GET  /api/projects/locations        # Project coordinates for mapping

# Project Assignment & Reviews
PUT  /api/projects/:id/assign                                    # Assign agencies to project
POST /api/projects/:id/assignments                               # Add new agency assignments
PUT  /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/submit  # Submit milestone
PUT  /api/projects/:projectId/checklist/:assignmentIndex/:checklistIndex/review  # Review milestone
```

### Agency Management
```
GET    /api/agencies          # List agencies (filtered by role)
POST   /api/agencies          # Register new agency
PUT    /api/agencies/:id      # Update agency details
DELETE /api/agencies/:id      # Remove agency
```

### Alert System
```
GET  /api/alerts                    # Get user's alerts (grouped by severity)
PUT  /api/alerts/:id/acknowledge    # Acknowledge specific alert
PUT  /api/alerts/:id/snooze        # Snooze alert for specified days

# Admin Alert Management
POST /api/alerts/generate           # Manually trigger alert generation
POST /api/alerts/escalate          # Manual escalation testing
POST /api/alerts/nightly-job       # Run complete nightly alert processing
GET  /api/alerts/escalation-stats  # Get escalation level statistics
```

### Financial Management & PFMS
```
GET  /api/funds                     # Fund allocation data
GET  /api/utilization              # Utilization report listings
POST /api/utilization              # Submit utilization certificate
GET  /api/pfms                     # PFMS dashboard data
GET  /api/pfms/state/:state        # State-specific PFMS data
```

### File Upload
```
POST /api/upload/images             # Upload milestone proof images
POST /api/upload/certificates       # Upload utilization certificates (PDF)
```

### Communication & Messaging
```
GET  /api/communications            # Communication logs and messages
POST /api/communications            # Send notifications/messages
```

### AI-Powered Services
```
# Agency Recommendation System (State Officers only)
POST /api/agency-matching/recommendations  # Get AI-powered agency recommendations

# AI Assistant Chatbot (All authenticated users)
POST /api/chatbot/message              # Send message to AI assistant
GET  /api/chatbot/suggestions          # Get role-specific suggested questions
GET  /api/chatbot/history              # Retrieve chat conversation history
DELETE /api/chatbot/history            # Clear chat history
```

### Blockchain & Smart Contract Services
```
# Project Blockchain Operations
POST /api/blockchain/project/create           # Create project on blockchain
GET  /api/blockchain/project/:id/history      # Get immutable project history
POST /api/blockchain/project/:id/milestone    # Record milestone completion on blockchain
GET  /api/blockchain/project/:id/audit        # Get complete audit trail

# Financial Blockchain Operations  
POST /api/blockchain/funds/allocate          # Record fund allocation on blockchain
POST /api/blockchain/funds/transfer          # Execute blockchain-based fund transfer
GET  /api/blockchain/funds/:projectId/trail  # Get complete financial audit trail
POST /api/blockchain/funds/reconcile         # Reconcile PFMS with blockchain records

# Smart Contract Management
POST /api/blockchain/contract/deploy         # Deploy new chaincode version
GET  /api/blockchain/contract/query          # Query chaincode functions
POST /api/blockchain/contract/invoke        # Invoke chaincode transactions
GET  /api/blockchain/network/status         # Get Fabric network health status

# Digital Asset Management
POST /api/blockchain/assets/tokenize        # Create digital asset tokens
GET  /api/blockchain/assets/:assetId        # Get asset details and ownership
POST /api/blockchain/assets/transfer       # Transfer asset ownership
GET  /api/blockchain/certificates/:projectId # Get blockchain-verified certificates
```

## 📱 PWA Features

SAMANVAY is built as a Progressive Web App (PWA) with:

- **Offline Capability**: Core features work without internet
- **Mobile Responsive**: Optimized for all device sizes  
- **App-like Experience**: Can be installed on mobile devices
- **Push Notifications**: Real-time alerts and updates
- **Fast Loading**: Service worker caching for improved performance

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt with salt rounds
- **Role-based Access Control** with middleware validation
- **Blockchain Security**: Hyperledger Fabric's permissioned network architecture
- **Digital Identity Management**: X.509 certificates and MSP-based identity verification
- **Cryptographic Data Protection**: End-to-end encryption for sensitive blockchain transactions
- **Immutable Audit Logs**: Tamper-proof transaction history on distributed ledger
- **Smart Contract Security**: Validated chaincode with automated vulnerability scanning
- **Input Sanitization** to prevent injection attacks
- **CORS Configuration** for cross-origin request security
- **File Upload Restrictions** with type and size validation
- **Environment Variable Protection** for sensitive data

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Project Progress Tracking** with timeline visualization
- **Financial Utilization Analysis** with trend predictions
- **State Performance Comparisons** with ranking systems
- **Agency Efficiency Metrics** with productivity scoring
- **Alert Pattern Analysis** for predictive insights
- **Blockchain Network Monitoring**: Real-time fabric network health and transaction throughput
- **Smart Contract Analytics**: Chaincode performance metrics and execution statistics
- **Consensus Monitoring**: Block generation times and endorsement patterns

### PFMS Integration
- **Real-time Financial Data** synchronization
- **Budget vs Actual** spending analysis
- **Fund Release Tracking** with approval workflows
- **Utilization Rate Monitoring** with alerts
- **Quarterly Reporting** with automated generation

## 🤝 Contributing

We welcome contributions to improve SAMANVAY! Please follow these steps:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
3. **Commit Changes**: `git commit -m 'Add some feature'`
4. **Push to Branch**: `git push origin feature/your-feature-name`
5. **Open Pull Request**

### Development Guidelines
- Follow JavaScript ES6+ standards
- Use meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 🐛 Issue Reporting

Found a bug or have a feature request?

1. **Check Existing Issues** to avoid duplicates
2. **Create Detailed Issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - System information
   - Screenshots (if applicable)

## 📈 Roadmap

### Upcoming Features
- [ ] **Mobile App** (React Native)
- [ ] **Advanced ML Analytics** for predictive insights
- [ ] **Cross-Chain Interoperability** with other government blockchain networks
- [ ] **Multi-language Support** 
- [ ] **Voice Commands** for accessibility
- [ ] **Advanced Reporting** with custom dashboards
- [ ] **Integration APIs** for third-party systems
- [ ] **Quantum-Resistant Cryptography** for future-proof security
- [ ] **Decentralized Identity (DID)** implementation

### Current Version: v1.0.0

## 📞 Support & Contact

For technical support or queries:

- **Email**: support@samanvay.gov.in
- **Documentation**: [Wiki Pages](https://github.com/yourusername/SAMANVAY/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/SAMANVAY/issues)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Government of India** for project requirements and domain expertise
- **Open Source Community** for the amazing tools and libraries
- **MongoDB** for flexible data modeling capabilities
- **React Team** for the robust frontend framework
- **Contributors** who help make SAMANVAY better

---

**Built with ❤️ for Digital India Initiative**

*SAMANVAY - Bridging the gap between planning and execution in government projects*

---

### Quick Start Commands
```bash
# Clone and setup
git clone https://github.com/yourusername/SAMANVAY.git
cd SAMANVAY

# Start Hyperledger Fabric Network
cd Backend/fabric-network && ./network.sh up createChannel -c samanvay-channel
./network.sh deployCC -ccn samanvay-chaincode -ccp ../chaincode -ccl javascript

# Backend setup
cd ../.. && npm install && npm run dev

# Frontend setup (in new terminal)
cd Frontend/SAMANVAY && npm install && npm run dev
```

### System Requirements
- **RAM**: Minimum 8GB, Recommended 16GB+ (for blockchain network)
- **Storage**: 2GB free space (includes Docker images and blockchain data)
- **Network**: Broadband internet for PFMS sync and blockchain peer communication
- **CPU**: Multi-core processor (recommended for consensus operations)
- **Docker Memory**: Minimum 4GB allocated to Docker Desktop
- **Browser**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
