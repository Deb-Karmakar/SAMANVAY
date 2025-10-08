// Frontend/SAMANVAY/src/pages/admin/DashboardPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, Users, AlertTriangle, Loader2, TrendingUp, TrendingDown,
  Building2, MapPin, Wallet, Calendar, CheckCircle2, Clock, 
  FileText, ArrowUpRight, Activity, Award, Target, Send, Eye, Menu,
  MoreVertical, Home, Bell, TrendingUpIcon
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// --- API Fetchers ---
const fetchAdminStats = async () => {
  const { data } = await axiosInstance.get('/dashboard/stats');
  return data;
};

const fetchChartData = async () => {
  const { data } = await axiosInstance.get('/dashboard/project-status-chart');
  return data;
};

const fetchRecentActivity = async () => {
  const { data } = await axiosInstance.get('/dashboard/recent-activity');
  return data;
};

const fetchStatePerformance = async () => {
  const { data } = await axiosInstance.get('/dashboard/state-performance');
  return data;
};

const fetchBudgetTrends = async () => {
  const { data } = await axiosInstance.get('/dashboard/budget-trends');
  return data;
};

const fetchComponentBreakdown = async () => {
  const { data } = await axiosInstance.get('/dashboard/component-breakdown');
  return data;
};

const fetchRecentAlerts = async () => {
  const { data } = await axiosInstance.get('/alerts?limit=5');
  return data.alerts || [];
};

