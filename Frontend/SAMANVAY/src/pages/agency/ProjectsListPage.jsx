// Frontend/src/pages/agency/ProjectsPage.jsx
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ChevronRight, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";

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

export default function AgencyProjectsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['myAgencyProjects'],
    queryFn: fetchMyAgencyProjects,
  });

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Projects</h1>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search projects..." 
          className="pl-8" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <div 
                key={project._id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/agency/projects/${project._id}`)}
              >
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{project.name}</p>
                    <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} />
                    <span className="text-xs font-semibold">{project.progress}%</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No projects found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}