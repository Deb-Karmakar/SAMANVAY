// Frontend/src/pages/admin/CommunicationsPage.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";
import { Mail, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

const fetchCommunicationLogs = async () => {
    const { data } = await axiosInstance.get('/communications');
    return data;
};

const statusConfig = {
    sent: { icon: CheckCircle2, color: 'text-green-600', variant: 'default' },
    failed: { icon: XCircle, color: 'text-destructive', variant: 'destructive' },
    pending: { icon: Clock, color: 'text-yellow-600', variant: 'secondary' }
};

export default function CommunicationsPage() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['communications'],
        queryFn: fetchCommunicationLogs,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Communication Logs</h1>
            
            <div className="space-y-4">
                {logs?.map((log) => {
                    const StatusIcon = statusConfig[log.status]?.icon || Mail;
                    const statusColor = statusConfig[log.status]?.color;
                    
                    return (
                        <Card key={log._id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                                        <CardTitle className="text-lg">{log.subject}</CardTitle>
                                    </div>
                                    <Badge variant={statusConfig[log.status]?.variant}>
                                        {log.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Type</p>
                                        <p className="font-medium capitalize">{log.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Event</p>
                                        <p className="font-medium">{log.event.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Recipient</p>
                                        <p className="font-medium">{log.recipient.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Sent At</p>
                                        <p className="font-medium">
                                            {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {log.error && (
                                    <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                                        <p className="text-sm text-destructive">Error: {log.error}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}