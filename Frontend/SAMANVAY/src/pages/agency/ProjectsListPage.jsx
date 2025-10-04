import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ChevronRight, Search } from "lucide-react";

const mockAgencyProjects = [
  { id: 'PROJ001', name: 'Jaipur Adarsh Gram Dev.', status: 'On Track', progress: 40 },
  { id: 'PROJ004', name: 'Ajmer Hostel Upgrade', status: 'On Track', progress: 85 },
  { id: 'PROJ008', name: 'Alwar Road Widening', status: 'Delayed', progress: 40 },
];
const statusVariant = { 'On Track': 'success', 'Delayed': 'destructive' };

export default function AgencyProjectsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredProjects = mockAgencyProjects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Projects</h1>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {filteredProjects.map(project => (
            <div 
              key={project.id} 
              className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/agency/projects/${project.id}`)}
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}