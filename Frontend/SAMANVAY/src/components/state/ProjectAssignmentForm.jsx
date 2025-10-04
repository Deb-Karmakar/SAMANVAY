import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// API Functions
const fetchStateAgencies = async () => {
    const { data } = await axiosInstance.get('/agencies/mystate');
    return data;
};
const assignProject = async (payload) => {
    const { data } = await axiosInstance.put(`/projects/${payload.projectId}/assign`, payload);
    return data;
};

export default function ProjectAssignmentForm({ project, open, onOpenChange }) {
  // --- THIS IS THE CRUCIAL FIX ---
  // This "guard" checks if the 'project' prop has been loaded.
  // If not, it displays a loading spinner inside the dialog and stops execution,
  // preventing the crash when the code below tries to access 'project.budget'.
  if (!project) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  // --- END OF FIX ---

  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [agencyAllocations, setAgencyAllocations] = useState({});
  const [milestoneAssignments, setMilestoneAssignments] = useState({});
  const [newMilestoneText, setNewMilestoneText] = useState({});
  const [openPopover, setOpenPopover] = useState(false);

  const queryClient = useQueryClient();
  const { data: agencies, isLoading: isLoadingAgencies } = useQuery({ queryKey: ['myStateAgencies'], queryFn: fetchStateAgencies, enabled: open });
  
  const mutation = useMutation({
    mutationFn: assignProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStateProjects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      onOpenChange(false);
      alert("Project assigned successfully!");
    },
    onError: (error) => alert(`Assignment failed: ${error.response?.data?.message || error.message}`),
  });

  const handleAllocationChange = (agencyId, value) => {
    const amount = Number(value);
    setAgencyAllocations(prev => ({ ...prev, [agencyId]: (isNaN(amount) || amount < 0) ? 0 : amount }));
  };

  const totalAllocated = useMemo(() => Object.values(agencyAllocations).reduce((sum, amount) => sum + (amount || 0), 0), [agencyAllocations]);
  const remainingBudget = project.budget - totalAllocated;

  const handleAddMilestone = (agencyId) => {
    const text = newMilestoneText[agencyId] || '';
    if (text.trim()) {
      const currentMilestones = milestoneAssignments[agencyId] || [];
      setMilestoneAssignments({ ...milestoneAssignments, [agencyId]: [...currentMilestones, { text: text.trim() }] });
      setNewMilestoneText({ ...newMilestoneText, [agencyId]: '' });
    }
  };

  const handleRemoveMilestone = (agencyId, indexToRemove) => {
    const currentMilestones = milestoneAssignments[agencyId] || [];
    setMilestoneAssignments({ ...milestoneAssignments, [agencyId]: currentMilestones.filter((_, index) => index !== indexToRemove) });
  };
  
  const handleAssign = () => {
    if (selectedAgencies.length === 0) { alert("Please select at least one agency."); return; }
    if (totalAllocated > project.budget) { alert("Total allocated funds cannot exceed the project budget."); return; }

    const assignments = selectedAgencies.map(agency => ({
      agency: agency._id,
      allocatedFunds: agencyAllocations[agency._id] || 0,
      checklist: milestoneAssignments[agency._id] || [],
    }));

    if (assignments.some(a => a.checklist.length === 0)) { alert("Please add at least one milestone for each selected agency."); return; }

    mutation.mutate({ projectId: project._id, assignments });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader><DialogTitle>Assign Project: {project.name}</DialogTitle><DialogDescription>Select agencies, then define their individual funds and milestones.</DialogDescription></DialogHeader>
        
        <div className="py-4">
            <Label>1. Select Executing Agencies</Label>
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPopover} className="w-full justify-between h-auto min-h-10 flex-wrap">
                  {selectedAgencies.length > 0 ? selectedAgencies.map(agency => <Badge key={agency._id} variant="secondary" className="m-0.5">{agency.name}</Badge>) : "Select agencies..."}
                </Button>
              </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search agency..." /><CommandList><CommandEmpty>No agencies found.</CommandEmpty>
                    <CommandGroup>
                      {agencies?.map(agency => (<CommandItem key={agency._id} onSelect={() => setSelectedAgencies(prev => prev.find(a => a._id === agency._id) ? prev.filter(a => a._id !== agency._id) : [...prev, agency])}>
                          <Check className={cn("mr-2 h-4 w-4", selectedAgencies.find(a => a._id === agency._id) ? "opacity-100" : "opacity-0")} />{agency.name}
                      </CommandItem>))}
                    </CommandGroup>
                </CommandList></Command></PopoverContent>
            </Popover>
        </div>

        {selectedAgencies.length > 0 && (
          <div className="flex-grow overflow-y-auto pr-4 -mr-4">
            <Tabs defaultValue={selectedAgencies[0]._id} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${selectedAgencies.length}, minmax(0, 1fr))`}}>
                {selectedAgencies.map(agency => (<TabsTrigger key={agency._id} value={agency._id}>{agency.name}</TabsTrigger>))}
              </TabsList>
              {selectedAgencies.map(agency => (
                <TabsContent key={agency._id} value={agency._id} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <Label className="font-semibold text-base">Allocate Funds (in Lakhs)</Label>
                        <Input 
                            type="number" 
                            min={0} 
                            placeholder="Enter amount..."
                            value={agencyAllocations[agency._id] || ''}
                            onChange={(e) => handleAllocationChange(agency._id, e.target.value)} 
                        />
                    </div>
                    <div className="space-y-4 rounded-lg border p-4">
                        <Label className="font-semibold text-base">Define Milestones</Label>
                        <div className="flex gap-2">
                            <Input value={newMilestoneText[agency._id] || ''} onChange={(e) => setNewMilestoneText({...newMilestoneText, [agency._id]: e.target.value})} placeholder="Add a new milestone..." />
                            <Button type="button" size="sm" onClick={() => handleAddMilestone(agency._id)}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {(milestoneAssignments[agency._id] || []).map((m, i) => (<div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"><span>{m.text}</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveMilestone(agency._id, i)}><X className="h-4 w-4" /></Button></div>))}
                        </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
        
        <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            <p className="text-sm text-center">Total Allocated: <span className={`font-bold ${totalAllocated > project.budget ? 'text-destructive' : ''}`}>₹{totalAllocated.toLocaleString()}</span> / {project.budget.toLocaleString()} Lakhs</p>
            <Button onClick={handleAssign} disabled={mutation.isLoading}>{mutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm & Assign Project"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}