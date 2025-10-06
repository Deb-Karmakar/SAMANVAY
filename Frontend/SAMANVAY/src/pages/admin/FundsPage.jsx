// src/pages/admin/FundsPage.jsx (Final Version)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { IndianRupee, Landmark, Download, Loader2 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fetchFundSummary = async () => {
    const { data } = await axiosInstance.get('/funds/summary');
    return data;
};

const componentColors = {
  'Adarsh Gram': '#0088FE',
  'Hostel': '#00C49F',
  'GIA': '#FFBB28',
};

export default function FundsPage() {
    const [isDownloading, setIsDownloading] = useState(false);
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['fundSummary'],
        queryFn: fetchFundSummary,
    });

    const handleDownloadReport = async () => {
        setIsDownloading(true);
        try {
            const response = await axiosInstance.get('/funds/report/download', {
                responseType: 'blob', // Important: expect a binary response
            });
            
            // Create a blob URL and trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `SAMANVAY-Fund-Report-${new Date().toISOString().slice(0,10)}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Failed to download report:', err);
            // You can add a user-facing error message here (e.g., using a toast library)
            alert('Failed to download the report. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading financial data...</span></div>;
    if (isError) return <div className="text-center text-destructive p-4 border border-destructive/50 rounded-md">Error loading fund data: {error.message}</div>;

    const { overall, byState, byComponent } = data;
    const utilizationRate = overall.totalBudget > 0 ? Math.round((overall.totalDisbursed / overall.totalBudget) * 100) : 0;
    const pieData = byComponent.filter(d => d.value > 0 && d.name && d.name !== 'null');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Fund Management</h1>
                    <p className="text-muted-foreground">Track fund disbursement and budget allocation across all States and Components.</p>
                </div>
                <Button onClick={handleDownloadReport} disabled={isDownloading}>
                    {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {isDownloading ? 'Generating...' : 'Download Report'}
                </Button>
            </div>

            {/* The rest of the JSX is the same as your last version... */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Sanctioned Budget</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{overall.totalBudget.toFixed(2)} Cr</div><p className="text-xs text-muted-foreground">Approved by MoSJE</p></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Disbursed</CardTitle><Landmark className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{overall.totalDisbursed.toFixed(2)} Cr</div><p className="text-xs text-muted-foreground">To all executing agencies</p></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Available for Allocation</CardTitle><Landmark className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{(overall.totalBudget - overall.totalDisbursed).toFixed(2)} Cr</div><p className="text-xs text-muted-foreground">Remaining in total budget</p></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Budget Utilization</CardTitle><div className="h-4 w-4 text-muted-foreground">%</div></CardHeader><CardContent><div className="text-2xl font-bold">{utilizationRate}%</div><Progress value={utilizationRate} className="mt-2" /></CardContent></Card>
             </div>

             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                 <Card className="lg:col-span-3">
                     <CardHeader><CardTitle>Budget Allocation by State (in Cr)</CardTitle><CardDescription>Comparison of sanctioned budget vs. funds disbursed to agencies in each state.</CardDescription></CardHeader>
                     <CardContent>
                         <ResponsiveContainer width="100%" height={350}>
                             <BarChart data={byState} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" />
                                 <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} interval={0} />
                                 <YAxis />
                                 <Tooltip formatter={(value) => `₹${value.toFixed(2)} Cr`} />
                                 <Legend />
                                 <Bar dataKey="budget" fill="#8884d8" name="Sanctioned Budget" />
                                 <Bar dataKey="disbursed" fill="#82ca9d" name="Funds Disbursed" />
                             </BarChart>
                         </ResponsiveContainer>
                     </CardContent>
                 </Card>
                 <Card className="lg:col-span-2">
                      <CardHeader><CardTitle>Budget by Component</CardTitle><CardDescription>Distribution of the total sanctioned budget across PM-AJAY components.</CardDescription></CardHeader>
                     <CardContent>
                         <ResponsiveContainer width="100%" height={350}>
                             <PieChart>
                                 <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} fill="#8884d8" labelLine={true} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                     {pieData.map((entry) => (
                                         <Cell key={`cell-${entry.name}`} fill={componentColors[entry.name]} />
                                     ))}
                                 </Pie>
                                 <Tooltip formatter={(value) => `₹${value.toFixed(2)} Cr`} />
                                 <Legend />
                             </PieChart>
                         </ResponsiveContainer>
                     </CardContent>
                 </Card>
             </div>

             <Card>
                 <CardHeader><CardTitle>State-wise Fund Details</CardTitle><CardDescription>Detailed breakdown of fund status for each State/UT.</CardDescription></CardHeader>
                 <CardContent>
                     <Table>
                         <TableHeader><TableRow><TableHead>State/UT</TableHead><TableHead>Sanctioned Budget (Cr)</TableHead><TableHead>Disbursed to Agencies (Cr)</TableHead><TableHead>Utilization Rate</TableHead></TableRow></TableHeader>
                         <TableBody>
                             {byState.map((stateData) => {
                                 const rate = stateData.budget > 0 ? Math.round((stateData.disbursed / stateData.budget) * 100) : 0;
                                 return (
                                     <TableRow key={stateData.state}>
                                         <TableCell className="font-medium">{stateData.state}</TableCell>
                                         <TableCell>₹ {stateData.budget.toFixed(2)}</TableCell>
                                         <TableCell>₹ {stateData.disbursed.toFixed(2)}</TableCell>
                                         <TableCell><div className="flex items-center gap-2"><Progress value={rate} className="w-[60%]" /><span>{rate}%</span></div></TableCell>
                                     </TableRow>
                                 );
                             })}
                         </TableBody>
                     </Table>
                 </CardContent>
             </Card>
        </div>
    );
}