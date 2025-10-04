import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";

// --- API Functions ---
const fetchStateAgencies = async () => {
    const { data } = await axiosInstance.get('/agencies/mystate');
    return data;
};

// 1. Update the API function to accept the checklist
const assignAgencyToProject = async ({ projectId, agencyId, checklist }) => {
    const { data } = await axiosInstance.put(`/projects/${projectId}/assign`, { agencyId, checklist });
    return data;
};

export default function AssignAgencyDialog({ project, open, onOpenChange }) {
  const [selectedAgency, setSelectedAgency] = useState('');
  // 2. Add state for the checklist and the input field
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState('');
  const queryClient = useQueryClient();

  const { data: agencies, isLoading } = useQuery({
    queryKey: ['myStateAgencies'],
    queryFn: fetchStateAgencies,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: assignAgencyToProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStateProjects'] });
      onOpenChange(false);
      alert("Agency and milestones assigned successfully!");
    },
    onError: (error) => {
      alert(`Failed to assign agency: ${error.response?.data?.message || error.message}`);
    },
  });

  // 3. Functions to manage the milestones list
  const handleAddMilestone = () => {
    if (newMilestone.trim() !== '') {
      // Add milestones as objects to match the backend schema
      setMilestones([...milestones, { text: newMilestone.trim() }]);
      setNewMilestone(''); // Clear the input field
    }
  };
  
  const handleRemoveMilestone = (indexToRemove) => {
    setMilestones(milestones.filter((_, index) => index !== indexToRemove));
  };

  // 4. Update the final submission handler
  const handleAssign = () => {
    if (!selectedAgency || milestones.length === 0) {
      alert("Please select an agency and add at least one milestone.");
      return;
    }
    // Include the milestones in the mutation
    mutation.mutate({ projectId: project._id, agencyId: selectedAgency, checklist: milestones });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Project: {project.name}</DialogTitle>
          <DialogDescription>Select an agency and define the key milestones for this project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-6 -mr-6">
          <div className="space-y-2">
            <Label>1. Select Executing Agency</Label>
            <Select onValueChange={setSelectedAgency} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading agencies..." : "Select an agency..."} />
              </SelectTrigger>
              <SelectContent>{agencies?.map(agency => (<SelectItem key={agency._id} value={agency._id}>{agency.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          
          {/* 5. Add the new UI for the milestone editor */}
          <div className="space-y-2">
            <Label>2. Define Project Milestones (Checklist)</Label>
            <div className="flex gap-2">
              <Input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} placeholder="e.g., Site Clearance and Levelling" />
              <Button type="button" onClick={handleAddMilestone}><Plus className="mr-2 h-4 w-4" /> Add</Button>
            </div>
            <div className="mt-4 space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                  <span>{milestone.text}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveMilestone(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={handleAssign} disabled={mutation.isLoading} className="mt-4">
          {mutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Assignment"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}