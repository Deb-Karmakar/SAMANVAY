import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Landmark, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Mock Data (remains the same) ---
const mockMonthlyData = [
  { month: 'Apr', disbursed: 400, utilized: 240 }, { month: 'May', disbursed: 300, utilized: 139 }, { month: 'Jun', disbursed: 200, utilized: 180 }, { month: 'Jul', disbursed: 278, utilized: 190 }, { month: 'Aug', disbursed: 189, utilized: 130 }, { month: 'Sep', disbursed: 239, utilized: 200 },
];
const mockFundDataByState = [
  { state: 'Uttar Pradesh', disbursed: 750, utilized: 650 }, { state: 'Rajasthan', disbursed: 420, utilized: 210 }, { state: 'Bihar', disbursed: 510, utilized: 480 }, { state: 'Karnataka', disbursed: 350, utilized: 320 }, { state: 'Tamil Nadu', disbursed: 280, utilized: 275 }, { state: 'Madhya Pradesh', disbursed: 450, utilized: 250 },
];

export default function AdminFunds() {
  const totalDisbursed = 4520;
  const totalUtilized = 3185;
  const utilizationRate = Math.round((totalUtilized / totalDisbursed) * 100);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Fund Management</h1>
        <p className="text-muted-foreground">
          Track fund disbursement and utilization across all States and UTs.
        </p>
      </div>

      {/* High-Level Stats Grid - UPDATED FOR MOBILE */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* ... Stat Cards remain the same ... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget (FY 2025-26)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ 10,000 Cr</div><p className="text-xs text-muted-foreground">Approved by MoSJE</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ {totalDisbursed.toLocaleString()} Cr</div><p className="text-xs text-muted-foreground">To all States/UTs</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilized</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ {totalUtilized.toLocaleString()} Cr</div><p className="text-xs text-muted-foreground">Reported by states</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Utilization Rate</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">%</div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{utilizationRate}%</div><Progress value={utilizationRate} className="mt-2" /></CardContent>
        </Card>
      </div>

      {/* Main Content: Chart and Table */}
      <div className="space-y-8">
        {/* Chart Section */}
        <Card>
          <CardHeader><CardTitle>Monthly Fund Flow (in Cr)</CardTitle><CardDescription>Comparison of funds disbursed vs. utilized over the last 6 months.</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockMonthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="disbursed" stroke="#3b82f6" strokeWidth={2} name="Disbursed" /><Line type="monotone" dataKey="utilized" stroke="#22c55e" strokeWidth={2} name="Utilized" /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* State-wise Table Section - UPDATED FOR MOBILE */}
        <Card>
          <CardHeader><CardTitle>State-wise Fund Distribution</CardTitle><CardDescription>Detailed breakdown of fund status for each State/UT.</CardDescription></CardHeader>
          <CardContent>
            <Table className="responsive-table"> {/* <-- Added a class for our CSS to target */}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">State/UT</TableHead>
                  <TableHead>Disbursed (Cr)</TableHead>
                  <TableHead>Utilized (Cr)</TableHead>
                  <TableHead className="w-[200px]">Utilization Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFundDataByState.map((stateData) => {
                  const rate = Math.round((stateData.utilized / stateData.disbursed) * 100);
                  return (
                    <TableRow key={stateData.state}>
                      <TableCell data-label="State/UT" className="font-medium">{stateData.state}</TableCell>
                      <TableCell data-label="Disbursed (Cr)">₹ {stateData.disbursed.toLocaleString()}</TableCell>
                      <TableCell data-label="Utilized (Cr)">₹ {stateData.utilized.toLocaleString()}</TableCell>
                      <TableCell data-label="Utilization Rate">
                        <div className="flex items-center justify-end md:justify-start gap-2">
                          <Progress value={rate} className="w-[60%]" /><span>{rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-label="Actions" className="text-right">
                        <Button variant="outline" size="sm">View Details</Button>
                      </TableCell>
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