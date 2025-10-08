// Frontend/SAMANVAY/src/pages/agency/DashboardPage.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, CheckCircle2, Calendar, Upload, FileText, Wallet, TrendingUp, Clock, Eye, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance, useAuth } from "@/contexts/AuthContext";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

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
      <Card className="m-6">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load projects: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, {agencyName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Your project dashboard and task overview
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/agency/projects')} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            All Projects
          </Button>
          <Button onClick={() => navigate('/agency/funds')}>
            <Wallet className="mr-2 h-4 w-4" />
            Funds
          </Button>
        </div>
      </div>

      {/* Urgent Alerts Banner */}
      {delayedProjects.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Urgent Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {delayedProjects.slice(0, 3).map((project) => (
              <div key={project._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 mt-1 text-red-600" />
                  <div>
                    <p className="font-semibold text-sm">Project "{project.name}" is delayed</p>
                    <p className="text-xs text-muted-foreground mt-1">Please update progress immediately</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={() => navigate(`/agency/projects/${project._id}`)}
                >
                  Update Now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {onTrackProjects.length} on track
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects?.length ? ((completedProjects.length / projects.length) * 100).toFixed(1) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            <Wallet className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoadingBudget ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">{formatCurrency(budgetData?.totalAllocated || 0)}</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">{budgetData?.utilizationRate || 0}% utilized</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Delayed Projects</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{delayedProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Deadlines</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Project Status Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
                <CardDescription>Current status of all your assigned projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="fill" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
                <CardDescription>Visual breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {projects?.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%
                </div>
                <Progress 
                  value={projects?.length ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">Average across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">On-Time Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {projects?.length ? ((onTrackProjects.length / projects.length) * 100).toFixed(1) : 0}%
                </div>
                <Progress 
                  value={projects?.length ? (onTrackProjects.length / projects.length) * 100 : 0} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">Projects on schedule</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {projects?.length ? ((completedProjects.length / projects.length) * 100).toFixed(1) : 0}%
                </div>
                <Progress 
                  value={projects?.length ? (completedProjects.length / projects.length) * 100 : 0} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">Completion rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for your projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => navigate('/agency/projects')}>
                  <FileText className="mr-2 h-4 w-4" />
                  View All Projects
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/agency/inbox')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/agency/funds')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Submit Funds Utlization Report
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Important dates to remember</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDeadlines ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : deadlines?.length > 0 ? (
                  <div className="space-y-3">
                    {deadlines.slice(0, 4).map((deadline, index) => {
                      const daysLeft = getDaysUntilDeadline(deadline.date);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{deadline.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(deadline.date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={daysLeft <= 3 ? 'destructive' : daysLeft <= 7 ? 'warning' : 'secondary'}>
                            {daysLeft} days
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No upcoming deadlines</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assigned Projects</CardTitle>
              <CardDescription>Click on any project to view details and update progress</CardDescription>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map(project => (
                    <div 
                      key={project._id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md cursor-pointer transition-all"
                      onClick={() => navigate(`/agency/projects/${project._id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{project.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {project.component} • {project.district}
                            </p>
                          </div>
                          <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={project.progress} className="h-2" />
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground">{project.progress}%</span>
                        </div>
                        {project.budget && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Budget: {formatCurrency(project.budget)}
                          </p>
                        )}
                      </div>
                      <Eye className="h-5 w-5 text-muted-foreground ml-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No projects assigned yet</p>
                  <p className="text-sm mt-2">Check back later for new assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks & Deadlines Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Items requiring your action</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDeadlines ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects?.flatMap(project => 
                      project.assignments?.[0]?.checklist?.filter(item => !item.completed).slice(0, 5).map(item => ({
                        ...item,
                        projectName: project.name,
                        projectId: project._id
                      })) || []
                    ).map((task, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 mt-1 text-orange-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Project: {task.projectName}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
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
              <CardHeader>
                <CardTitle>Deadline Calendar</CardTitle>
                <CardDescription>Important dates this month</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDeadlines ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : deadlines?.length > 0 ? (
                  <div className="space-y-3">
                    {deadlines.map((deadline, index) => {
                      const daysLeft = getDaysUntilDeadline(deadline.date);
                      const isUrgent = daysLeft <= 3;
                      const isWarning = daysLeft <= 7 && daysLeft > 3;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border ${
                            isUrgent ? 'bg-red-50 border-red-200' : 
                            isWarning ? 'bg-yellow-50 border-yellow-200' : 
                            'bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Calendar className={`h-5 w-5 ${
                                isUrgent ? 'text-red-600' : 
                                isWarning ? 'text-yellow-600' : 
                                'text-blue-600'
                              }`} />
                              <div>
                                <p className="font-semibold text-sm">{deadline.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(deadline.date), 'EEEE, MMMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                              isUrgent ? 'destructive' : 
                              isWarning ? 'warning' : 
                              'secondary'
                            }>
                              {daysLeft <= 0 ? 'Today' : `${daysLeft} days`}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No upcoming deadlines</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Allocated</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBudget ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(budgetData?.totalAllocated || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Utilized</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBudget ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(budgetData?.utilized || 0)}</div>
                    <Progress value={budgetData?.utilizationRate || 0} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBudget ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency((budgetData?.totalAllocated || 0) - (budgetData?.utilized || 0))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Available funds</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Budget Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization by Project</CardTitle>
              <CardDescription>Track spending across your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBudget ? (
                <div className="h-[300px] flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData?.projectBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
                    <Bar dataKey="utilized" fill="#10b981" name="Utilized" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Project-wise Budget Table */}
          <Card>
            <CardHeader>
              <CardTitle>Project Budget Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects?.map(project => {
                  const allocated = project.assignments?.[0]?.allocatedFunds || 0;
                  const utilized = (allocated * project.progress) / 100;
                  
                  return (
                    <div key={project._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{project.name}</p>
                        <Badge variant="secondary">{project.component}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Allocated</p>
                          <p className="font-semibold">{formatCurrency(allocated)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Utilized</p>
                          <p className="font-semibold text-green-600">{formatCurrency(utilized)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Remaining</p>
                          <p className="font-semibold text-blue-600">{formatCurrency(allocated - utilized)}</p>
                        </div>
                      </div>
                      <Progress value={(utilized / allocated) * 100} className="mt-3" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}