import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, MoreHorizontal, Search, PenSquare } from "lucide-react";
import AddAgencyDialog from '@/components/admin/AddAgencyDialog'; // Reusing the dialog component

// --- Mock Data for Executing Agencies within a State ---
const mockStateAgencies = [
  { id: 'AGY002', name: 'Rajasthan PWD', district: 'Jaipur', status: 'Active', contact: 'Ms. Priya Singh', projects: 8 },
  { id: 'AGY007', name: 'Jodhpur Municipal Corp', district: 'Jodhpur', status: 'Active', contact: 'Mr. Anil Mehta', projects: 5 },
  { id: 'AGY008', name: 'Udaipur Skill Dev', district: 'Udaipur', status: 'Active', contact: 'Ms. Sunita Devi', projects: 3 },
  { id: 'AGY009', name: 'Kota Rural Dept', district: 'Kota', status: 'Onboarding', contact: 'Mr. Rajesh Verma', projects: 0 },
  { id: 'AGY010', name: 'Bikaner Skill Group', district: 'Bikaner', status: 'Inactive', contact: 'Mr. Kamal Joshi', projects: 2 },
];

const statusVariant = {
  'Active': 'success',
  'Onboarding': 'secondary',
  'Inactive': 'outline',
};

export default function StateAgencies() {
  const [filters, setFilters] = useState({ search: '', district: 'all' });

  const filteredAgencies = useMemo(() => {
    return mockStateAgencies.filter(agency =>
      (agency.name.toLowerCase().includes(filters.search.toLowerCase()) || agency.contact.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.district === 'all' || agency.district === filters.district)
    );
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Executing Agencies</h1>
        <p className="text-muted-foreground">
          Manage and assign roles to all executing agencies in your state.
        </p>
      </div>

      {/* 2. Controls and Actions Bar */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by agency or contact..." 
              className="pl-8 w-full"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <Select value={filters.district} onValueChange={(value) => setFilters({...filters, district: value})}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Districts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              <SelectItem value="Jaipur">Jaipur</SelectItem>
              <SelectItem value="Jodhpur">Jodhpur</SelectItem>
              <SelectItem value="Udaipur">Udaipur</SelectItem>
              <SelectItem value="Kota">Kota</SelectItem>
            </SelectContent>
          </Select>
          <AddAgencyDialog />
        </CardContent>
      </Card>

      {/* 3. Agency Data Table */}
      <Card>
        <CardContent className="pt-6">
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <TableHead>Agency Name</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Active Projects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell data-label="Agency Name" className="font-medium">{agency.name}</TableCell>
                  <TableCell data-label="District">{agency.district}</TableCell>
                  <TableCell data-label="Status">
                    <Badge variant={statusVariant[agency.status]}>{agency.status}</Badge>
                  </TableCell>
                  <TableCell data-label="Contact Person">{agency.contact}</TableCell>
                  <TableCell data-label="Active Projects">{agency.projects}</TableCell>
                  <TableCell data-label="Actions" className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>
                            <PenSquare className="mr-2 h-4 w-4" />
                            Assign Role/Deadline
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Agency</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}