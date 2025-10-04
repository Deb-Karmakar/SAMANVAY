import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query'; // 1. Import useQuery
import { axiosInstance } from '@/contexts/AuthContext'; // 1. Import axiosInstance
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Loader2 } from "lucide-react";
import AddAgencyDialog from '@/components/admin/AddAgencyDialog';

// --- API function to fetch agencies ---
const fetchAgencies = async () => {
    const { data } = await axiosInstance.get('/agencies');
    return data;
};

export default function AdminAgencies() {
  // 2. Remove mockAgencies and use useQuery to fetch live data
  const { data: agencies, isLoading, isError, error } = useQuery({
      queryKey: ['agencies'], 
      queryFn: fetchAgencies
  });

  const [filters, setFilters] = useState({ search: '', type: 'all', state: 'all' });

  const filteredAgencies = useMemo(() => {
    if (!agencies) return []; // If data is not loaded yet, return an empty array
    return agencies.filter(agency =>
      (agency.name.toLowerCase().includes(filters.search.toLowerCase())) && // Simplified search for example
      (filters.type === 'all' || agency.type === filters.type) &&
      (filters.state === 'all' || agency.state === filters.state)
    );
  }, [agencies, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agency Directory</h1>
        <p className="text-muted-foreground">Search, filter, and manage all registered agencies in the system.</p>
      </div>

      {/* Controls Bar remains the same */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto flex-grow"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by agency..." className="pl-8 w-full" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} /></div>
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Implementing">Implementing</SelectItem><SelectItem value="Executing">Executing</SelectItem></SelectContent></Select>
            <Select value={filters.state} onValueChange={(value) => setFilters({...filters, state: value})}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All States" /></SelectTrigger><SelectContent><SelectItem value="all">All States</SelectItem><SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem><SelectItem value="Rajasthan">Rajasthan</SelectItem><SelectItem value="Bihar">Bihar</SelectItem></SelectContent></Select>        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {/* 3. Handle loading and error states */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : isError ? (
            <div className="text-center text-destructive">Error: {error.message}</div>
          ) : (
            <Table className="responsive-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Agency Name</TableHead>
                  <TableHead>State/UT</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgencies.map((agency) => (
                  <TableRow key={agency._id}> {/* Use _id from MongoDB */}
                    <TableCell data-label="Agency Name" className="font-medium">{agency.name}</TableCell>
                    <TableCell data-label="State/UT">{agency.state}</TableCell>
                    <TableCell data-label="Type"><Badge variant={agency.type === 'Implementing' ? 'default' : 'secondary'}>{agency.type}</Badge></TableCell>
                    <TableCell data-label="Contact Person">{agency.contactPerson || 'N/A'}</TableCell>
                    <TableCell data-label="Status"><Badge variant={agency.status === 'Active' ? 'success' : 'outline'}>{agency.status}</Badge></TableCell>
                    <TableCell data-label="Actions" className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Agency</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
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