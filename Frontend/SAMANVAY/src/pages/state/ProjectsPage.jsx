import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Timer, MoreHorizontal, Search, BellRing, ChevronRight, Loader2 } from "lucide-react";

// API function to fetch projects for the logged-in State Officer
const fetchMyStateProjects = async () => {
    const { data } = await axiosInstance.get('/projects/mystate');
    return data;
};

const statusVariant = {
  'On Track': 'success',
  'Delayed': 'destructive',
  'Completed': 'default',
  'Pending Approval': 'secondary',
};

export default function StateProjects() {
  const navigate = useNavigate();

  const { data: projects, isLoading, isError, error } = useQuery({
    queryKey: ['myStateProjects'],
    queryFn: fetchMyStateProjects,
  });

  const [filters, setFilters] = useState({ search: '', status: 'all' });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(searchLower);
        const agencyMatch = p.assignments?.some(a => a.agency.name.toLowerCase().includes(searchLower));
        const statusMatch = filters.status === 'all' || p.status === filters.status;
        
        return (nameMatch || agencyMatch) && statusMatch;
    });
  }, [projects, filters]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">State Project Tracker</h1>
        <p className="text-muted-foreground">Select a project to view its details and assign agencies.</p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto flex-grow"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by project or agency..." className="pl-8 w-full" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} /></div>
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Pending Approval">Pending Approval</SelectItem><SelectItem value="On Track">On Track</SelectItem><SelectItem value="Delayed">Delayed</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Executing Agency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const isAssigned = project.assignments && project.assignments.length > 0;
                
                return (
                  <TableRow 
                    key={project._id} 
                    className={`cursor-pointer ${!isAssigned ? 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100' : 'hover:bg-muted/50'}`}
                    onClick={() => navigate(`/state/projects/${project._id}`)}
                  >
                    <TableCell data-label="Project" className="font-medium">{project.name}<p className="text-xs text-muted-foreground">{project.district || ''}</p></TableCell>
                    <TableCell data-label="Agency">
                      {isAssigned ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{project.assignments[0].agency.name}</span>
                          {project.assignments.length > 1 && <Badge variant="secondary">+{project.assignments.length - 1}</Badge>}
                        </div>
                      ) : (
                        <Badge variant="outline">Unassigned</Badge>
                      )}
                    </TableCell>
                    <TableCell data-label="Status"><Badge variant={statusVariant[project.status]}>{project.status}</Badge></TableCell>
                    <TableCell data-label="Progress">
                      <div className="flex items-center justify-end md:justify-start gap-2">
                        <Progress value={project.progress} className="w-[60%]" /><span>{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell data-label="Actions" className="text-right">
                      {!isAssigned ? (
                        <span className="flex items-center justify-end text-xs text-muted-foreground">View & Assign <ChevronRight className="h-4 w-4 ml-1" /></span>
                      ) : (
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem><BellRing className="mr-2 h-4 w-4" /> Send Reminder</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Escalate Issue</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </TableCell>
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