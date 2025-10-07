import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, AlertTriangle,
    RefreshCw, Download, Activity, Award, Target,
    ArrowUpRight, ArrowDownRight, Sparkles, Shield, Database,
    Menu, X, ChevronDown
} from 'lucide-react';

const getCurrentFiscalYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};

const PFMSDashboardPage = () => {
    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncingReal, setSyncingReal] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const [fiscalYear, setFiscalYear] = useState(getCurrentFiscalYear());
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [fiscalYear, userInfo, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(
                `pfms/dashboard?fiscalYear=${fiscalYear}`
            );
            setDashboardData(response.data);
        } catch (err) {
            console.error('Failed to fetch PFMS data:', err);
            
            if (err.response?.status === 404 || err.message?.includes('not found')) {
                setError("No PFMS data available for this fiscal year. Click 'Sync PFMS' to initialize the data.");
            } else if (err.response?.status === 401) {
                setError("Authentication failed. Logging out...");
                logout();
            } else if (err.code === 'ERR_NETWORK') {
                setError("Network Error: Could not connect to the server.");
            } else {
                setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        try {
            setSyncing(true);
            await axiosInstance.post(
                `pfms/sync`,
                { fiscalYear }
            );
            await fetchDashboardData();
            alert('PFMS data synced successfully!');
        } catch (error) {
            console.error('Sync failed:', error);
            if (error.response && error.response.status === 401) {
                logout();
            }
            alert('Sync failed. Check console for details.');
        } finally {
            setSyncing(false);
        }
    };

    const handleSyncReal = async () => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        try {
            setSyncingReal(true);
            await axiosInstance.post(
                `pfms/sync-real`,
                { fiscalYear }
            );
            await fetchDashboardData();
            alert('PFMS data synced with real projects successfully!');
        } catch (error) {
            console.error('Real data sync failed:', error);
            if (error.response && error.response.status === 401) {
                logout();
            }
            alert('Real data sync failed. Check console for details.');
        } finally {
            setSyncingReal(false);
        }
    };

    const handleExport = async (format = 'csv', type = 'full') => {
        try {
            const response = await axiosInstance.get(
                `pfms/export?fiscalYear=${fiscalYear}&format=${format}&type=${type}`,
                { responseType: 'blob' }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pfms-${type}-report-${fiscalYear}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            alert('Report exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report');
        }
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl md:text-2xl font-bold mb-2">Failed to Load Dashboard</h2>
                <p className="text-red-600 mb-6 max-w-md text-sm md:text-base">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={fetchDashboardData}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button onClick={handleSync} variant="outline">
                        <Database className="mr-2 h-4 w-4" />
                        Initialize PFMS Data
                    </Button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <p className="mb-4 text-center">No dashboard data available for the selected fiscal year.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleSync}>
                        <Database className="mr-2 h-4 w-4" />
                        Sync Mock Data
                    </Button>
                    <Button onClick={handleSyncReal} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Real Data
                    </Button>
                </div>
            </div>
        );
    }

    const { overview, componentBreakdown, quarterlyTrends, topPerformers, bottomPerformers, predictions, lastSync } = dashboardData;

    return (
        <div className="container mx-auto p-3 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        PFMS Dashboard
                    </h1>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Dashboard Options</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                                <select
                                    value={fiscalYear}
                                    onChange={(e) => setFiscalYear(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2"
                                >
                                    <option value="2024-25">FY 2024-25</option>
                                    <option value="2023-24">FY 2023-24</option>
                                    <option value="2025-26">FY 2025-26</option>
                                </select>
                                
                                <Button onClick={handleSync} disabled={syncing} variant="outline" className="w-full">
                                    <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                                    {syncing ? 'Syncing...' : 'Sync Mock'}
                                </Button>
                                
                                <Button onClick={handleSyncReal} disabled={syncingReal} className="w-full">
                                    <Database className={`mr-2 h-4 w-4 ${syncingReal ? 'animate-spin' : ''}`} />
                                    {syncingReal ? 'Syncing...' : 'Sync Real Data'}
                                </Button>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Report
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuItem onClick={() => handleExport('csv', 'full')}>
                                            Full Report (CSV)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('csv', 'states')}>
                                            State-wise (CSV)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('csv', 'components')}>
                                            Component-wise (CSV)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('csv', 'quarterly')}>
                                            Quarterly Trends (CSV)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('json', 'full')}>
                                            Full Data (JSON)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        PFMS Integration Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2">
                        National-level fund release and utilization monitoring
                    </p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                    >
                        <option value="2024-25">FY 2024-25</option>
                        <option value="2023-24">FY 2023-24</option>
                        <option value="2025-26">FY 2025-26</option>
                    </select>
                    
                    <Button onClick={handleSync} disabled={syncing} variant="outline">
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Mock'}
                    </Button>
                    
                    <Button onClick={handleSyncReal} disabled={syncingReal} variant="default">
                        <Database className={`mr-2 h-4 w-4 ${syncingReal ? 'animate-spin' : ''}`} />
                        {syncingReal ? 'Syncing...' : 'Sync Real Data'}
                    </Button>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport('csv', 'full')}>
                                Full Report (CSV)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('csv', 'states')}>
                                State-wise (CSV)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('csv', 'components')}>
                                Component-wise (CSV)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('csv', 'quarterly')}>
                                Quarterly Trends (CSV)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('json', 'full')}>
                                Full Data (JSON)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Health Score Banner - Mobile Optimized */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl md:text-2xl font-bold mb-2">System Health Score</h3>
                            <p className="opacity-90 text-sm">
                                Last synced: {new Date(lastSync).toLocaleString()}
                            </p>
                            {overview?.dataSource && (
                                <Badge className="mt-2 bg-white/20 text-white border-white/30">
                                    Data: {overview.dataSource}
                                </Badge>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-5xl md:text-6xl font-bold">{overview.healthScore}</div>
                            <div className="text-sm opacity-90">/ 100</div>
                            <Badge className="mt-2 bg-white text-blue-600">
                                {overview.healthScore >= 70 ? 'Excellent' : overview.healthScore >= 50 ? 'Good' : 'Needs Attention'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics - Mobile Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="border-l-4 border-blue-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                            Total Allocated
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-3xl font-bold text-blue-600">
                            {formatCurrency(overview.totalAllocated)}
                        </div>
                        <div className="flex items-center mt-2 text-xs md:text-sm text-gray-500">
                            <Target className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                            Budget Allocation
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                            Total Released
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-3xl font-bold text-green-600">
                            {formatCurrency(overview.totalReleased)}
                        </div>
                        <div className="flex items-center mt-2 text-xs md:text-sm">
                            <Progress value={overview.releaseRate} className="flex-1 mr-2 h-2" />
                            <span className="font-medium text-xs">{overview.releaseRate}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-purple-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                            Total Utilized
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-3xl font-bold text-purple-600">
                            {formatCurrency(overview.totalUtilized)}
                        </div>
                        <div className="flex items-center mt-2 text-xs md:text-sm">
                            <Progress value={overview.utilizationRate} className="flex-1 mr-2 h-2" />
                            <span className="font-medium text-xs">{overview.utilizationRate}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-orange-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                            Pending Utilization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-3xl font-bold text-orange-600">
                            {formatCurrency(overview.totalPending)}
                        </div>
                        <div className="flex items-center mt-2 text-xs md:text-sm text-orange-600">
                            <AlertTriangle className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                            Requires Action
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs - Mobile Scrollable */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="overflow-x-auto pb-2">
                    <TabsList className="grid w-full min-w-[500px] grid-cols-5">
                        <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
                        <TabsTrigger value="components" className="text-xs md:text-sm">Components</TabsTrigger>
                        <TabsTrigger value="trends" className="text-xs md:text-sm">Trends</TabsTrigger>
                        <TabsTrigger value="performance" className="text-xs md:text-sm">Performance</TabsTrigger>
                        <TabsTrigger value="predictions" className="text-xs md:text-sm">AI Insights</TabsTrigger>
                    </TabsList>
                </div>

                {/* Overview Tab - Mobile Optimized */}
                <TabsContent value="overview" className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Fund Flow Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">Fund Flow Analysis</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Release vs Utilization trends</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 md:p-6">
                                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                                    <AreaChart data={quarterlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${value / 10000000}Cr`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Area type="monotone" dataKey="released" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Released" />
                                        <Area type="monotone" dataKey="utilized" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Utilized" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Utilization Rate Gauge */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">National Utilization Rate</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Overall fund utilization efficiency</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center p-4">
                                <div className="relative w-48 h-48 md:w-64 md:h-64">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={overview.utilizationRate >= 70 ? '#10b981' : overview.utilizationRate >= 50 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="8"
                                            strokeDasharray={`${overview.utilizationRate * 2.51} 251`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-3xl md:text-5xl font-bold">{overview.utilizationRate}%</div>
                                        <div className="text-xs md:text-sm text-gray-500">Utilization</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Components Tab - Mobile Optimized */}
                <TabsContent value="components" className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Component-wise Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">Component-wise Fund Distribution</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Allocation across different scheme components</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 md:p-6">
                                <ResponsiveContainer width="100%" height={250} className="md:h-[350px]">
                                    <PieChart>
                                        <Pie
                                            data={componentBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ component, percentage }) => `${component}: ${percentage}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="allocated"
                                        >
                                            {componentBreakdown?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Component Performance Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">Component Performance Matrix</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Detailed breakdown by component</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 md:p-6">
                                <div className="space-y-3 md:space-y-4">
                                    {componentBreakdown?.map((component, index) => (
                                        <div key={index} className="p-3 md:p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                                <div className="font-semibold text-sm md:text-lg">{component.component}</div>
                                                <Badge 
                                                    className="text-xs"
                                                    variant={component.utilizationRate >= 70 ? "success" : component.utilizationRate >= 50 ? "warning" : "destructive"}
                                                >
                                                    {component.utilizationRate}% Utilized
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                                                <div>
                                                    <div className="text-gray-500">Allocated</div>
                                                    <div className="font-semibold text-xs md:text-base">{formatCurrency(component.allocated)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Released</div>
                                                    <div className="font-semibold text-green-600 text-xs md:text-base">{formatCurrency(component.released)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Utilized</div>
                                                    <div className="font-semibold text-blue-600 text-xs md:text-base">{formatCurrency(component.utilized)}</div>
                                                </div>
                                            </div>
                                            <Progress value={component.utilizationRate} className="mt-3 h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Component Comparison Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm md:text-base">Component-wise Comparison</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Release vs Utilization across components</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
                                <BarChart data={componentBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="component" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${value / 10000000}Cr`} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                                    <Bar dataKey="released" fill="#82ca9d" name="Released" />
                                    <Bar dataKey="utilized" fill="#ffc658" name="Utilized" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trends Tab - Mobile Optimized */}
                <TabsContent value="trends" className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Quarterly Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">Quarterly Fund Flow Trends</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Quarter-wise analysis of fund movement</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 md:p-6">
                                <ResponsiveContainer width="100%" height={250} className="md:h-[350px]">
                                    <LineChart data={quarterlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${value / 10000000}Cr`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Line type="monotone" dataKey="allocated" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} name="Allocated" />
                                        <Line type="monotone" dataKey="released" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} name="Released" />
                                        <Line type="monotone" dataKey="utilized" stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} name="Utilized" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Utilization Rate Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">Utilization Rate Progression</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Quarterly utilization efficiency</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 md:p-6">
                                <ResponsiveContainer width="100%" height={250} className="md:h-[350px]">
                                    <AreaChart data={quarterlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Area type="monotone" dataKey="utilizationRate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Utilization Rate" />
                                        <Area type="monotone" dataKey="releaseRate" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} name="Release Rate" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Growth Indicators - Mobile Scrollable */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {quarterlyTrends?.slice(-3).map((quarter, index) => {
                            const prevQuarter = index === 0 ? null : quarterlyTrends[quarterlyTrends.length - 4 + index];
                            const growth = prevQuarter ? ((quarter.utilized - prevQuarter.utilized) / prevQuarter.utilized) * 100 : 0;
                           
                            return (
                                <Card key={quarter.quarter}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                                            {quarter.quarter} Performance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 md:space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs md:text-sm text-gray-500">Released</span>
                                                <span className="font-semibold text-xs md:text-sm">{formatCurrency(quarter.released)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs md:text-sm text-gray-500">Utilized</span>
                                                <span className="font-semibold text-xs md:text-sm">{formatCurrency(quarter.utilized)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs md:text-sm text-gray-500">Efficiency</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold text-xs md:text-sm">{quarter.utilizationRate}%</span>
                                                    {growth !== 0 && (
                                                        growth > 0 ?
                                                        <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-500" /> :
                                                        <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Performance Tab - Mobile Optimized */}
                <TabsContent value="performance" className="space-y-4 md:space-y-6">
                    {/* Top Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                <Award className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                                Top Performing States/UTs
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm">Based on fund utilization efficiency</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <div className="space-y-3 md:space-y-4">
                                {topPerformers?.map((performer, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors gap-3">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500 text-white font-bold text-sm md:text-base">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm md:text-lg">{performer.state}</div>
                                                <div className="text-xs md:text-sm text-gray-600">
                                                    Released: {formatCurrency(performer.released)}
                                                </div>
                                                <div className="text-xs md:text-sm text-gray-600">
                                                    Utilized: {formatCurrency(performer.utilized)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl md:text-2xl font-bold text-green-600">{performer.utilizationRate}%</div>
                                            <Badge variant="success" className="text-xs">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                High Performer
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                                States/UTs Requiring Attention
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm">Low fund utilization - needs intervention</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <div className="space-y-3 md:space-y-4">
                                {bottomPerformers?.map((performer, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors gap-3">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-500 text-white">
                                                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm md:text-lg">{performer.state}</div>
                                                <div className="text-xs md:text-sm text-gray-600">
                                                    Released: {formatCurrency(performer.released)}
                                                </div>
                                                <div className="text-xs md:text-sm text-gray-600">
                                                    Utilized: {formatCurrency(performer.utilized)}
                                                </div>
                                                <div className="text-xs md:text-sm text-orange-600 mt-1">
                                                    Pending: {formatCurrency(performer.released - performer.utilized)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl md:text-2xl font-bold text-orange-600">{performer.utilizationRate}%</div>
                                            <Badge variant="warning" className="text-xs">
                                                <TrendingDown className="h-3 w-3 mr-1" />
                                                Needs Support
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Radar Chart - Hidden on Mobile */}
                    <Card className="hidden md:block">
                        <CardHeader>
                            <CardTitle>Multi-dimensional Performance Analysis</CardTitle>
                            <CardDescription>Comparative analysis across key metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={[
                                    { metric: 'Release Rate', value: overview.releaseRate },
                                    { metric: 'Utilization Rate', value: overview.utilizationRate },
                                    { metric: 'Health Score', value: overview.healthScore },
                                    { metric: 'Compliance', value: 85 },
                                    { metric: 'Efficiency', value: 78 },
                                    { metric: 'Timeliness', value: 82 }
                                ]}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Insights Tab - Mobile Optimized */}
                <TabsContent value="predictions" className="space-y-4 md:space-y-6">
                    {/* AI Predictions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                                AI-Powered Predictions
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm">Machine learning based forecasts for next quarter</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                                <div className="p-3 md:p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs md:text-sm font-medium text-gray-600">Expected Release</span>
                                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
                                    </div>
                                    <div className="text-lg md:text-2xl font-bold text-purple-600">
                                        {formatCurrency(predictions?.expectedRelease || 0)}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500 mt-1">
                                        +{predictions?.releaseGrowth || 0}% from last quarter
                                    </div>
                                </div>
                                <div className="p-3 md:p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs md:text-sm font-medium text-gray-600">Expected Utilization</span>
                                        <Activity className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                                    </div>
                                    <div className="text-lg md:text-2xl font-bold text-blue-600">
                                        {formatCurrency(predictions?.expectedUtilization || 0)}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500 mt-1">
                                        {predictions?.utilizationRate || 0}% utilization rate
                                    </div>
                                </div>
                                <div className="p-3 md:p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs md:text-sm font-medium text-gray-600">Confidence Score</span>
                                        <Shield className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                                    </div>
                                    <div className="text-lg md:text-2xl font-bold text-green-600">
                                        {predictions?.confidence || 0}%
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500 mt-1">
                                        Model accuracy
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm md:text-base">Risk Analysis & Recommendations</CardTitle>
                            <CardDescription className="text-xs md:text-sm">AI-identified risks and suggested interventions</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <div className="space-y-3 md:space-y-4">
                                {predictions?.risks?.map((risk, index) => (
                                    <div key={index} className="p-3 md:p-4 border rounded-lg">
                                        <div className="flex items-start gap-2 md:gap-3">
                                            <div className={`p-1.5 md:p-2 rounded-lg ${
                                                risk.severity === 'high' ? 'bg-red-100' :
                                                risk.severity === 'medium' ? 'bg-yellow-100' :
                                                'bg-blue-100'
                                            }`}>
                                                <AlertTriangle className={`h-4 w-4 md:h-5 md:w-5 ${
                                                    risk.severity === 'high' ? 'text-red-600' :
                                                    risk.severity === 'medium' ? 'text-yellow-600' :
                                                    'text-blue-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-sm md:text-base">{risk.title}</h4>
                                                    <Badge 
                                                        className="text-xs"
                                                        variant={
                                                            risk.severity === 'high' ? 'destructive' :
                                                            risk.severity === 'medium' ? 'warning' :
                                                            'secondary'
                                                        }
                                                    >
                                                        {risk.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs md:text-sm text-gray-600 mb-2">{risk.description}</p>
                                                <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-xs md:text-sm font-medium text-gray-700 mb-1">Recommended Action:</div>
                                                    <div className="text-xs md:text-sm text-gray-600">{risk.recommendation}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Predictive Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm md:text-base">Predictive Trend Analysis</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Historical data with future projections</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <ResponsiveContainer width="100%" height={250} className="md:h-[400px]">
                                <LineChart data={[
                                    ...quarterlyTrends,
                                    ...(predictions?.futureQuarters || [])
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${value / 10000000}Cr`} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="released"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        strokeDasharray={predictions?.futureQuarters ? "5 5" : "0"}
                                        name="Released (Projected)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="utilized"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        strokeDasharray={predictions?.futureQuarters ? "5 5" : "0"}
                                        name="Utilized (Projected)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Footer Stats - Mobile Optimized */}
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-gray-800">{overview.totalStates || 36}</div>
                        <div className="text-xs md:text-sm text-gray-500">States/UTs</div>
                    </div>
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-gray-800">{overview.totalSchemes || 45}</div>
                        <div className="text-xs md:text-sm text-gray-500">Active Schemes</div>
                    </div>
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-gray-800">{overview.totalTransactions || '12.5K'}</div>
                        <div className="text-xs md:text-sm text-gray-500">Transactions</div>
                    </div>
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-gray-800">{overview.dataAccuracy || 99.5}%</div>
                        <div className="text-xs md:text-sm text-gray-500">Data Accuracy</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PFMSDashboardPage;