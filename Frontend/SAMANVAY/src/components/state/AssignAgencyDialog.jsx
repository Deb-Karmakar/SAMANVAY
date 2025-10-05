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

const assignAgencyToProject = async ({ projectId, assignments }) => {
    const { data } = await axiosInstance.post(`/projects/${projectId}/assignments`, { assignments });
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

export default function AssignAgencyDialog({ project, open, onOpenChange }) {
  const [selectedAgency, setSelectedAgency] = useState('');
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
    onSuccess: (data) => {
      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['myStateProjects'] });
      
      // Auto-download PDF if available
      if (data.pdf) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/', '') || 'http://localhost:8000';
        downloadPDF(`${baseUrl}${data.pdf.url}`, data.pdf.filename);
      }
      
      // Reset form state
      setSelectedAgency('');
      setMilestones([]);
      setNewMilestone('');
      
      onOpenChange(false);
      
      // Show success message
      alert(
        `Agency assigned successfully!\n\n` +
        `✓ Assignment order has been downloaded\n` +
        `✓ Email notifications sent to all assigned agencies\n\n` +
        `Agencies can now log in to view their milestones and begin work.`
      );
    },
    onError: (error) => {
      alert(`Failed to assign agency: ${error.response?.data?.message || error.message}`);
    },
  });

  // Functions to manage the milestones list
  const handleAddMilestone = () => {
    if (newMilestone.trim() !== '') {
      setMilestones([...milestones, { text: newMilestone.trim() }]);
      setNewMilestone('');
    }
  };
  
  const handleRemoveMilestone = (indexToRemove) => {
    setMilestones(milestones.filter((_, index) => index !== indexToRemove));
  };

  const handleAssign = () => {
    if (!selectedAgency) {
      alert("Please select an agency.");
      return;
    }
    
    if (milestones.length === 0) {
      alert("Please add at least one milestone.");
      return;
    }
    
    const assignments = [{
      agency: selectedAgency,
      allocatedFunds: 0,
      checklist: milestones
    }];
    
    mutation.mutate({ projectId: project._id, assignments });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Project: {project.name}</DialogTitle>
          <DialogDescription>
            Select an agency and define the key milestones for this project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-6 -mr-6">
          <div className="space-y-2">
            <Label>1. Select Executing Agency</Label>
            <Select onValueChange={setSelectedAgency} disabled={isLoading} value={selectedAgency}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading agencies..." : "Select an agency..."} />
              </SelectTrigger>
              <SelectContent>
                {agencies?.map(agency => (
                  <SelectItem key={agency._id} value={agency._id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>2. Define Project Milestones (Checklist)</Label>
            <div className="flex gap-2">
              <Input 
                value={newMilestone} 
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                placeholder="e.g., Site Clearance and Levelling" 
              />
              <Button type="button" onClick={handleAddMilestone}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            
            <div className="mt-4 space-y-2">
              {milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No milestones added yet. Add milestones to define project phases.
                </p>
              ) : (
                milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span>{milestone.text}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleRemoveMilestone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleAssign} 
          disabled={mutation.isLoading || !selectedAgency || milestones.length === 0} 
          className="mt-4"
        >
          {mutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Assigning...
            </>
          ) : (
            "Confirm Assignment"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}