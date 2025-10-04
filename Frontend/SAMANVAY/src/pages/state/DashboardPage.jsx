import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Check, X, Eye, Users, Wallet, AlertTriangle, Map } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from "react-router-dom";

// --- Mock Data ---
const projectStatusData = [
  { name: 'On Track', value: 42 },
  { name: 'Delayed', value: 8 },
  { name: 'Completed', value: 15 },
];
const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

const actionItems = [
    { type: 'Approval', text: "Report from 'Rajasthan PWD' for project #RAJ-HOS-04 is pending approval.", time: "2h ago" },
    { type: 'Alert', text: "Executing agency 'Hope Foundation' has not updated progress for 7 days.", time: "1d ago" },
    { type: 'Notice', text: "New communication received from MoSJE regarding fund deadlines.", time: "3d ago" },
];

export default function StateDashboard() {
  const navigate = useNavigate();
  // We'll hardcode the state name for this example
  const stateName = "Rajasthan";

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold">{stateName} Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of all projects and agencies within your state.
        </p>
      </div>

      {/* 2. High-Level Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">65</div><p className="text-xs text-muted-foreground">Active within {stateName}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Funds Received</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ 420 Cr</div><p className="text-xs text-muted-foreground">From Central Ministry</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Funds Distributed</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ 380 Cr</div><p className="text-xs text-muted-foreground">To executing agencies</p></CardContent>
        </Card>
        <Card className="border-amber-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-amber-600">Pending Actions</CardTitle><AlertTriangle className="h-4 w-4 text-amber-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{actionItems.length}</div><p className="text-xs text-muted-foreground">Require your review</p></CardContent>
        </Card>
      </div>

      {/* 3. Main Dashboard Content */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Action Required */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Action Required</CardTitle><CardDescription>Review these items to ensure projects stay on track.</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionItems.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-start gap-3">
                        {item.type === 'Alert' && <AlertTriangle className="h-5 w-5 mt-1 text-destructive" />}
                        <div>
                            <p className="text-sm font-medium">{item.text}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        {item.type === 'Approval' && <>
                            <Button size="sm" variant="outline"><Check className="h-4 w-4 mr-1"/> Approve</Button>
                            <Button size="sm" variant="destructive"><X className="h-4 w-4 mr-1"/> Reject</Button>
                        </>}
                        {item.type !== 'Approval' && <Button size="sm" variant="secondary"><Eye className="h-4 w-4 mr-1"/> View</Button>}
                    </div>
                  </div>
                  {index < actionItems.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Charts & Map Link */}
        <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Project Status</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={projectStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                                {projectStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-6 bg-slate-100 dark:bg-slate-800/50">
                <Map className="h-12 w-12 text-primary mb-4"/>
                <CardTitle className="mb-2">Project Hotspots</CardTitle>
                <CardDescription className="mb-4">Get a detailed geographical view of all projects within {stateName}.</CardDescription>
                <Button onClick={() => navigate('/state/map')}>View State Map</Button>
            </Card>
        </div>
      </div>
    </div>
  );
}