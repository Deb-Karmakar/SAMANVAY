// Frontend/SAMANVAY/src/pages/agency/DashboardPage.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, Loader2, CheckCircle2, Calendar, Upload, FileText, Wallet, 
  TrendingUp, Clock, Eye, ArrowRight, Menu, Home, List, CheckSquare, 
  DollarSign, BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance, useAuth } from "@/contexts/AuthContext";
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// --- API Fetchers ---
const fetchMyAgencyProjects = async () => {
  const { data } = await axiosInstance.get('/projects/myagency');
  return data;
};

const fetchAgencyStats = async () => {
  const { data } = await axiosInstance.get('/dashboard/agency-stats');
  return data;
};

const fetchUpcomingDeadlines = async () => {
  const { data } = await axiosInstance.get('/dashboard/upcoming-deadlines');
  return data;
};

const fetchBudgetBreakdown = async () => {
  const { data } = await axiosInstance.get('/dashboard/agency-budget');
  return data;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const statusVariant = { 
  'On Track': 'default', 
  'Delayed': 'destructive',
  'Completed': 'secondary',
  'Pending Approval': 'outline'
};

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const agencyName = userInfo?.agencyName || "Agency";

  // Queries
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['myAgencyProjects'],
    queryFn: fetchMyAgencyProjects,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['agencyStats'],
    queryFn: fetchAgencyStats,
  });

  const { data: deadlines, isLoading: isLoadingDeadlines } = useQuery({
    queryKey: ['upcomingDeadlines'],
    queryFn: fetchUpcomingDeadlines,
  });

  const { data: budgetData, isLoading: isLoadingBudget } = useQuery({
    queryKey: ['agencyBudget'],
    queryFn: fetchBudgetBreakdown,
  });

  const delayedProjects = projects?.filter(p => p.status === 'Delayed') || [];
  const onTrackProjects = projects?.filter(p => p.status === 'On Track') || [];
  const completedProjects = projects?.filter(p => p.status === 'Completed') || [];
  
  const projectStatusData = [
    { name: 'On Track', value: onTrackProjects.length, fill: '#10b981' },
    { name: 'Delayed', value: delayedProjects.length, fill: '#ef4444' },
    { name: 'Completed', value: completedProjects.length, fill: '#3b82f6' },
    { name: 'Pending', value: projects?.filter(p => p.status === 'Pending Approval').length || 0, fill: '#f59e0b' }
  ];

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount?.toLocaleString('en-IN')}`;
  };

  const getDaysUntilDeadline = (date) => {
    return differenceInDays(new Date(date), new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-3 md:m-6">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">Failed to load projects: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate md:text-3xl lg:text-4xl">
                Welcome, {agencyName}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate md:text-sm md:mt-1">
                Your project dashboard
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Desktop Buttons */}
              <div className="hidden md:flex gap-2">
                <Button 
                  onClick={() => navigate('/agency/projects')} 
                  variant="outline"
                  size="sm"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  All Projects
                </Button>
                <Button 
                  onClick={() => navigate('/agency/funds')}
                  size="sm"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Funds
                </Button>
              </div>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>Quick Actions</SheetTitle>
                    <SheetDescription>Navigate and manage</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    <Button 
                      className="w-full justify-start"
                      onClick={() => navigate('/agency/projects')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      All Projects
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/agency/funds')}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Fund Reports
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/agency/inbox')}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Documents
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 space-y-4 md:p-6 md:space-y-6">
        {/* Urgent Alerts Banner */}
        {delayedProjects.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-red-700 text-sm md:text-base">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="truncate">Urgent Attention Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2 md:p-6 md:pt-0 md:space-y-3">
              {delayedProjects.slice(0, 3).map((project) => (
                <div 
                  key={project._id} 
                  className="flex flex-col gap-2 p-2 bg-white rounded-lg border border-red-200 md:flex-row md:items-center md:justify-between md:p-3"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0 md:h-5 md:w-5 md:mt-1" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs truncate md:text-sm">
                        Project "{project.name}" is delayed
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Update progress immediately</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    variant="destructive"
                    className="w-full md:w-auto text-xs"
                    onClick={() => navigate(`/agency/projects/${project._id}`)}
                  >
                    Update Now <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Grid - Mobile First */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 md:text-sm">
                  Active
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl font-bold md:text-3xl">{projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {onTrackProjects.length} on track
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 md:text-sm">
                  Completed
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl font-bold text-green-600 md:text-3xl">
                {completedProjects.length}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {projects?.length ? ((completedProjects.length / projects.length) * 100).toFixed(1) : 0}% rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 md:text-sm">
                  Budget
                </CardTitle>
                <Wallet className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingBudget ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-lg font-bold md:text-3xl">
                    {formatCurrency(budgetData?.totalAllocated || 0)}
                  </div>
                  <div className="flex items-center mt-0.5">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">{budgetData?.utilizationRate || 0}% used</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-red-600 md:text-sm">
                  Delayed
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl font-bold text-red-600 md:text-3xl">
                {delayedProjects.length}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Need action</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile First with Horizontal Scroll */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4 gap-1 bg-muted p-1">
              <TabsTrigger 
                value="overview" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <Home className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <List className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <CheckSquare className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <DollarSign className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Budget
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 mt-4 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 md:gap-4">
              {/* Project Status Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Project Status Overview</CardTitle>
                  <CardDescription className="text-xs">
                    Status of assigned projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <ResponsiveContainer width="100%" height={200} className="md:h-[300px]">
                    <BarChart data={projectStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="fill" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Pie Chart */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Distribution</CardTitle>
                  <CardDescription className="text-xs">
                    Visual breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <ResponsiveContainer width="100%" height={200} className="md:h-[300px]">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ value }) => value > 0 ? value : ''}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-blue-600 md:text-2xl">
                    {projects?.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%
                  </div>
                  <Progress 
                    value={projects?.length ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Average across all</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    On-Time Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-green-600 md:text-2xl">
                    {projects?.length ? ((onTrackProjects.length / projects.length) * 100).toFixed(1) : 0}%
                  </div>
                  <Progress 
                    value={projects?.length ? (onTrackProjects.length / projects.length) * 100 : 0} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">On schedule</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-purple-600 md:text-2xl">
                    {projects?.length ? ((completedProjects.length / projects.length) * 100).toFixed(1) : 0}%
                  </div>
                  <Progress 
                    value={projects?.length ? (completedProjects.length / projects.length) * 100 : 0} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Completion rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Deadlines */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Quick Actions</CardTitle>
                  <CardDescription className="text-xs">
                    Common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2 md:p-6 md:pt-0 md:space-y-3">
                  <Button 
                    className="w-full justify-start text-xs md:text-sm" 
                    onClick={() => navigate('/agency/projects')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View All Projects
                  </Button>
                  <Button 
                    className="w-full justify-start text-xs md:text-sm" 
                    variant="outline" 
                    onClick={() => navigate('/agency/inbox')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                  <Button 
                    className="w-full justify-start text-xs md:text-sm" 
                    variant="outline" 
                    onClick={() => navigate('/agency/funds')}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Submit Fund Report
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Upcoming Deadlines</CardTitle>
                  <CardDescription className="text-xs">
                    Important dates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingDeadlines ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : deadlines?.length > 0 ? (
                    <div className="space-y-2">
                      {deadlines.slice(0, 4).map((deadline, index) => {
                        const daysLeft = getDaysUntilDeadline(deadline.date);
                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 border rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0 md:h-4 md:w-4" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate md:text-sm">{deadline.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(deadline.date), 'MMM dd')}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={daysLeft <= 3 ? 'destructive' : daysLeft <= 7 ? 'warning' : 'secondary'}
                              className="text-xs flex-shrink-0 ml-2"
                            >
                              {daysLeft}d
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground md:py-8">
                      <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500 md:h-12 md:w-12" />
                      <p className="text-xs md:text-sm">No upcoming deadlines</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-3 mt-4 md:space-y-4">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">All Assigned Projects</CardTitle>
                <CardDescription className="text-xs">
                  Click to view details and update progress
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {projects && projects.length > 0 ? (
                  <div className="space-y-2">
                    {projects.map(project => (
                      <div 
                        key={project._id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-all"
                        onClick={() => navigate(`/agency/projects/${project._id}`)}
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs truncate md:text-sm">{project.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {project.component} • {project.district}
                              </p>
                            </div>
                            <Badge 
                              variant={statusVariant[project.status]}
                              className="text-xs flex-shrink-0"
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Progress value={project.progress} className="h-2" />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
                              {project.progress}%
                            </span>
                          </div>
                          {project.budget && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Budget: {formatCurrency(project.budget)}
                            </p>
                          )}
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0 md:h-5 md:w-5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground md:py-12">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 md:h-16 md:w-16 md:mb-4" />
                    <p className="text-base font-semibold md:text-lg">No projects assigned yet</p>
                    <p className="text-xs mt-1 md:text-sm md:mt-2">Check back later</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks & Deadlines Tab */}
          <TabsContent value="tasks" className="space-y-3 mt-4 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 md:gap-4">
              {/* Pending Tasks */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Pending Tasks</CardTitle>
                  <CardDescription className="text-xs">
                    Items requiring action
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingDeadlines ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projects?.flatMap(project => 
                        project.assignments?.[0]?.checklist?.filter(item => !item.completed).slice(0, 5).map(item => ({
                          ...item,
                          projectName: project.name,
                          projectId: project._id
                        })) || []
                      ).map((task, index) => (
                        <div 
                          key={index} 
                          className="p-2 border rounded-lg hover:bg-gray-50 transition-colors md:p-3"
                        >
                          <div className="flex items-start gap-2">
                            <Clock className="h-3 w-3 mt-1 text-orange-500 flex-shrink-0 md:h-4 md:w-4" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium md:text-sm">{task.text}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                Project: {task.projectName}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs flex-shrink-0"
                              onClick={() => navigate(`/agency/projects/${task.projectId}`)}
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Calendar View */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Deadline Calendar</CardTitle>
                  <CardDescription className="text-xs">
                    Important dates this month
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingDeadlines ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : deadlines?.length > 0 ? (
                    <div className="space-y-2">
                      {deadlines.map((deadline, index) => {
                        const daysLeft = getDaysUntilDeadline(deadline.date);
                        const isUrgent = daysLeft <= 3;
                        const isWarning = daysLeft <= 7 && daysLeft > 3;
                        
                        return (
                          <div 
                            key={index} 
                            className={`p-3 rounded-lg border ${
                              isUrgent ? 'bg-red-50 border-red-200' : 
                              isWarning ? 'bg-yellow-50 border-yellow-200' : 
                              'bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Calendar className={`h-4 w-4 flex-shrink-0 ${
                                  isUrgent ? 'text-red-600' : 
                                  isWarning ? 'text-yellow-600' : 
                                  'text-blue-600'
                                }`} />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-xs truncate md:text-sm">{deadline.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {format(new Date(deadline.date), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant={
                                  isUrgent ? 'destructive' : 
                                  isWarning ? 'warning' : 
                                  'secondary'
                                }
                                className="text-xs flex-shrink-0"
                              >
                                {daysLeft <= 0 ? 'Today' : `${daysLeft}d`}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-xs md:text-sm">No upcoming deadlines</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-3 mt-4 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Total Allocated
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isLoadingBudget ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-lg font-bold md:text-2xl">
                        {formatCurrency(budgetData?.totalAllocated || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">All projects</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Utilized
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isLoadingBudget ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-lg font-bold text-green-600 md:text-2xl">
                        {formatCurrency(budgetData?.utilized || 0)}
                      </div>
                      <Progress value={budgetData?.utilizationRate || 0} className="mt-2" />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isLoadingBudget ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-lg font-bold text-blue-600 md:text-2xl">
                        {formatCurrency((budgetData?.totalAllocated || 0) - (budgetData?.utilized || 0))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Available</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Budget Chart */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Budget Utilization by Project</CardTitle>
                <CardDescription className="text-xs">
                  Track spending across projects
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingBudget ? (
                  <div className="h-[200px] flex justify-center items-center md:h-[300px]">
                    <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200} className="md:h-[300px]">
                    <BarChart data={budgetData?.projectBreakdown || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fontSize: 9 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          if (value >= 10000000) return `${(value / 10000000).toFixed(0)}Cr`;
                          if (value >= 100000) return `${(value / 100000).toFixed(0)}L`;
                          return value;
                        }}
                        tick={{ fontSize: 9 }}
                      />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
                      <Bar dataKey="utilized" fill="#10b981" name="Utilized" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Project-wise Budget Table */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Project Budget Details</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="space-y-2">
                  {projects?.map(project => {
                    const allocated = project.assignments?.[0]?.allocatedFunds || 0;
                    const utilized = (allocated * project.progress) / 100;
                    
                    return (
                      <div key={project._id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="font-semibold text-xs truncate flex-1 md:text-sm">{project.name}</p>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {project.component}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs md:gap-4 md:text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Allocated</p>
                            <p className="font-semibold truncate">{formatCurrency(allocated)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Utilized</p>
                            <p className="font-semibold text-green-600 truncate">{formatCurrency(utilized)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Remaining</p>
                            <p className="font-semibold text-blue-600 truncate">{formatCurrency(allocated - utilized)}</p>
                          </div>
                        </div>
                        <Progress value={(utilized / allocated) * 100} className="mt-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}