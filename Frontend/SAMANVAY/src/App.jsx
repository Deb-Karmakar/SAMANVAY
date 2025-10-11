import { Suspense, lazy } from 'react';
import { Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChatBot from './components/chatbot/ChatBot';

import "./App.css";

// A simple loading component to show while pages are loading
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Loading...</div>
  </div>
);

// ✅ Dynamically import all page and layout components using React.lazy

// Layouts
const AdminLayout = lazy(() => import("@/components/layouts/AdminLayout"));
const StateLayout = lazy(() => import("@/components/layouts/StateLayout"));
const AgencyLayout = lazy(() => import("@/components/layouts/AgencyLayout"));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminMap = lazy(() => import("@/pages/admin/MapPage"));
const AdminAlerts = lazy(() => import("@/pages/admin/AlertsPage"));
const AdminFunds = lazy(() => import("@/pages/admin/FundsPage"));
const AdminAgencies = lazy(() => import("@/pages/admin/AgenciesPage"));
const AdminProjects = lazy(() => import("@/pages/admin/ProjectsPage"));
const AdminReports = lazy(() => import("@/pages/admin/ReportsPage"));
const CommunicationsPage = lazy(() => import("@/pages/admin/CommunicationsPage"));
const AdminProjectDetail = lazy(() => import('@/pages/admin/ProjectDetailPage'));
const PFMSDashboardPage = lazy(() => import("@/pages/admin/PFMSDashboardPage"));

// State Pages
const StateDashboard = lazy(() => import("@/pages/state/DashboardPage"));
const StateMap = lazy(() => import("@/pages/state/MapPage"));
const StateProjects = lazy(() => import("@/pages/state/ProjectsPage"));
const StateAgencies = lazy(() => import("@/pages/state/AgenciesPage"));
const StateFunds = lazy(() => import("@/pages/state/FundsPage"));
const StateCommunications = lazy(() => import("@/pages/state/CommunicationsPage"));
const StateProjectDetail = lazy(() => import("@/pages/state/ProjectDetailPage"));
const ReviewsPage = lazy(() => import("@/pages/state/ReviewsPage"));

// Agency Pages
const AgencyDashboard = lazy(() => import("@/pages/agency/DashboardPage"));
const AgencyProjectsList = lazy(() => import("@/pages/agency/ProjectsListPage"));
const AgencyProjectDetail = lazy(() => import("@/pages/agency/ProjectDetailPage"));
const AgencyMap = lazy(() => import("@/pages/agency/MapPage"));
const AgencyFunds = lazy(() => import("@/pages/agency/FundsPage"));
const AgencyInbox = lazy(() => import("@/pages/agency/InboxPage"));

// Shared & Public Pages
const AlertsPage = lazy(() => import('@/pages/shared/AlertsPage'));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    // ✅ Wrap all routes in a single Suspense component
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Nested Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="map" element={<AdminMap />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="funds" element={<AdminFunds />} />
          <Route path="agencies" element={<AdminAgencies />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="communications" element={<CommunicationsPage />} />
          <Route path="projects/:projectId" element={<AdminProjectDetail />} />
          <Route path="pfms" element={<PFMSDashboardPage />} />
        </Route>

        {/* State Officer Nested Routes */}
        <Route path="/state" element={<StateLayout />}>
          <Route index element={<StateDashboard />} />
          <Route path="dashboard" element={<StateDashboard />} />
          <Route path="map" element={<StateMap />} />
          <Route path="projects" element={<StateProjects />} />
          <Route path="projects/:projectId" element={<StateProjectDetail />} />
          <Route path="agencies" element={<StateAgencies />} />
          <Route path="funds" element={<StateFunds />} />
          <Route path="communications" element={<StateCommunications />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>

        {/* Executing Agency Nested Routes */}
        <Route path="/agency" element={<AgencyLayout />}>
          <Route index element={<AgencyDashboard />} />
          <Route path="dashboard" element={<AgencyDashboard />} />
          <Route path="projects" element={<AgencyProjectsList />} />
          <Route path="projects/:projectId" element={<AgencyProjectDetail />} />
          <Route path="map" element={<AgencyMap />} />
          <Route path="funds" element={<AgencyFunds />} />
          <Route path="inbox" element={<AgencyInbox />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>

        {/* Catch-all Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {/* Main Router */}
          <Router />
          
          {/* Global Toaster */}
          <Toaster />
          
          {/* AI ChatBot - handles its own auth check */}
          <ChatBot />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;