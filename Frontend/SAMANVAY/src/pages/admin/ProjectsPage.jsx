import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query'; // 1. Import useQuery
import { axiosInstance } from '@/contexts/AuthContext'; // 1. Import axiosInstance
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Timer, MoreHorizontal, Search, Loader2 } from "lucide-react";
import CreateProjectDialog from '@/components/admin/CreateProjectDialog';

// --- API function to fetch projects ---
const fetchProjects = async () => {
    const { data } = await axiosInstance.get('/projects');
    return data;
};

const statusVariant = {
  'On Track': 'success',
  'Delayed': 'destructive',
  'Completed': 'default',
  'Pending Approval': 'secondary',
};

export default function AdminProjects() {
  // 2. Remove mockProjects and use useQuery to fetch live data
  const { data: projects, isLoading, isError, error } = useQuery({
      queryKey: ['projects'], 
      queryFn: fetchProjects
  });

  const [filters, setFilters] = useState({ search: '', status: 'all', component: 'all', state: 'all' });

  const filteredProjects = useMemo(() => {
    if (!projects) return []; // If data isn't loaded yet, return an empty array
    return projects.filter(p =>
      (p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.agency?.name.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.status === 'all' || p.status === filters.status) &&
      (filters.component === 'all' || p.component === filters.component) &&
      (filters.state === 'all' || p.state === filters.state)
    );
  }, [projects, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Tracker</h1>
        <p className="text-muted-foreground">
          Monitor the lifecycle and progress of all projects across the nation.
        </p>
      </div>

      {/* Controls and Actions Bar (Unchanged) */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto flex-grow"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by project or agency..." className="pl-8 w-full" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} /></div>
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}><SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="On Track">On Track</SelectItem><SelectItem value="Delayed">Delayed</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Pending Approval">Pending Approval</SelectItem></SelectContent></Select>
            <Select value={filters.component} onValueChange={(value) => setFilters({...filters, component: value})}><SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="All Components" /></SelectTrigger><SelectContent><SelectItem value="all">All Components</SelectItem><SelectItem value="Adarsh Gram">Adarsh Gram</SelectItem><SelectItem value="GIA">GIA</SelectItem><SelectItem value="Hostel">Hostel</SelectItem></SelectContent></Select>
            <CreateProjectDialog />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {/* 3. Handle loading and error states */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-4">Loading Projects...</span></div>
          ) : isError ? (
            <div className="text-center text-destructive py-8">Error: {error.message}</div>
          ) : (
            <Table className="responsive-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>State/UT</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project._id}> {/* Use _id from MongoDB */}
                    <TableCell data-label="Project Name" className="font-medium">{project.name}<p className="text-xs text-muted-foreground">{project._id}</p></TableCell>
                    <TableCell data-label="State/UT">{project.state}</TableCell>
                    {/* Use optional chaining because agency might not be populated */}
                    <TableCell data-label="Agency">{project.agency?.name || 'N/A'}</TableCell>
                    <TableCell data-label="Status"><Badge variant={statusVariant[project.status]}>{project.status}</Badge></TableCell>
                    <TableCell data-label="Progress">
                      <div className="flex items-center justify-end md:justify-start gap-2">
                        <Progress value={project.progress} className="w-[60%]" />
                        <span>{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell data-label="Actions" className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Full Timeline</DropdownMenuItem>
                          <DropdownMenuItem>View Fund Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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