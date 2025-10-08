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
  ArrowUpRight, Award, Target, Activity, Calendar
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {stateName} Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive overview of PM-AJAY scheme implementation in your state
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/state/map')} variant="outline">
            <Map className="mr-2 h-4 w-4" />
            State Map
          </Button>
          <Button onClick={() => navigate('/state/projects')}>
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
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">{projects?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active in {stateName}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Funds Allocated</CardTitle>
            <Wallet className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">{formatCurrency(stats?.totalBudget || 0)}</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">{stats?.utilizationRate || 0}% utilized</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Agencies</CardTitle>
            <Building2 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoadingAgencies ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">{agencies?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Implementing agencies</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Pending Actions</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoadingApprovals ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold text-orange-600">{pendingApprovals?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Require your review</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="districts">Districts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Project Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Current status of all projects in {stateName}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <div className="h-[300px] flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="fill" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Project Status Pie */}
            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>Visual breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <div className="h-[300px] flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {projects ? ((projects.filter(p => p.status === 'Completed').length / projects.length) * 100).toFixed(1) : 0}%
                </div>
                <Progress 
                  value={projects ? (projects.filter(p => p.status === 'Completed').length / projects.length) * 100 : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">On-Time Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {projects ? ((projects.filter(p => p.status === 'On Track').length / projects.length) * 100).toFixed(1) : 0}%
                </div>
                <Progress 
                  value={projects ? (projects.filter(p => p.status === 'On Track').length / projects.length) * 100 : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.utilizationRate || 0}%
                </div>
                <Progress value={stats?.utilizationRate || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Latest project updates in your state</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProjects ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {projects?.slice(0, 5).map((project) => (
                    <div 
                      key={project._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/state/projects/${project._id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.district}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          project.status === 'On Track' ? 'default' :
                          project.status === 'Completed' ? 'secondary' :
                          project.status === 'Delayed' ? 'destructive' : 'outline'
                        }>
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
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items Requiring Your Approval</CardTitle>
              <CardDescription>Review and approve pending items</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApprovals ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : pendingApprovals?.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 mt-1 text-orange-500" />
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-semibold">All caught up!</p>
                  <p className="text-sm mt-2">No pending approvals at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agencies Tab */}
        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agencies in {stateName}</CardTitle>
              <CardDescription>All registered implementing agencies</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAgencies ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {agencies?.map((agency) => (
                    <div key={agency._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{agency.type}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>📍 {agency.district}</span>
                            <span>📧 {agency.email}</span>
                          </div>
                        </div>
                        <Badge variant={agency.status === 'Active' ? 'default' : 'secondary'}>
                          {agency.status}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
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
        <TabsContent value="districts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>District-wise Breakdown</CardTitle>
              <CardDescription>Projects and budget distribution across districts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDistricts ? (
                <div className="h-[300px] flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                    <Bar dataKey="budget" fill="#10b981" name="Budget (Lakhs)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* District Table */}
          <Card>
            <CardHeader>
              <CardTitle>District Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDistricts ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {districtData?.map((district, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{district.district}</p>
                        <p className="text-xs text-muted-foreground">{district.projects} projects</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(district.budget)}</p>
                        <Progress value={district.completionRate} className="w-24 mt-1" />
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
  );
}