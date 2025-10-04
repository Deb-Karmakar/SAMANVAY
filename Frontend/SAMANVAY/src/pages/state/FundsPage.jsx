import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // <-- FIX: Added this line
import { Wallet, MoreHorizontal, IndianRupee, Send } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// --- Mock Data ---
const totalReceived = 420; // in Cr
const totalDistributed = 380; // in Cr
const stateBuffer = totalReceived - totalDistributed;

const distributionData = [
  { name: 'Distributed to Agencies', value: totalDistributed },
  { name: 'Unallocated (State Buffer)', value: stateBuffer },
];
const COLORS = ['#3b82f6', '#a5b4fc'];

const mockAgencyFundData = [
  { agency: 'Rajasthan PWD', distributed: 150, utilized: 120 },
  { agency: 'Jodhpur Municipal Corp', distributed: 80, utilized: 40 },
  { agency: 'Udaipur Skill Dev', distributed: 50, utilized: 50 },
  { agency: 'Kota Rural Dept', distributed: 100, utilized: 30 },
];

export default function StateFunds() {
  const totalUtilizedByAgencies = mockAgencyFundData.reduce((acc, agency) => acc + agency.utilized, 0);
  const overallUtilizationRate = Math.round((totalUtilizedByAgencies / totalDistributed) * 100);

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold">State Fund Distribution</h1>
        <p className="text-muted-foreground">
          Track funds received from the Centre and their distribution to executing agencies.
        </p>
      </div>

      {/* 2. High-Level Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Allocation Received</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ {totalReceived} Cr</div><p className="text-xs text-muted-foreground">From Central Ministry</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Distributed to Agencies</CardTitle><Send className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ {totalDistributed} Cr</div><p className="text-xs text-muted-foreground">To {mockAgencyFundData.length} agencies</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Unallocated (Buffer)</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ {stateBuffer} Cr</div><p className="text-xs text-muted-foreground">Held at state level</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Agency Utilization Rate</CardTitle><div className="h-4 w-4 text-muted-foreground">%</div></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overallUtilizationRate}%</div><Progress value={overallUtilizationRate} className="mt-2" /></CardContent>
        </Card>
      </div>

      {/* 3. Main Content: Chart and Table */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Fund Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {distributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agency-wise Fund Breakdown</CardTitle>
            <CardDescription>Track distribution and utilization for each executing agency.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="responsive-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Executing Agency</TableHead>
                  <TableHead>Distributed</TableHead>
                  <TableHead>Utilized</TableHead>
                  <TableHead className="w-[150px]">Utilization</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAgencyFundData.map((agency) => {
                  const rate = Math.round((agency.utilized / agency.distributed) * 100);
                  return (
                    <TableRow key={agency.agency}>
                      <TableCell data-label="Agency" className="font-medium">{agency.agency}</TableCell>
                      <TableCell data-label="Distributed">₹ {agency.distributed} Cr</TableCell>
                      <TableCell data-label="Utilized">₹ {agency.utilized} Cr</TableCell>
                      <TableCell data-label="Utilization">
                        <div className="flex items-center justify-end md:justify-start gap-2">
                          <Progress value={rate} className="w-[60%]" /><span>{rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-label="Actions" className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Transactions</DropdownMenuItem>
                            <DropdownMenuItem>Initiate New Transfer</DropdownMenuItem>
                            <DropdownMenuItem>Send Utilization Reminder</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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