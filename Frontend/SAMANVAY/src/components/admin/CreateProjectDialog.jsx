// src/components/admin/CreateProjectDialog.jsx

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, IndianRupee, Loader2 } from "lucide-react";

// Import your districts data. The code below is written to handle either:
// - an object keyed by state: { "Karnataka": ["Bengaluru", ...], ... }
// - an array of { state: "Karnataka", district: "Bengaluru" }
// Update the import to whichever file you actually have.
import districtsData from '@/data/districts.js';

// --- API Functions ---
const fetchAgencies = async () => {
  const { data } = await axiosInstance.get('/agencies');
  return data;
};

const createProject = async (newProject) => {
  const { data } = await axiosInstance.post('/projects', newProject);
  return data;
};

// --- Utility function to download PDF ---
const downloadPDF = (url, filename) => {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    })
    .catch(error => console.error('Download failed:', error));
};

export default function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts] = useState([]);
  const queryClient = useQueryClient();

  // Build a unique, sorted list of states — supports both data formats.
  const allStates = useMemo(() => {
    if (!districtsData) return [];
    if (Array.isArray(districtsData)) {
      const states = districtsData.map(item => item.state);
      return [...new Set(states)].sort();
    }
    if (typeof districtsData === 'object') {
      return Object.keys(districtsData).sort();
    }
    return [];
  }, [districtsData]);

  // Fetch the list of agencies for the dropdown (enabled when dialog is open)
  const { data: agencies, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['agencies'],
    queryFn: fetchAgencies,
    enabled: open,
  });

  // When a state is selected, compute its districts (supports both data formats)
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);

    let districtsForState = [];
    if (Array.isArray(districtsData)) {
      districtsForState = districtsData
        .filter(item => item.state === stateName)
        .map(item => item.district);
    } else if (typeof districtsData === 'object') {
      districtsForState = districtsData[stateName] || [];
    }

    // Remove duplicates and sort
    const uniqueSorted = [...new Set(districtsForState)].sort();
    setDistricts(uniqueSorted);
  };

  // Mutation for creating the project
  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      // Refresh projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Auto-download approval PDF if present
      if (data.pdf) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/', '') || 'http://localhost:8000';
        downloadPDF(`${baseUrl}${data.pdf.url}`, data.pdf.filename);
      }

      setOpen(false);

      // Compose a helpful success message
      const projectName = data.project?.name || '';
      const stateName = data.project?.state || selectedState || 'the selected';
      alert(
        `${projectName ? `Project "${projectName}" created successfully!\n\n` : 'Project created successfully!\n\n'}` +
        `${data.pdf ? '✓ Approval letter has been downloaded\n' : ''}` +
        `✓ Email notification sent to ${stateName} State Officer\n\n` +
        `The State Officer will receive project details and can now assign executing agencies.`
      );
    },
    onError: (error) => {
      alert(`Failed to create project: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProjectData = Object.fromEntries(formData.entries());

    // Convert budget from lakhs to actual amount (multiply by 100000)
    if (newProjectData.budget) {
      newProjectData.budget = parseFloat(newProjectData.budget) * 100000;
    }

    mutation.mutate(newProjectData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to register a new project. Location will be set based on the selected district.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
          <form id="create-project-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Adarsh Gram Development Phase II"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State/UT</Label>
                <Select name="state" required onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allStates.map(stateName => (
                      <SelectItem key={stateName} value={stateName}>
                        {stateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select name="district" required disabled={!selectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedState ? "Select a state first" : "Select a district..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="component">Component</Label>
                <Select name="component" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a component..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adarsh Gram">Adarsh Gram</SelectItem>
                    <SelectItem value="GIA">GIA</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (in Lakhs)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    step="0.01"
                    placeholder="500"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="mt-auto pt-4">
          <Button type="submit" form="create-project-form" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}