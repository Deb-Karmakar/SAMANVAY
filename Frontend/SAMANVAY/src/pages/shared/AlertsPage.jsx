// Frontend/src/pages/shared/AlertsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Clock, RefreshCw } from 'lucide-react';
import AlertBadge from '@/components/alerts/AlertBadge';

const fetchAlerts = async () => {
    const { data } = await axiosInstance.get('/alerts');
    return data;
};

const acknowledgeAlert = async (alertId) => {
    const { data } = await axiosInstance.put(`/alerts/${alertId}/acknowledge`);
    return data;
};

const snoozeAlert = async ({ alertId, days }) => {
    const { data } = await axiosInstance.put(`/alerts/${alertId}/snooze`, { days });
    return data;
};

export default function AlertsPage() {
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('all');

    const { data: alertsData, isLoading, refetch } = useQuery({
        queryKey: ['alerts'],
        queryFn: fetchAlerts,
        refetchInterval: 30000,
    });

    const acknowledgeMutation = useMutation({
        mutationFn: acknowledgeAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
    });

    const snoozeMutation = useMutation({
        mutationFn: snoozeAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
    });

    const handleAlertClick = (alert) => {
        if (alert.project?._id) {
            if (userInfo.role === 'CentralAdmin') {
                navigate(`/admin/projects/${alert.project._id}`);
            } else if (userInfo.role === 'StateOfficer') {
                navigate(`/state/projects/${alert.project._id}`);
            } else if (userInfo.role === 'ExecutingAgency') {
                navigate(`/agency/projects/${alert.project._id}`);
            }
        }
    };

    const getAlertsForTab = () => {
        if (!alertsData) return [];
        
        switch (activeTab) {
            case 'critical':
                return alertsData.critical || [];
            case 'warning':
                return alertsData.warning || [];
            case 'info':
                return alertsData.info || [];
            default:
                return alertsData.allAlerts || [];
        }
    };

    const alerts = getAlertsForTab();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Alerts</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage project alerts
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-destructive">
                                    {alertsData?.critical?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Critical</p>
                            </div>
                            <Badge variant="destructive" className="text-lg px-3 py-1">!</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {alertsData?.warning?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Warning</p>
                            </div>
                            <Badge variant="default" className="text-lg px-3 py-1">!</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">
                                    {alertsData?.info?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Info</p>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3 py-1">i</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Alerts</CardTitle>
                    <CardDescription>
                        Click on any alert to view the related project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">
                                All ({alertsData?.total || 0})
                            </TabsTrigger>
                            <TabsTrigger value="critical">
                                Critical ({alertsData?.critical?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="warning">
                                Warning ({alertsData?.warning?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="info">
                                Info ({alertsData?.info?.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            {alerts.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No {activeTab !== 'all' ? activeTab : ''} alerts
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {alerts.map((alert) => (
                                        <div
                                            key={alert._id}
                                            className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleAlertClick(alert)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertBadge severity={alert.severity} />
                                                        {alert.agency && (
                                                            <Badge variant="outline">
                                                                {alert.agency.name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="font-medium mb-1">{alert.message}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span>Project: {alert.project?.name}</span>
                                                        <span>{alert.project?.state}</span>
                                                        <span>
                                                            {new Date(alert.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            snoozeMutation.mutate({ 
                                                                alertId: alert._id, 
                                                                days: 3 
                                                            });
                                                        }}
                                                        disabled={snoozeMutation.isLoading}
                                                    >
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        Snooze
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            acknowledgeMutation.mutate(alert._id);
                                                        }}
                                                        disabled={acknowledgeMutation.isLoading}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Acknowledge
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}