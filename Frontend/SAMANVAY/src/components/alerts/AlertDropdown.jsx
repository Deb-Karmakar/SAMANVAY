// Frontend/src/components/alerts/AlertDropdown.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AlertBadge from './AlertBadge';

const fetchAlerts = async () => {
    const { data } = await axiosInstance.get('/alerts');
    return data;
};

const acknowledgeAlert = async (alertId) => {
    const { data } = await axiosInstance.put(`/alerts/${alertId}/acknowledge`);
    return data;
};

export default function AlertDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: alertsData } = useQuery({
        queryKey: ['alerts'],
        queryFn: fetchAlerts,
        refetchInterval: 60000, // Refetch every minute
    });

    const acknowledgeMutation = useMutation({
        mutationFn: acknowledgeAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
    });

    const totalAlerts = alertsData?.total || 0;
    const criticalCount = alertsData?.critical?.length || 0;
    const topAlerts = alertsData?.allAlerts?.slice(0, 5) || [];

    const handleAlertClick = (alert) => {
        // Navigate to project detail
        if (alert.project?._id) {
            const role = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).role : null;
            
            if (role === 'CentralAdmin') {
                navigate(`/admin/projects/${alert.project._id}`);
            } else if (role === 'StateOfficer') {
                navigate(`/state/projects/${alert.project._id}`);
            } else if (role === 'ExecutingAgency') {
                navigate(`/agency/projects/${alert.project._id}`);
            }
        }
        setOpen(false);
    };

    const handleAcknowledge = (e, alertId) => {
        e.stopPropagation();
        acknowledgeMutation.mutate(alertId);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {totalAlerts > 0 && (
                        <Badge 
                            variant={criticalCount > 0 ? 'destructive' : 'default'}
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {totalAlerts > 9 ? '9+' : totalAlerts}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="font-semibold">Alerts</h3>
                        <p className="text-xs text-muted-foreground">
                            {totalAlerts} active alert{totalAlerts !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {totalAlerts > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                navigate('/alerts');
                                setOpen(false);
                            }}
                        >
                            View All
                        </Button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {topAlerts.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No active alerts</p>
                        </div>
                    ) : (
                        topAlerts.map((alert) => (
                            <div
                                key={alert._id}
                                className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => handleAlertClick(alert)}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <AlertBadge severity={alert.severity} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => handleAcknowledge(e, alert._id)}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm mb-2">{alert.message}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{alert.project?.name}</span>
                                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {topAlerts.length > 0 && topAlerts.length < totalAlerts && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2 text-center">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    navigate('/alerts');
                                    setOpen(false);
                                }}
                            >
                                View {totalAlerts - topAlerts.length} more alert{totalAlerts - topAlerts.length !== 1 ? 's' : ''}
                                <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}