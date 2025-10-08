# SAMANVAY - System for Agency Mapping And Nodal VAYavastha

![SAMANVAY Logo](https://img.shields.io/badge/SAMANVAY-System%20for%20Agency%20Mapping-blue?style=for-the-badge)

**SAMANVAY** is a comprehensive digital platform designed to streamline coordination between government agencies and implementing bodies for effective project management and resource allocation. The system provides real-time monitoring, financial tracking through PFMS integration, and intelligent alert systems to ensure efficient project execution.

## 🏛️ Project Overview

SAMANVAY serves as a unified platform that enables states to coordinate projects with multiple implementing and executing agencies. It provides three distinct user roles with specialized dashboards and functionalities:

- **Central Admin**: National-level oversight and policy implementation
- **State Officers**: State-level project management and agency coordination  
- **Executing Agencies**: Ground-level project execution and reporting

## ✨ Key Features

### 🎯 Core Functionalities
- **Multi-Role Dashboard System** with role-based access control
- **Project Lifecycle Management** from initiation to completion
- **Agency Onboarding and Management** with approval workflows
- **Real-time Project Tracking** with progress monitoring
- **Financial Management** with budget allocation and utilization tracking
- **PFMS Integration** for seamless financial data synchronization
- **Intelligent Alert System** with automated notifications and escalations
- **Interactive Mapping** with geolocation-based project visualization
- **Communication Hub** for stakeholder coordination
- **Report Generation** with comprehensive analytics

### 📊 Advanced Analytics
- **Predictive Analytics** for project completion forecasting
- **Performance Metrics** with state-wise comparisons
- **Financial Utilization Analysis** with trend predictions
- **Risk Assessment** with automated scoring
- **Custom Report Generation** with multiple export formats

### 🔔 Smart Alert System
- **Automated Notifications** for deadline reminders
- **Escalation Workflows** with multi-level alerts
- **Performance-based Alerts** for slow progress detection
- **Budget Overrun Warnings** with threshold monitoring
- **Review Status Tracking** with approval workflows

## 🏗️ System Architecture

```
SAMANVAY/
├── Backend/                 # Node.js Express API Server
│   ├── controllers/         # Route handlers and business logic
│   ├── models/             # MongoDB data models
│   ├── routes/             # API route definitions
│   ├── middleware/         # Authentication and upload middleware
│   ├── services/           # Business logic and external integrations
│   ├── config/             # Database and configuration
│   └── uploads/            # File storage directory
│
└── Frontend/               # React-based Web Application
    └── SAMANVAY/
        ├── src/
        │   ├── components/  # Reusable UI components
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
- **Authentication**: JWT tokens with bcrypt hashing
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

## 🗄️ Database Schema

### Core Models

**User Model:**
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  mobile: String,
  role: Enum ['CentralAdmin', 'StateOfficer', 'ExecutingAgency'],
  state: String,
  district: String,
  agencyId: ObjectId,
  isActive: Boolean
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
  assignments: [AgencyAssignment],
  location: GeoJSON Point,
  createdBy: ObjectId
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
  status: Enum ['Active', 'Onboarding', 'Inactive']
}
```

## 🔗 API Documentation

### Authentication Endpoints
```
POST /api/users/register    # User registration
POST /api/users/login      # User authentication
POST /api/users/refresh    # Token refresh
```

### Project Management
```
GET    /api/projects          # List projects
POST   /api/projects          # Create project
GET    /api/projects/:id      # Get project details
PUT    /api/projects/:id      # Update project
DELETE /api/projects/:id      # Delete project
```

### Agency Management
```
GET    /api/agencies          # List agencies
POST   /api/agencies          # Create agency
PUT    /api/agencies/:id      # Update agency
DELETE /api/agencies/:id      # Delete agency
```

### Financial Management
```
GET /api/funds               # Fund allocation data
GET /api/utilization         # Utilization reports
POST /api/utilization        # Submit utilization report
GET /api/pfms                # PFMS integrated data
```

### Alert System
```
GET    /api/alerts           # Get user alerts
PUT    /api/alerts/:id/ack   # Acknowledge alert
POST   /api/alerts/snooze    # Snooze alert
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
- [ ] **Blockchain Integration** for transparency
- [ ] **Multi-language Support** 
- [ ] **Voice Commands** for accessibility
- [ ] **Advanced Reporting** with custom dashboards
- [ ] **Integration APIs** for third-party systems

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

# Backend setup
cd Backend && npm install && npm run dev

# Frontend setup (in new terminal)
cd Frontend/SAMANVAY && npm install && npm run dev
```

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 500MB free space
- **Network**: Broadband internet for PFMS sync
- **Browser**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)