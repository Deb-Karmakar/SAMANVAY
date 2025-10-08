// Frontend/SAMANVAY/src/pages/state/DashboardPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance, useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Wallet, AlertTriangle, Map, Check, X, Eye, Loader2,
  TrendingUp, Building2, FileText, Clock, CheckCircle2, Send,
  ArrowUpRight, Award, Target, Activity, Calendar, Menu, Home,
  Bell, MapPin, BarChart3
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// --- API Fetchers ---
const fetchStateStats = async (state) => {
  const { data } = await axiosInstance.get(`/dashboard/state-stats?state=${state}`);
  return data;
};

const fetchStateProjects = async (state) => {
  const { data } = await axiosInstance.get(`/projects?state=${state}`);
  return data;
};

const fetchStateAgencies = async (state) => {
  const { data } = await axiosInstance.get(`/agencies?state=${state}`);
  return data;
};

const fetchPendingApprovals = async (state) => {
  const { data } = await axiosInstance.get(`/dashboard/pending-approvals?state=${state}`);
  return data;
};

const fetchDistrictBreakdown = async (state) => {
  const { data } = await axiosInstance.get(`/dashboard/district-breakdown?state=${state}`);
  return data;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StateDashboard() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const stateName = userInfo?.state || "Your State";
  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['stateStats', stateName],
    queryFn: () => fetchStateStats(stateName),
    enabled: !!stateName
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['stateProjects', stateName],
    queryFn: () => fetchStateProjects(stateName),
    enabled: !!stateName
  });

  const { data: agencies, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['stateAgencies', stateName],
    queryFn: () => fetchStateAgencies(stateName),
    enabled: !!stateName
  });

  const { data: pendingApprovals, isLoading: isLoadingApprovals } = useQuery({
    queryKey: ['pendingApprovals', stateName],
    queryFn: () => fetchPendingApprovals(stateName),
    enabled: !!stateName
  });

  const { data: districtData, isLoading: isLoadingDistricts } = useQuery({
    queryKey: ['districtBreakdown', stateName],
    queryFn: () => fetchDistrictBreakdown(stateName),
    enabled: !!stateName
  });

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount?.toLocaleString('en-IN')}`;
  };

  const projectStatusData = [
    { name: 'On Track', value: projects?.filter(p => p.status === 'On Track').length || 0, fill: '#10b981' },
    { name: 'Delayed', value: projects?.filter(p => p.status === 'Delayed').length || 0, fill: '#ef4444' },
    { name: 'Completed', value: projects?.filter(p => p.status === 'Completed').length || 0, fill: '#3b82f6' },
    { name: 'Pending', value: projects?.filter(p => p.status === 'Pending Approval').length || 0, fill: '#f59e0b' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate md:text-3xl lg:text-4xl">
                {stateName} Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate md:text-sm md:mt-1">
                PM-AJAY Implementation
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Desktop Buttons */}
              <div className="hidden md:flex gap-2">
                <Button 
                  onClick={() => navigate('/state/map')} 
                  variant="outline"
                  size="sm"
                >
                  <Map className="mr-2 h-4 w-4" />
                  State Map
                </Button>
                <Button 
                  onClick={() => navigate('/state/projects')}
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
                      onClick={() => navigate('/state/projects')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      All Projects
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/state/map')}
                    >
                      <Map className="mr-2 h-4 w-4" />
                      State Map
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/state/agencies')}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Agencies
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/state/funds')}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Fund Management
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/state/reports')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Reports
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
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingProjects ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-xl font-bold md:text-3xl">{projects?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    In {stateName}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 md:text-sm">
                  Funds
                </CardTitle>
                <Wallet className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-lg font-bold md:text-3xl">
                    {formatCurrency(stats?.totalBudget || 0)}
                  </div>
                  <div className="flex items-center mt-0.5">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">{stats?.utilizationRate || 0}% used</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 md:text-sm">
                  Agencies
                </CardTitle>
                <Building2 className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingAgencies ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-xl font-bold md:text-3xl">{agencies?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">Active</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardHeader className="p-3 pb-2 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-orange-600 md:text-sm">
                  Pending
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              {isLoadingApprovals ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <div className="text-xl font-bold text-orange-600 md:text-3xl">
                    {pendingApprovals?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Your review</p>
                </>
              )}
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
                value="approvals" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <Bell className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Approvals
              </TabsTrigger>
              <TabsTrigger 
                value="agencies" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <Building2 className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Agencies
              </TabsTrigger>
              <TabsTrigger 
                value="districts" 
                className="flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap md:text-sm"
              >
                <MapPin className="h-3 w-3 mr-1.5 md:h-4 md:w-4" />
                Districts
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 mt-4 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 md:gap-4">
              {/* Project Status Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Project Status Distribution</CardTitle>
                  <CardDescription className="text-xs">
                    Status of all projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingProjects ? (
                    <div className="h-[200px] flex justify-center items-center md:h-[300px]">
                      <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>

              {/* Project Status Pie */}
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm md:text-lg">Status Overview</CardTitle>
                  <CardDescription className="text-xs">
                    Visual breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  {isLoadingProjects ? (
                    <div className="h-[200px] flex justify-center items-center md:h-[300px]">
                      <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-green-600 md:text-2xl">
                    {projects ? ((projects.filter(p => p.status === 'Completed').length / projects.length) * 100).toFixed(1) : 0}%
                  </div>
                  <Progress 
                    value={projects ? (projects.filter(p => p.status === 'Completed').length / projects.length) * 100 : 0} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    On-Time Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-blue-600 md:text-2xl">
                    {projects ? ((projects.filter(p => p.status === 'On Track').length / projects.length) * 100).toFixed(1) : 0}%
                  </div>
                  <Progress 
                    value={projects ? (projects.filter(p => p.status === 'On Track').length / projects.length) * 100 : 0} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs text-gray-600">
                    Budget Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg font-bold text-purple-600 md:text-2xl">
                    {stats?.utilizationRate || 0}%
                  </div>
                  <Progress value={stats?.utilizationRate || 0} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Recent Projects</CardTitle>
                <CardDescription className="text-xs">
                  Latest updates in your state
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingProjects ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects?.slice(0, 5).map((project) => (
                      <div 
                        key={project._id}
                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer md:p-3"
                        onClick={() => navigate(`/state/projects/${project._id}`)}
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-semibold text-xs truncate md:text-sm">{project.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{project.district}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge 
                            variant={
                              project.status === 'On Track' ? 'default' :
                              project.status === 'Completed' ? 'secondary' :
                              project.status === 'Delayed' ? 'destructive' : 'outline'
                            }
                            className="text-xs hidden sm:inline-flex"
                          >
                            {project.status}
                          </Badge>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals" className="space-y-3 mt-4 md:space-y-4">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Pending Approvals</CardTitle>
                <CardDescription className="text-xs">
                  Items requiring your review
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingApprovals ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : pendingApprovals?.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovals.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg md:p-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-1 text-orange-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs md:text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <p className="text-xs text-muted-foreground truncate">
                                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" variant="outline" className="flex-1 sm:flex-initial">
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1 sm:flex-initial">
                              <X className="h-3 w-3 mr-1" /> Reject
                            </Button>
                            <Button size="sm" variant="ghost" className="sm:ml-auto">
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground md:py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 md:h-16 md:w-16 md:mb-4" />
                    <p className="text-base font-semibold md:text-lg">All caught up!</p>
                    <p className="text-xs mt-1 md:text-sm md:mt-2">No pending approvals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agencies Tab */}
          <TabsContent value="agencies" className="space-y-3 mt-4 md:space-y-4">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">Agencies in {stateName}</CardTitle>
                <CardDescription className="text-xs">
                  Registered implementing agencies
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingAgencies ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                    {agencies?.map((agency) => (
                      <div 
                        key={agency._id} 
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors md:p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate md:text-base">{agency.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{agency.type}</p>
                            <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" /> {agency.district}
                              </span>
                              <span className="truncate">📧 {agency.email}</span>
                            </div>
                          </div>
                          <Badge 
                            variant={agency.status === 'Active' ? 'default' : 'secondary'}
                            className="text-xs flex-shrink-0"
                          >
                            {agency.status}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-3 text-xs"
                          onClick={() => navigate('/state/agencies')}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Districts Tab */}
          <TabsContent value="districts" className="space-y-3 mt-4 md:space-y-4">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">District-wise Breakdown</CardTitle>
                <CardDescription className="text-xs">
                  Projects and budget distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingDistricts ? (
                  <div className="h-[200px] flex justify-center items-center md:h-[300px]">
                    <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200} className="md:h-[300px]">
                    <BarChart data={districtData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="district" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fontSize: 9 }}
                      />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                      <Bar dataKey="budget" fill="#10b981" name="Budget (L)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* District Table */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">District Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                {isLoadingDistricts ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {districtData?.map((district, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 border rounded-lg md:p-3"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-semibold text-xs truncate md:text-sm">{district.district}</p>
                          <p className="text-xs text-muted-foreground">{district.projects} projects</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-xs md:text-sm">
                            {formatCurrency(district.budget)}
                          </p>
                          <Progress 
                            value={district.completionRate} 
                            className="w-16 mt-1 md:w-24" 
                          />
                        </div>
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