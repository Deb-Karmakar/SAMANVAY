import { Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

// Admin Layout and Page Imports
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/DashboardPage";
import AdminMap from "@/pages/admin/MapPage";
import AdminAlerts from "@/pages/admin/AlertsPage";
import AdminFunds from "@/pages/admin/FundsPage";
import AdminAgencies from "@/pages/admin/AgenciesPage";
import AdminProjects from "@/pages/admin/ProjectsPage";
import AdminReports from "@/pages/admin/ReportsPage";
import CommunicationsPage from "@/pages/admin/CommunicationsPage";

// State Layout and Page Imports
import StateLayout from "@/components/layouts/StateLayout";
import StateDashboard from "@/pages/state/DashboardPage";
import StateMap from "@/pages/state/MapPage";
import StateProjects from "@/pages/state/ProjectsPage";
import StateAgencies from "@/pages/state/AgenciesPage";
import StateFunds from "@/pages/state/FundsPage";
import StateCommunications from "@/pages/state/CommunicationsPage";
import StateProjectDetail from "@/pages/state/ProjectDetailPage";
import ReviewsPage from "@/pages/state/ReviewsPage";


// 1. Import Agency Layout and Pages
import AgencyLayout from "@/components/layouts/AgencyLayout";
import AgencyDashboard from "@/pages/agency/DashboardPage";
import AgencyProjectsList from "@/pages/agency/ProjectsListPage";
import AgencyProjectDetail from "@/pages/agency/ProjectDetailPage"; 
import AgencyMap from "@/pages/agency/MapPage";
import AgencyFunds from "@/pages/agency/FundsPage";
import AgencyInbox from "@/pages/agency/InboxPage";

// Public Page Imports
import LandingPage from "@/pages/LandingPage";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";

import "./App.css";

function Router() {
  return (
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
      </Route>

      {/* State Officer Nested Routes */}
      <Route path="/state" element={<StateLayout />}>
        <Route index element={<StateDashboard />} />
        <Route path="dashboard" element={<StateDashboard />} />
        <Route path="map" element={<StateMap />} />
        <Route path="projects" element={<StateProjects />} />
        <Route path="projects/:projectId" element={<StateProjectDetail />} /> {/* <-- Add this dynamic route */}
        <Route path="agencies" element={<StateAgencies />} />
        <Route path="funds" element={<StateFunds />} />
        <Route path="communications" element={<StateCommunications />} />
        <Route path="reviews" element={<ReviewsPage />} />
      </Route>

      {/* 2. Add Executing Agency Nested Routes */}
      <Route path="/agency" element={<AgencyLayout />}>
        <Route index element={<AgencyDashboard />} />
        <Route path="dashboard" element={<AgencyDashboard />} />
        <Route path="projects" element={<AgencyProjectsList />} />
        <Route path="projects/:projectId" element={<AgencyProjectDetail />} />
        <Route path="map" element={<AgencyMap />} />
        <Route path="funds" element={<AgencyFunds />} />
        <Route path="inbox" element={<AgencyInbox />} />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;