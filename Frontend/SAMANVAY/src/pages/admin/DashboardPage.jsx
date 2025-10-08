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
  FileText, ArrowUpRight, Activity, Award, Target, Send, Eye
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            National Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive overview of PM-AJAY scheme implementation across India
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/admin/pfms')} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            PFMS Dashboard
          </Button>
          <Button onClick={() => navigate('/admin/projects')}>
            <FileText className="mr-2 h-4 w-4" />
            All Projects
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeProjects || 0} active projects
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Agencies</CardTitle>
            <Building2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totalAgencies || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Implementing agencies</p>
              </>
            )}
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
                <div className="text-3xl font-bold">{formatCurrency(budgetTrends?.totalBudget || 0)}</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">Allocated funds</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Critical Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold text-red-600">{stats?.activeAlerts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Require attention</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Actions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Project Status Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Current status of all projects nationwide</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingChart ? (
                  <div className="h-[300px] flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="fill" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Component Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Scheme Components</CardTitle>
                <CardDescription>Distribution by component type</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingComponents ? (
                  <div className="h-[300px] flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={componentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
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
            <CardHeader>
              <CardTitle>Budget Allocation & Utilization Trends</CardTitle>
              <CardDescription>Monthly financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBudget ? (
                <div className="h-[250px] flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={budgetTrends?.monthly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="allocated" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Allocated" />
                    <Area type="monotone" dataKey="utilized" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Utilized" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {chartData?.find(d => d.name === 'Completed')?.value || 0} / {stats?.totalProjects || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((chartData?.find(d => d.name === 'Completed')?.value / stats?.totalProjects) * 100).toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">States Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statePerformance?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across India</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Project Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {budgetTrends?.avgDuration || 0} days
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average completion time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top Performing States */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Performing States
                </CardTitle>
                <CardDescription>Based on project completion and fund utilization</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStates ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {statePerformance?.slice(0, 5).map((state, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{state.state}</p>
                            <p className="text-xs text-muted-foreground">{state.projects} projects</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{state.completionRate}%</p>
                          <p className="text-xs text-muted-foreground">completion</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Agencies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Top Performing Agencies
                </CardTitle>
                <CardDescription>Highest rated implementing agencies</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAgencies ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topAgencies?.map((agency, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-500 text-white">
                              {getInitials(agency.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{agency.name}</p>
                            <p className="text-xs text-muted-foreground">{agency.state}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{agency.projectsCompleted} completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* State Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>State-wise Performance Comparison</CardTitle>
              <CardDescription>Project completion rates across states</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStates ? (
                <div className="h-[300px] flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statePerformance?.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Critical Alerts</CardTitle>
                <CardDescription>Issues requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAlerts ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : alerts?.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{alert.title}</p>
                            <p className="text-xs mt-1">{alert.description}</p>
                            <p className="text-xs mt-2 opacity-75">
                              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/alerts`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No critical alerts at this time</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => navigate('/admin/projects')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View All Projects
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/agencies')}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Agencies
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/funds')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Fund Management
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/map')}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Geographic View
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/communications')}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Communication
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/reports')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Timeline</CardTitle>
              <CardDescription>Latest updates from across the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {activities?.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <Avatar>
                        <AvatarFallback className={activity.type === 'New Project' ? 'bg-blue-500' : 'bg-green-500'}>
                          {activity.type === 'New Project' ? 'P' : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}