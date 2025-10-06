// src/pages/agency/FundsPage.jsx (Final Version)

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, IndianRupee, Upload, FileText, Loader2 } from "lucide-react";

// API function to fetch agency's projects
const fetchAgencyProjects = async () => {
    const { data } = await axiosInstance.get('/projects/myagency');
    return data;
};

// API function to submit the report
const submitReport = async (formData) => {
    const { data } = await axiosInstance.post('/utilization/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob', // Expect a PDF receipt back
    });
    return data;
};

export default function AgencyFundsPage() {
    const queryClient = useQueryClient();
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Fetch projects for the dropdown
    const { data: projects, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['agencyProjects'],
        queryFn: fetchAgencyProjects,
    });
    
    // Mutation for form submission
    const mutation = useMutation({
        mutationFn: submitReport,
        onSuccess: (data) => {
            // Trigger download of the PDF receipt
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Submission-Receipt.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            alert("Utilization report submitted successfully! Your receipt is downloading.");
            // Optionally refetch transaction history or other data
            // queryClient.invalidateQueries(['fundHistory']);
        },
        onError: (error) => {
            alert(`Submission failed: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setSelectedFile(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (!selectedFile) {
            alert('Please upload a utilization certificate.');
            return;
        }
        formData.append('certificate', selectedFile);

        mutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold">Fund Utilization</h1><p className="text-muted-foreground">View funds received and submit utilization reports.</p></div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                {/* ... KPI Cards can be connected to a new API endpoint later ... */}
            </div>

            <Card>
                <CardHeader><CardTitle>Submit Utilization Report</CardTitle><CardDescription>Fill out the form to report expenditures for a project.</CardDescription></CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="project">Project</Label>
                                <Select name="projectId" required>
                                    <SelectTrigger id="project"><SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project..."} /></SelectTrigger>
                                    <SelectContent>
                                        {projects?.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount Utilized (in Lakhs)</Label>
                                <div className="relative"><IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input id="amount" name="amount" type="number" step="0.01" placeholder="80.5" className="pl-8" required /></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Upload Utilization Certificate (PDF)</Label>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="uc-file" className="flex-grow"><div className="cursor-pointer flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium border rounded-md border-input bg-background hover:bg-accent hover:text-accent-foreground"><Upload className="h-4 w-4 mr-2" /><span>{fileName || "Choose a PDF file..."}</span></div></Label>
                                <Input id="uc-file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" required />
                            </div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="comments">Comments</Label><Textarea id="comments" name="comments" placeholder="Add any relevant notes or details..." /></div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                {mutation.isPending ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Transaction History Table can be connected to a new API endpoint later */}
        </div>
    );
}