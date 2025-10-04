import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, IndianRupee, ChevronRight } from "lucide-react";

// --- Mock Data ---
const agencyName = "Rajasthan PWD";
const mockAlerts = [
  { type: 'Reminder', text: "Progress report for 'Jodhpur Hostel' is overdue by 3 days.", icon: AlertTriangle, color: 'text-destructive' },
  { type: 'Funds', text: "₹50L has been disbursed for 'Jaipur Adarsh Gram'.", icon: IndianRupee, color: 'text-green-600' },
];
const mockAgencyProjects = [
  { id: 'PROJ001', name: 'Jaipur Adarsh Gram Dev.', status: 'On Track', progress: 65 },
  { id: 'PROJ004', name: 'Ajmer Hostel Upgrade', status: 'On Track', progress: 85 },
  { id: 'PROJ008', name: 'Alwar Road Widening', status: 'Delayed', progress: 40 },
];
const statusVariant = { 'On Track': 'success', 'Delayed': 'destructive' };

export default function AgencyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl font-bold">Welcome, {agencyName}</h1>
        <p className="text-muted-foreground">Here is your summary for today.</p>
      </div>

      {/* 2. Urgent Alerts Card */}
      <Card>
        <CardHeader>
          <CardTitle>Urgent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAlerts.map((alert, index) => (
            <div key={index}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 mt-1 ${alert.color}`} />
                  <p className="text-sm font-medium">{alert.text}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigate('/agency/inbox')}>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              {index < mockAlerts.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. My Projects Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Projects</CardTitle>
          <CardDescription>Select a project to view its checklist and update progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAgencyProjects.map(project => (
            <div 
              key={project.id} 
              className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
              // In a real app, this would navigate to a detailed project page, e.g., /agency/projects/PROJ001
              onClick={() => alert(`Navigating to details for project ${project.id}`)}
            >
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{project.name}</p>
                  <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="w-full" />
                  <span className="text-xs font-semibold">{project.progress}%</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Quick Stats Section */}
       <div className="grid grid-cols-2 gap-4 text-center">
        <Card>
            <CardContent className="p-4">
                <p className="text-2xl font-bold">{mockAgencyProjects.length}</p>
                <p className="text-xs text-muted-foreground">Active Projects</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4">
                <p className="text-2xl font-bold text-destructive">{mockAgencyProjects.filter(p=>p.status === 'Delayed').length}</p>
                <p className="text-xs text-muted-foreground">Projects Delayed</p>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}