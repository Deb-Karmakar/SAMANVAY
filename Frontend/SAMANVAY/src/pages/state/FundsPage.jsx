// src/pages/state/FundsPage.jsx (Final Version)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wallet, MoreHorizontal, IndianRupee, Send, Download, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const fetchStateFundSummary = async () => {
    const { data } = await axiosInstance.get('/funds/summary/mystate');
    return data;
};

const COLORS = ['#3b82f6', '#a5b4fc'];

export default function StateFundsPage() {
    const [isDownloading, setIsDownloading] = useState(false);
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['stateFundSummary'],
        queryFn: fetchStateFundSummary,
    });

    const handleDownloadReport = async () => {
        setIsDownloading(true);
        try {
            const response = await axiosInstance.get('/funds/report/download/mystate', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `State-Fund-Report-${new Date().toISOString().slice(0,10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to download the report. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (isError) return <div className="text-center text-destructive">Error: {error.message}</div>;

    const { overall, byAgency } = data;
    const stateBuffer = overall.totalReceived - overall.totalDistributed;
    const distributionData = [
        { name: 'Distributed', value: overall.totalDistributed },
        { name: 'Unallocated Buffer', value: stateBuffer },
    ];
    // Note: Agency utilization calculation would need to be added to the backend aggregation
    const totalUtilizedByAgencies = byAgency.reduce((acc, agency) => acc + agency.utilized, 0);
    const overallUtilizationRate = overall.totalDistributed > 0 ? Math.round((totalUtilizedByAgencies / overall.totalDistributed) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">State Fund Distribution</h1>
                    <p className="text-muted-foreground">Track funds and their distribution to executing agencies.</p>
                </div>
                <Button onClick={handleDownloadReport} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading ? 'Generating...' : 'Download Report'}
                </Button>
            </div>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                 <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Allocation Received</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹ {overall.totalReceived.toFixed(2)} Cr</div><p className="text-xs text-muted-foreground">From Central Ministry</p></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Distributed to Agencies</CardTitle><Send className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹ {overall.totalDistributed.toFixed(2)} Cr</div><p className="text-xs text-muted-foreground">To {byAgency.length} agencies</p></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Unallocated (Buffer)</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹ {stateBuffer.toFixed(2)} Cr</div><p className="text-xs text-muted-foreground">Held at state level</p></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Agency Utilization Rate</CardTitle><div className="h-4 w-4 text-muted-foreground">%</div></CardHeader><CardContent><div className="text-2xl font-bold">{overallUtilizationRate}%</div><Progress value={overallUtilizationRate} className="mt-2" /><p className="text-xs text-muted-foreground mt-1">Based on reported data</p></CardContent></Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Fund Distribution Overview</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${(entry.percent * 100).toFixed(0)}%`}>
                                    {distributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toFixed(2)} Cr`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Agency-wise Fund Breakdown</CardTitle><CardDescription>Track distribution and utilization for each executing agency.</CardDescription></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Executing Agency</TableHead><TableHead>Distributed</TableHead><TableHead>Utilized</TableHead><TableHead className="w-[150px]">Utilization</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {byAgency.map((agency) => {
                                    const rate = agency.distributed > 0 ? Math.round((agency.utilized / agency.distributed) * 100) : 0;
                                    return (
                                        <TableRow key={agency.agencyId}>
                                            <TableCell className="font-medium">{agency.agencyName}</TableCell>
                                            <TableCell>₹ {agency.distributed.toFixed(2)} Cr</TableCell>
                                            <TableCell>₹ {agency.utilized.toFixed(2)} Cr</TableCell>
                                            <TableCell><div className="flex items-center gap-2"><Progress value={rate} className="w-[60%]" /><span>{rate}%</span></div></TableCell>
                                            <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>View Transactions</DropdownMenuItem><DropdownMenuItem>Send Reminder</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}