// Frontend/src/pages/agency/DashboardPage.jsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance, useAuth } from "@/contexts/AuthContext";

const fetchMyAgencyProjects = async () => {
    const { data } = await axiosInstance.get('/projects/myagency');
    return data;
};

const statusVariant = { 
    'On Track': 'default', 
    'Delayed': 'destructive',
    'Completed': 'secondary',
    'Pending Approval': 'outline'
};

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['myAgencyProjects'],
    queryFn: fetchMyAgencyProjects,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load projects: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const delayedProjects = projects?.filter(p => p.status === 'Delayed') || [];
  const agencyName = userInfo?.agencyName || "Agency";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {agencyName}</h1>
        <p className="text-muted-foreground">Here is your summary for today.</p>
      </div>

      {delayedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Urgent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {delayedProjects.map((project, index) => (
              <div key={project._id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-1 text-destructive" />
                    <p className="text-sm font-medium">
                      Project "{project.name}" is delayed. Please update progress.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate(`/agency/projects/${project._id}`)}
                  >
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                {index < delayedProjects.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Assigned Projects</CardTitle>
          <CardDescription>Select a project to view its checklist and update progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects && projects.length > 0 ? (
            projects.map(project => (
              <div 
                key={project._id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/agency/projects/${project._id}`)}
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
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No projects assigned yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 text-center">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{projects?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{delayedProjects.length}</p>
            <p className="text-xs text-muted-foreground">Projects Delayed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}