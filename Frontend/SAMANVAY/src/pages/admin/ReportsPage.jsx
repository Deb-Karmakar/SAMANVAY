// Frontend/src/pages/admin/ReportsPage.jsx

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    BarChart3, 
    FileDown, 
    Settings2, 
    TrendingUp, 
    AlertTriangle,
    Users,
    Wallet,
    Loader2,
    FileText,
    Download,
    Calendar,
    Filter,
    RefreshCw,
    PieChart as PieChartIcon,
    Activity,
    Building2
} from "lucide-react";
import { 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import { useToast } from "@/components/ui/use-toast";

// Color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// API functions
const generateReport = async ({ type, filters }) => {
    const { data } = await axiosInstance.post(`/reports/${type}`, filters);
    return data;
};

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg shadow-lg p-3">
                <p className="font-semibold">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? 
                            entry.value.toFixed(2) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminReportsPage() {
    const { toast } = useToast();
    const [selectedReportType, setSelectedReportType] = useState('');
    const [filters, setFilters] = useState({
        state: 'all',
        status: 'all',
        component: 'all',
        severity: 'all',
        startDate: '',
        endDate: ''
    });
    const [reportData, setReportData] = useState(null);
    const [activeTab, setActiveTab] = useState('visualization');

    const reportMutation = useMutation({
        mutationFn: generateReport,
        onSuccess: (data) => {
            setReportData(data);
            toast({
                title: "Report Generated",
                description: "Your report has been generated successfully."
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to generate report",
                variant: "destructive"
            });
        }
    });

    const handleGenerateReport = () => {
        if (!selectedReportType) {
            toast({
                title: "Selection Required",
                description: "Please select a report type",
                variant: "destructive"
            });
            return;
        }

        reportMutation.mutate({
            type: selectedReportType,
            filters
        });
    };

    const exportToCSV = () => {
    console.log("Export CSV called, reportData:", reportData);
    
    if (!reportData) {
        toast({
            title: "No Report Generated",
            description: "Please generate a report first before exporting",
            variant: "destructive",
            duration: 4000
        });
        return;
    }

    if (!reportData.data || reportData.data.length === 0) {
        toast({
            title: "No Data Available",
            description: "The report contains no data to export. Try different filters.",
            variant: "destructive",
            duration: 4000
        });
        return;
    }

    let csvContent = '';
    
    try {
        // Add BOM for Excel to recognize UTF-8
        csvContent = '\uFEFF';
        
        // Add report header
        csvContent += `Report Type: ${reportData.reportType}\n`;
        csvContent += `Generated At: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;

        // Add data based on report type
        switch(reportData.reportType) {
            case 'fund-utilization':
                csvContent += 'State,Total Budget (Cr),Allocated (Cr),Utilization %,Total Projects,Completed,Avg Progress\n';
                reportData.data.forEach(row => {
                    csvContent += `"${row.state || 'N/A'}",${(row.totalBudget || 0).toFixed(2)},${(row.totalAllocated || 0).toFixed(2)},${(row.utilizationRate || 0).toFixed(1)},${row.totalProjects || 0},${row.completedProjects || 0},${row.avgProgress || 0}\n`;
                });
                break;

            case 'project-status':
    csvContent += 'Project Name,State,District,Component,Status,Progress %,Budget (Cr),Agencies,Days Remaining\n';
    reportData.data.forEach(row => {
        const budget = row.budget != null ? row.budget.toFixed(2) : '0.00';
        const progress = row.progress != null ? row.progress : 0;
        const daysRemaining = row.daysRemaining !== null && row.daysRemaining !== undefined ? row.daysRemaining : 'N/A';
        
        csvContent += `"${row.name || 'N/A'}","${row.state || 'N/A'}","${row.district || 'N/A'}","${row.component || 'N/A'}","${row.status || 'N/A'}",${progress},${budget},"${row.agencies || 'N/A'}",${daysRemaining}\n`;
    });
    break;

            case 'agency-performance':
                csvContent += 'Agency Name,Type,State,Total Projects,Completed,On Track,Delayed,Completion Rate %,On-Time Rate %,Avg Progress,Allocated (Cr)\n';
                reportData.data.forEach(row => {
                    csvContent += `"${row.agencyName || 'N/A'}","${row.agencyType || 'N/A'}","${row.state || 'N/A'}",${row.totalProjects || 0},${row.completedProjects || 0},${row.onTrackProjects || 0},${row.delayedProjects || 0},${(row.completionRate || 0).toFixed(1)},${(row.onTimeRate || 0).toFixed(1)},${row.avgProgress || 0},${(row.totalAllocated || 0).toFixed(2)}\n`;
                });
                break;

            case 'alert-summary':
                csvContent += 'State,Total Alerts,Critical,Warning,Info,Acknowledged,Unacknowledged,Response Rate %\n';
                reportData.data.forEach(row => {
                    csvContent += `"${row.state || 'N/A'}",${row.totalAlerts || 0},${row.critical || 0},${row.warning || 0},${row.info || 0},${row.acknowledged || 0},${row.unacknowledged || 0},${(row.responseRate || 0).toFixed(1)}\n`;
                });
                break;

            case 'component-wise':
                csvContent += 'Component,Total Projects,Completed,On Track,Delayed,Total Budget (Cr),Avg Progress %,Completion Rate %,States Covered\n';
                reportData.data.forEach(row => {
                    csvContent += `"${row.component || 'N/A'}",${row.totalProjects || 0},${row.completed || 0},${row.onTrack || 0},${row.delayed || 0},${(row.totalBudget || 0).toFixed(2)},${row.avgProgress || 0},${(row.completionRate || 0).toFixed(1)},${row.statesCovered || 0}\n`;
                });
                break;

            default:
                // Generic CSV export for unknown report types
                if (reportData.data.length > 0) {
                    // Get headers from first object
                    const headers = Object.keys(reportData.data[0]);
                    csvContent += headers.join(',') + '\n';
                    
                    // Add data rows
                    reportData.data.forEach(row => {
                        const values = headers.map(header => {
                            const value = row[header];
                            // Handle different value types
                            if (value === null || value === undefined) return '';
                            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
                            if (typeof value === 'number') return value;
                            return `"${String(value)}"`;
                        });
                        csvContent += values.join(',') + '\n';
                    });
                }
        }

        // Add summary section if available
        if (reportData.summary) {
            csvContent += '\n\nSummary\n';
            Object.entries(reportData.summary).forEach(([key, value]) => {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                const formattedValue = typeof value === 'number' && value % 1 !== 0 
                    ? value.toFixed(2) 
                    : value;
                csvContent += `"${formattedKey}",${formattedValue}\n`;
            });
        }

        // Verify we have content to export
        if (csvContent.split('\n').length <= 4) { // Only headers, no data
            toast({
                title: "No Data to Export",
                description: "The report doesn't contain any data rows",
                variant: "destructive",
                duration: 4000
            });
            return;
        }

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${reportData.reportType}-${timestamp}.csv`;
        link.setAttribute('download', filename);
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);

        toast({
            title: "Export Successful",
            description: `Report exported as ${filename}`,
            icon: <Download className="h-4 w-4" />,
            duration: 3000
        });

        console.log("CSV exported successfully:", filename);

    } catch (error) {
        console.error('CSV Export Error:', error);
        toast({
            title: "Export Failed",
            description: error instanceof Error ? error.message : "Failed to export report to CSV",
            variant: "destructive",
            duration: 5000
        });
    }
};

    const clearFilters = () => {
        setFilters({
            state: 'all',
            status: 'all',
            component: 'all',
            severity: 'all',
            startDate: '',
            endDate: ''
        });
    };

    // Render visualization based on report type
    const renderVisualization = () => {
        if (!reportData || !reportData.data || reportData.data.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>No data available for visualization</p>
                </div>
            );
        }

        switch (reportData.reportType) {
            case 'fund-utilization':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Budget vs Allocation by State</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportData.data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} />
                                            <YAxis label={{ value: 'Amount (Cr)', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="totalBudget" fill="#3b82f6" name="Total Budget" />
                                            <Bar dataKey="totalAllocated" fill="#10b981" name="Allocated" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Utilization Rate Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.data}
                                                dataKey="utilizationRate"
                                                nameKey="state"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={(entry) => `${entry.state}: ${entry.utilizationRate.toFixed(1)}%`}
                                            >
                                                {reportData.data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Progress Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={reportData.data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="state" />
                                        <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="avgProgress" stroke="#8b5cf6" name="Avg Progress" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'project-status':
                const statusData = Object.entries(reportData.summary.statusBreakdown).map(([status, count]) => ({
                    name: status,
                    value: count
                }));

                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Project Status Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={(entry) => `${entry.name}: ${entry.value}`}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={
                                                        entry.name === 'Completed' ? '#10b981' :
                                                        entry.name === 'On Track' ? '#3b82f6' :
                                                        entry.name === 'Delayed' ? '#ef4444' : '#6b7280'
                                                    } />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Budget Distribution by Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart 
                                            data={reportData.data.slice(0, 10)}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                            <YAxis label={{ value: 'Budget (Cr)', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="budget" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'agency-performance':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Top Performing Agencies</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportData.data.slice(0, 10)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="agencyName" angle={-45} textAnchor="end" height={100} />
                                            <YAxis label={{ value: 'Completion Rate %', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="completionRate" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Project Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={reportData.data.slice(0, 6)}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="agencyName" />
                                            <PolarRadiusAxis />
                                            <Radar name="Completed" dataKey="completedProjects" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                            <Radar name="On Track" dataKey="onTrackProjects" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                            <Radar name="Delayed" dataKey="delayedProjects" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'alert-summary':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Alert Severity Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportData.data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} />
                                            <YAxis label={{ value: 'Number of Alerts', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                                            <Bar dataKey="warning" stackId="a" fill="#f59e0b" />
                                            <Bar dataKey="info" stackId="a" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Response Rate by State</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={reportData.data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="state" />
                                            <YAxis label={{ value: 'Response Rate %', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="responseRate" stroke="#10b981" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'component-wise':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Projects by Component</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.data}
                                                dataKey="totalProjects"
                                                nameKey="component"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={(entry) => `${entry.component}: ${entry.totalProjects}`}
                                            >
                                                {reportData.data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Component Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportData.data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="component" />
                                            <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="avgProgress" fill="#3b82f6" name="Avg Progress" />
                                            <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Render data table based on report type
    const renderDataTable = () => {
        if (!reportData || !reportData.data || reportData.data.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>No data available</p>
                </div>
            );
        }

        switch (reportData.reportType) {
            case 'fund-utilization':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>State</TableHead>
                                <TableHead>Total Budget (Cr)</TableHead>
                                <TableHead>Allocated (Cr)</TableHead>
                                <TableHead>Utilization %</TableHead>
                                <TableHead>Total Projects</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>Avg Progress %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.state}</TableCell>
                                    <TableCell>₹{row.totalBudget.toFixed(2)}</TableCell>
                                    <TableCell>₹{row.totalAllocated.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={row.utilizationRate > 75 ? "success" : row.utilizationRate > 50 ? "warning" : "destructive"}>
                                            {row.utilizationRate.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{row.totalProjects}</TableCell>
                                    <TableCell>{row.completedProjects}</TableCell>
                                    <TableCell>{row.avgProgress}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

           case 'project-status':
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget (Cr)</TableHead>
                    <TableHead>Agencies</TableHead>
                    <TableHead>Days Remaining</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reportData.data.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{row.name || 'N/A'}</TableCell>
                        <TableCell>{row.state || 'N/A'}</TableCell>
                        <TableCell>{row.district || 'N/A'}</TableCell>
                        <TableCell>{row.component || 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={
                                row.status === 'Completed' ? 'success' :
                                row.status === 'On Track' ? 'default' :
                                row.status === 'Delayed' ? 'destructive' : 'secondary'
                            }>
                                {row.status || 'N/A'}
                            </Badge>
                        </TableCell>
                        <TableCell>{row.progress != null ? `${row.progress}%` : 'N/A'}</TableCell>
                        <TableCell>
                            {row.budget != null ? `₹${row.budget.toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell>{row.agencies || 'N/A'}</TableCell>
                        <TableCell>
                            {row.daysRemaining != null ? (
                                <Badge variant={row.daysRemaining < 0 ? "destructive" : row.daysRemaining < 30 ? "warning" : "default"}>
                                    {row.daysRemaining} days
                                </Badge>
                            ) : 'N/A'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

            case 'agency-performance':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agency Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Total Projects</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>On Track</TableHead>
                                <TableHead>Delayed</TableHead>
                                <TableHead>Completion Rate</TableHead>
                                <TableHead>On-Time Rate</TableHead>
                                <TableHead>Avg Progress</TableHead>
                                <TableHead>Allocated (Cr)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.agencyName}</TableCell>
                                    <TableCell>{row.agencyType}</TableCell>
                                    <TableCell>{row.state}</TableCell>
                                    <TableCell>{row.totalProjects}</TableCell>
                                    <TableCell>{row.completedProjects}</TableCell>
                                    <TableCell>{row.onTrackProjects}</TableCell>
                                    <TableCell>{row.delayedProjects}</TableCell>
                                    <TableCell>
                                        <Badge variant={row.completionRate > 75 ? "success" : row.completionRate > 50 ? "warning" : "destructive"}>
                                            {row.completionRate.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={row.onTimeRate > 75 ? "success" : row.onTimeRate > 50 ? "warning" : "destructive"}>
                                            {row.onTimeRate.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{row.avgProgress}%</TableCell>
                                    <TableCell>₹{row.totalAllocated.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

            case 'alert-summary':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>State</TableHead>
                                <TableHead>Total Alerts</TableHead>
                                <TableHead>Critical</TableHead>
                                <TableHead>Warning</TableHead>
                                <TableHead>Info</TableHead>
                                <TableHead>Acknowledged</TableHead>
                                <TableHead>Unacknowledged</TableHead>
                                <TableHead>Response Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.state}</TableCell>
                                    <TableCell>{row.totalAlerts}</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">{row.critical}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="warning">{row.warning}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="default">{row.info}</Badge>
                                    </TableCell>
                                    <TableCell>{row.acknowledged}</TableCell>
                                    <TableCell>{row.unacknowledged}</TableCell>
                                    <TableCell>
                                        <Badge variant={row.responseRate > 75 ? "success" : row.responseRate > 50 ? "warning" : "destructive"}>
                                            {row.responseRate.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

            case 'component-wise':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Component</TableHead>
                                <TableHead>Total Projects</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>On Track</TableHead>
                                <TableHead>Delayed</TableHead>
                                <TableHead>Total Budget (Cr)</TableHead>
                                <TableHead>Avg Progress</TableHead>
                                <TableHead>Completion Rate</TableHead>
                                <TableHead>States Covered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.component}</TableCell>
                                    <TableCell>{row.totalProjects}</TableCell>
                                    <TableCell>{row.completed}</TableCell>
                                    <TableCell>{row.onTrack}</TableCell>
                                    <TableCell>{row.delayed}</TableCell>
                                    <TableCell>₹{row.totalBudget.toFixed(2)}</TableCell>
                                    <TableCell>{row.avgProgress}%</TableCell>
                                    <TableCell>
                                        <Badge variant={row.completionRate > 75 ? "success" : row.completionRate > 50 ? "warning" : "destructive"}>
                                            {row.completionRate.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{row.statesCovered}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Generate comprehensive reports for data-driven decision making
                    </p>
                </div>
            </div>

            {/* Report Generator Card */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Report Configuration
                    </CardTitle>
                    <CardDescription>
                        Select report type and apply filters to generate custom reports
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Report Type Selection */}
                    <div className="grid gap-4">
                        <Label className="text-base font-semibold">Report Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { value: 'fund-utilization', label: 'Fund Utilization', icon: Wallet, desc: 'Budget allocation and spending' },
                                { value: 'project-status', label: 'Project Status', icon: FileText, desc: 'Project progress and timelines' },
                                { value: 'agency-performance', label: 'Agency Performance', icon: Users, desc: 'Agency completion rates' },
                                { value: 'alert-summary', label: 'Alert Summary', icon: AlertTriangle, desc: 'System alerts and issues' },
                                { value: 'component-wise', label: 'Component Analysis', icon: BarChart3, desc: 'Component-wise breakdown' }
                            ].map((report) => (
                                <Card
                                    key={report.value}
                                    className={`cursor-pointer transition-all hover:border-primary ${
                                        selectedReportType === report.value 
                                            ? 'border-primary border-2 bg-primary/5' 
                                            : 'border-border'
                                    }`}
                                    onClick={() => setSelectedReportType(report.value)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                selectedReportType === report.value 
                                                    ? 'bg-primary text-white' 
                                                    : 'bg-muted'
                                            }`}>
                                                <report.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm">{report.label}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {report.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="state">State/UT</Label>
                                <Select 
                                    value={filters.state} 
                                    onValueChange={(value) => setFilters({...filters, state: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All States</SelectItem>
                                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                                        <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                        <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                                        <SelectItem value="Bihar">Bihar</SelectItem>
                                        <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedReportType === 'project-status' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select 
                                            value={filters.status} 
                                            onValueChange={(value) => setFilters({...filters, status: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="Not Started">Not Started</SelectItem>
                                                <SelectItem value="On Track">On Track</SelectItem>
                                                <SelectItem value="Delayed">Delayed</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="component">Component</Label>
                                        <Select 
                                            value={filters.component} 
                                            onValueChange={(value) => setFilters({...filters, component: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Components</SelectItem>
                                                <SelectItem value="Adarsh Gram">Adarsh Gram</SelectItem>
                                                <SelectItem value="GIA">GIA</SelectItem>
                                                <SelectItem value="Hostel">Hostel</SelectItem>
                                                <SelectItem value="Special Schools">Special Schools</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {selectedReportType === 'alert-summary' && (
                                <div className="space-y-2">
                                    <Label htmlFor="severity">Severity</Label>
                                    <Select 
                                        value={filters.severity} 
                                        onValueChange={(value) => setFilters({...filters, severity: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Severities</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                            <SelectItem value="warning">Warning</SelectItem>
                                            <SelectItem value="info">Info</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    type="date"
                                    id="startDate"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    type="date"
                                    id="endDate"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="flex gap-3">
                        <Button 
                            onClick={handleGenerateReport}
                            disabled={reportMutation.isPending || !selectedReportType}
                            className="min-w-[150px]"
                        >
                            {reportMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
                                </>
                            )}
                        </Button>
                        {reportData && (
    <Button 
        variant="outline"
        onClick={exportToCSV}
        disabled={!reportData.data || reportData.data.length === 0}
    >
        <Download className="h-4 w-4 mr-2" />
        Export to CSV
        {reportData.data && reportData.data.length === 0 && (
            <span className="ml-2 text-xs text-muted-foreground">(No data)</span>
        )}
    </Button>
)}
                    </div>
                </CardContent>
            </Card>

            {/* Report Results */}
            {/* Report Results */}
{reportData && (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Report Results
                    </CardTitle>
                    <CardDescription>
                        Generated on {new Date(reportData.generatedAt).toLocaleString()}
                    </CardDescription>
                </div>
                {reportData.summary && (
                    <div className="flex gap-4 text-sm">
                        {Object.entries(reportData.summary)
                            .filter(([key]) => {
                                // Filter out complex objects like statusBreakdown, alertTypes
                                return !['statusBreakdown', 'alertTypes'].includes(key);
                            })
                            .slice(0, 3)
                            .map(([key, value]) => {
                                // Skip if value is an object or array
                                if (typeof value === 'object' && value !== null) return null;
                                
                                return (
                                    <div key={key} className="text-center">
                                        <p className="text-muted-foreground text-xs">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <p className="font-semibold text-lg">
                                            {typeof value === 'number' ? 
                                                (value % 1 !== 0 ? value.toFixed(2) : value.toLocaleString()) : 
                                                String(value)}
                                        </p>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </CardHeader>
        <CardContent>
            {/* Show status breakdown for project-status report */}
            {reportData.reportType === 'project-status' && reportData.summary?.statusBreakdown && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Status Breakdown
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(reportData.summary.statusBreakdown).map(([status, count]) => (
                            <div key={status} className="text-center p-2 bg-background rounded">
                                <p className="text-xs text-muted-foreground">{status}</p>
                                <p className="text-xl font-bold">{count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="visualization" className="flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4" />
                        Visualization
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Data Table
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="visualization" className="mt-6">
                    {renderVisualization()}
                </TabsContent>
                <TabsContent value="table" className="mt-6">
                    <div className="rounded-md border overflow-x-auto">
                        {renderDataTable()}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
)}
        </div>
    );
}