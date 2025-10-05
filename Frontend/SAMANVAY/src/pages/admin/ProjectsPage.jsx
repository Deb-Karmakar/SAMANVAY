// Frontend/src/pages/admin/ProjectsPage.jsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Loader2, Eye } from "lucide-react";
import CreateProjectDialog from '@/components/admin/CreateProjectDialog';

const fetchProjects = async () => {
    const { data } = await axiosInstance.get('/projects');
    return data;
};

const statusVariant = {
  'On Track': 'default',
  'Delayed': 'destructive',
  'Completed': 'secondary',
  'Pending Approval': 'outline',
};

export default function AdminProjects() {
  const navigate = useNavigate();
  const { data: projects, isLoading, isError, error } = useQuery({
      queryKey: ['projects'], 
      queryFn: fetchProjects
  });

  const [filters, setFilters] = useState({ search: '', status: 'all', component: 'all', state: 'all' });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           p.state.toLowerCase().includes(filters.search.toLowerCase()) ||
                           p.assignments?.some(a => a.agency?.name?.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesStatus = filters.status === 'all' || p.status === filters.status;
      const matchesComponent = filters.component === 'all' || p.component === filters.component;
      const matchesState = filters.state === 'all' || p.state === filters.state;
      
      return matchesSearch && matchesStatus && matchesComponent && matchesState;
    });
  }, [projects, filters]);

  const getAgenciesDisplay = (assignments) => {
    if (!assignments || assignments.length === 0) return 'Not Assigned';
    if (assignments.length === 1) return assignments[0].agency?.name || 'Unknown';
    return `${assignments.length} Agencies`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Tracker</h1>
        <p className="text-muted-foreground">
          Monitor the lifecycle and progress of all projects across the nation.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by project, state, or agency..." 
                className="pl-8 w-full" 
                value={filters.search} 
                onChange={(e) => setFilters({...filters, search: e.target.value})} 
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="On Track">On Track</SelectItem>
                <SelectItem value="Delayed">Delayed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.component} onValueChange={(value) => setFilters({...filters, component: value})}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="All Components" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                <SelectItem value="Adarsh Gram">Adarsh Gram</SelectItem>
                <SelectItem value="GIA">GIA</SelectItem>
                <SelectItem value="Hostel">Hostel</SelectItem>
              </SelectContent>
            </Select>
            <CreateProjectDialog />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" /> 
              <span className="ml-4">Loading Projects...</span>
            </div>
          ) : isError ? (
            <div className="text-center text-destructive py-8">Error: {error.message}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No projects found.</div>
          ) : (
            <Table className="responsive-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>State/UT</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Agencies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow 
                    key={project._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/projects/${project._id}`)}
                  >
                    <TableCell data-label="Project Name" className="font-medium">
                      {project.name}
                      <p className="text-xs text-muted-foreground">{project.component}</p>
                    </TableCell>
                    <TableCell data-label="State/UT">{project.state}</TableCell>
                    <TableCell data-label="Component">
                      <Badge variant="outline">{project.component}</Badge>
                    </TableCell>
                    <TableCell data-label="Agencies">
                      {getAgenciesDisplay(project.assignments)}
                    </TableCell>
                    <TableCell data-label="Status">
                      <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                    </TableCell>
                    <TableCell data-label="Progress">
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="w-[60%]" />
                        <span className="text-sm font-semibold">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell data-label="Actions" className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/projects/${project._id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}