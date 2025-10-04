import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Users, AlertTriangle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

// --- API Fetcher Functions ---
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


export default function AdminDashboard() {
    const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ['adminStats'], queryFn: fetchAdminStats });
    const { data: chartData, isLoading: isLoadingChart } = useQuery({ queryKey: ['projectStatusChart'], queryFn: fetchChartData });
    const { data: activities, isLoading: isLoadingActivities } = useQuery({ queryKey: ['recentActivity'], queryFn: fetchRecentActivity });

    const getInitials = (name = "") => (name.split(' ').map(n => n[0]).join('')).toUpperCase();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">A national overview of the PM-AJAY scheme.</p>
            </div>

            {/* High-Level Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.totalProjects}</div>}</CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Agencies</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.totalAgencies}</div>}</CardContent></Card>
                <Card className="border-destructive/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-destructive">Active Alerts</CardTitle><AlertTriangle className="h-4 w-4 text-destructive" /></CardHeader><CardContent>{isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-destructive">{stats.activeAlerts}</div>}</CardContent></Card>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Project Status Overview</CardTitle><CardDescription>Distribution of all projects by their current status.</CardDescription></CardHeader>
                    <CardContent className="pl-2">
                        {isLoadingChart ? <div className="h-[300px] flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : 
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} /><Bar dataKey="value" fill="fill" />
                                </BarChart>
                            </ResponsiveContainer>
                        }
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Latest registrations and project creations.</CardDescription></CardHeader>
                    <CardContent>
                        {isLoadingActivities ? <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div> :
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <Avatar><AvatarFallback>{activity.type === 'New Project' ? 'P' : 'A'}</AvatarFallback></Avatar>
                                        <div className="text-sm">
                                            <p>{activity.text}</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}