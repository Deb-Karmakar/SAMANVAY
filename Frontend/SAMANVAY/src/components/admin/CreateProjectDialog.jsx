import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // 1. Import React Query hooks
import { axiosInstance } from "@/contexts/AuthContext"; // 1. Import axios instance
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, IndianRupee, Loader2 } from "lucide-react";

// --- API Functions ---
const fetchAgencies = async () => {
    const { data } = await axiosInstance.get('/agencies');
    return data;
};

const createProject = async (newProject) => {
    const { data } = await axiosInstance.post('/projects', newProject);
    return data;
};

// --- Full list of states for the dropdown ---
const states =   ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"]


export default function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // 2. Fetch the list of agencies for the dropdown
  const { data: agencies, isLoading: isLoadingAgencies } = useQuery({
      queryKey: ['agencies'],
      queryFn: fetchAgencies,
      enabled: open, // Only fetch when the dialog is open
  });

  // 3. Set up the mutation for creating a project
  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // When successful, invalidate the 'projects' query to refresh the list on the main page
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      alert("Project created successfully!");
    },
    onError: (error) => {
      alert(`Failed to create project: ${error.response?.data?.message || error.message}`);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProjectData = Object.fromEntries(formData.entries());
    
    // 4. Call the mutation with the new project data
    mutation.mutate(newProjectData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Create Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Fill in the details below to register a new project in the system.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
          <form id="create-project-form" className="space-y-4" onSubmit={handleSubmit}>
            {/* --- Form fields are now populated with live data where applicable --- */}
            <div className="space-y-2"><Label htmlFor="name">Project Name</Label><Input id="name" name="name" placeholder="e.g., Adarsh Gram Development Phase II" required /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="state">State/UT</Label><Select name="state" required><SelectTrigger><SelectValue placeholder="Select a state..." /></SelectTrigger><SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="component">Component</Label><Select name="component" required><SelectTrigger><SelectValue placeholder="Select a component..." /></SelectTrigger><SelectContent><SelectItem value="Adarsh Gram">Adarsh Gram</SelectItem><SelectItem value="GIA">GIA</SelectItem><SelectItem value="Hostel">Hostel</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="budget">Total Budget (in Lakhs)</Label><div className="relative"><IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input id="budget" name="budget" type="number" placeholder="500" className="pl-8" required /></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" name="startDate" type="date" required /></div>
              <div className="space-y-2"><Label htmlFor="endDate">End Date</Label><Input id="endDate" name="endDate" type="date" required /></div>
            </div>
          </form>
        </div>
        <DialogFooter className="mt-auto pt-4">
          <Button type="submit" form="create-project-form" disabled={mutation.isLoading}>
            {mutation.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}