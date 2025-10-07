import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, PenSquare, Loader2, AlertTriangle } from "lucide-react";

// --- API Function to Fetch Agencies ---
const fetchStateAgencies = async () => {
    const { data } = await axiosInstance.get('/agencies/mystate');
    return data;
};

// --- Status Badge Variants ---
const statusVariant = {
  'Active': 'success',
  'Onboarding': 'secondary',
  'Inactive': 'outline',
};

export default function StateAgencies() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ search: '', district: 'all', status: 'all' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // --- Fetching data using React Query ---
    const { data: agencies, isLoading, isError, error } = useQuery({
        queryKey: ['stateAgencies'],
        queryFn: fetchStateAgencies,
    });

    // --- Memoized filtering logic ---
    const filteredAgencies = useMemo(() => {
        if (!agencies) return [];
        return agencies.filter(agency =>
            (agency.name.toLowerCase().includes(filters.search.toLowerCase()) || 
             (agency.contactPerson && agency.contactPerson.toLowerCase().includes(filters.search.toLowerCase()))) &&
            (filters.district === 'all' || agency.district === filters.district) &&
            (filters.status === 'all' || agency.status === filters.status)
        );
    }, [agencies, filters]);

    // --- Dynamically get unique districts from data ---
    const districts = useMemo(() => {
        if (!agencies) return [];
        const uniqueDistricts = [...new Set(agencies.map(a => a.district))];
        return uniqueDistricts.sort();
    }, [agencies]);

    // --- Loading State ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // --- Error State ---
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">Failed to load agencies</h3>
                <p>{error?.response?.data?.message || error.message}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* 1. Header Section */}
            <div>
                <h1 className="text-3xl font-bold">Executing Agencies</h1>
                <p className="text-muted-foreground">
                    Manage and view all executing agencies within your state.
                </p>
            </div>

            {/* 2. Controls and Actions Bar */}
            <Card>
                <CardContent className="pt-6 flex flex-wrap items-center gap-4">
                    <div className="relative flex-grow min-w-[200px]">
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
                            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Onboarding">Onboarding</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
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
                            {filteredAgencies.length > 0 ? (
                                filteredAgencies.map((agency) => (
                                    <TableRow key={agency._id}>
                                        <TableCell data-label="Agency Name" className="font-medium">{agency.name}</TableCell>
                                        <TableCell data-label="District">{agency.district}</TableCell>
                                        <TableCell data-label="Status">
                                            <Badge variant={statusVariant[agency.status] || 'default'}>{agency.status}</Badge>
                                        </TableCell>
                                        <TableCell data-label="Contact Person">{agency.contactPerson || 'N/A'}</TableCell>
                                        <TableCell data-label="Active Projects">{agency.projectsCount || 0}</TableCell>
                                        <TableCell data-label="Actions" className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit Agency</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No agencies found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}