const fetchTopAgencies = async () => {
  const { data } = await axiosInstance.get('/dashboard/top-agencies');
  return data;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: stats, isLoading: isLoadingStats } = useQuery({ 
    queryKey: ['adminStats'], 
    queryFn: fetchAdminStats 
  });
  
  const { data: chartData, isLoading: isLoadingChart } = useQuery({ 
    queryKey: ['projectStatusChart'], 
    queryFn: fetchChartData 
  });
  
  const { data: activities, isLoading: isLoadingActivities } = useQuery({ 
    queryKey: ['recentActivity'], 
    queryFn: fetchRecentActivity 
  });

  const { data: statePerformance, isLoading: isLoadingStates } = useQuery({
    queryKey: ['statePerformance'],
    queryFn: fetchStatePerformance
  });

  const { data: budgetTrends, isLoading: isLoadingBudget } = useQuery({
    queryKey: ['budgetTrends'],
    queryFn: fetchBudgetTrends
  });

  const { data: componentData, isLoading: isLoadingComponents } = useQuery({
    queryKey: ['componentBreakdown'],
    queryFn: fetchComponentBreakdown
  });

  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['recentAlerts'],
    queryFn: fetchRecentAlerts
  });

  const { data: topAgencies, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['topAgencies'],
    queryFn: fetchTopAgencies
  });

  const getInitials = (name = "") => (name.split(' ').map(n => n[0]).join('')).toUpperCase();

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || colors.info;
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount?.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate md:text-3xl lg:text-4xl">
                National Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate md:text-sm md:mt-1">
                PM-AJAY Scheme Overview
              </p>
            </div>
            
            {/* Action Buttons - Mobile Dropdown, Desktop Full */}
            <div className="flex items-center gap-2">
              {/* Desktop Buttons */}
              <div className="hidden md:flex gap-2">
                <Button 
                  onClick={() => navigate('/admin/pfms')} 
                  variant="outline"
                  size="sm"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  PFMS Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/admin/projects')}
                  size="sm"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  All Projects
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
                      variant="outline"
                      onClick={() => navigate('/admin/pfms')}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      PFMS Dashboard
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      onClick={() => navigate('/admin/projects')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      All Projects
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/admin/agencies')}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Manage Agencies
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/admin/funds')}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Fund Management
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/admin/map')}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Geographic View
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/admin/communications')}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Communications
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/admin/reports')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Reports
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
        {/* Key Metrics Grid - Mobile First */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 md:text-sm">
                  Projects
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-xl font-bold md:text-3xl">{stats?.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stats?.activeProjects || 0} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 md:text-sm">
                  Agencies
                </CardTitle>
                <Building2 className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-xl font-bold md:text-3xl">{stats?.totalAgencies || 0}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">Implementing</p>
                </>
              )}
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
                    {formatCurrency(budgetTrends?.totalBudget || 0)}
                  </div>
                  <div className="flex items-center mt-0.5">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Allocated</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-red-600 md:text-sm">
                  Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-xl font-bold text-red-600 md:text-3xl">
                    {stats?.activeAlerts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Attention needed</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile First with Horizontal Scroll */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Mobile: Scrollable horizontal tabs */}
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
                value="performance" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <TrendingUpIcon className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <Bell className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <Activity className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 mt-4 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 md:gap-4">
              {/* Project Status Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Project Status</CardTitle>
                  <CardDescription className="text-xs">
                    Distribution nationwide
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingChart ? (
                    <div className="h-[200px] flex justify-center items-center md:h-[300px]">
                      <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200} className="md:h-[300px]">
                      <BarChart data={chartData}>
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
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Component Breakdown */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Components</CardTitle>
                  <CardDescription className="text-xs">
                    Type distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingComponents ? (
                    <div className="h-[200px] flex justify-center items-center md:h-[300px]">
                      <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200} className="md:h-[300px]">
                      <PieChart>
                        <Pie
                          data={componentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {componentData?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Budget Trends */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Budget Trends</CardTitle>
                <CardDescription className="text-xs">Monthly allocation & utilization</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingBudget ? (
                  <div className="h-[180px] flex justify-center items-center md:h-[250px]">
                    <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180} className="md:h-[250px]">
                    <AreaChart data={budgetTrends?.monthly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 9 }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
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
                      <Area 
                        type="monotone" 
                        dataKey="allocated" 
                        stackId="1" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6} 
                        name="Allocated" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="utilized" 
                        stackId="2" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.6} 
                        name="Utilized" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-green-600 md:text-2xl">
                    {chartData?.find(d => d.name === 'Completed')?.value || 0} / {stats?.totalProjects || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {((chartData?.find(d => d.name === 'Completed')?.value / stats?.totalProjects) * 100).toFixed(1)}% complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    States Covered
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-blue-600 md:text-2xl">
                    {statePerformance?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Across India</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Avg Duration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-purple-600 md:text-2xl">
                    {budgetTrends?.avgDuration || 0} days
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Average time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-3 mt-4 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 md:gap-4">
              {/* Top Performing States */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm flex items-center gap-2 md:text-lg">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Top States
                  </CardTitle>
                  <CardDescription className="text-xs">
                    By completion rate
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingStates ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {statePerformance?.slice(0, 5).map((state, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 border rounded-lg bg-gradient-to-r from-green-50 to-transparent"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white font-bold text-xs flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs truncate md:text-sm">{state.state}</p>
                              <p className="text-xs text-muted-foreground">{state.projects} projects</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-sm font-bold text-green-600 md:text-lg">
                              {state.completionRate}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Agencies */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm flex items-center gap-2 md:text-lg">
                    <Target className="h-4 w-4 text-blue-500" />
                    Top Agencies
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Highest performing
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingAgencies ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topAgencies?.map((agency, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Avatar className="h-7 w-7 flex-shrink-0 md:h-9 md:w-9">
                              <AvatarFallback className="bg-blue-500 text-white text-xs">
                                {getInitials(agency.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs truncate md:text-sm">{agency.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{agency.state}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                            {agency.projectsCompleted}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* State Performance Chart */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">State Comparison</CardTitle>
                <CardDescription className="text-xs">
                  Completion rates across states
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingStates ? (
                  <div className="h-[200px] flex justify-center items-center md:h-[300px]">
                    <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200} className="md:h-[300px]">
                    <BarChart data={statePerformance?.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="state" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fontSize: 9 }}
                      />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="completionRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-3 mt-4 md:space-y-4">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Critical Alerts</CardTitle>
                <CardDescription className="text-xs">
                  Require immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingAlerts ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : alerts?.length > 0 ? (
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs md:text-sm">{alert.title}</p>
                            <p className="text-xs mt-1 line-clamp-2">{alert.description}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-7 w-7 flex-shrink-0"
                            onClick={() => navigate(`/admin/alerts`)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No critical alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-3 mt-4 md:space-y-4">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Recent Activity</CardTitle>
                <CardDescription className="text-xs">
                  Latest system updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingActivities ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities?.map((activity, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-2 pb-3 border-b last:border-0 md:gap-3"
                      >
                        <Avatar className="h-7 w-7 flex-shrink-0 md:h-9 md:w-9">
                          <AvatarFallback 
                            className={activity.type === 'New Project' ? 'bg-blue-500' : 'bg-green-500'}
                          >
                            <span className="text-xs">
                              {activity.type === 'New Project' ? 'P' : 'A'}
                            </span>
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium md:text-sm">{activity.text}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">
                              {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}