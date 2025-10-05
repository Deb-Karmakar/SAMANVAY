import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBudget } from "@/components/BudgetDisplay";

// --- API Functions ---
const fetchStateAgencies = async () => {
    const { data } = await axiosInstance.get('/agencies/mystate');
    return data;
};

const assignProject = async (payload) => {
    const { data } = await axiosInstance.put(`/projects/${payload.projectId}/assign`, payload);
    return data;
};

const addAssignments = async (payload) => {
    const { data } = await axiosInstance.post(`/projects/${payload.projectId}/assignments`, payload);
    return data;
};

// Utility to download PDF
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

export default function ProjectAssignmentForm({ project, open, onOpenChange }) {
  if (!project) { return null; }

  const isEditing = project.assignments && project.assignments.length > 0;

  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [agencyAllocations, setAgencyAllocations] = useState({});
  const [milestoneAssignments, setMilestoneAssignments] = useState({});
  const [newMilestoneText, setNewMilestoneText] = useState({});
  const [openPopover, setOpenPopover] = useState(false);

  const queryClient = useQueryClient();
  const { data: allAgencies, isLoading: isLoadingAgencies } = useQuery({ 
    queryKey: ['myStateAgencies'], 
    queryFn: fetchStateAgencies, 
    enabled: open 
  });
  
  const mutationFn = isEditing ? addAssignments : assignProject;
  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myStateProjects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      
      // Auto-download PDF if available
      if (data.pdf) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/', '') || 'http://localhost:8000';
        downloadPDF(`${baseUrl}${data.pdf.url}`, data.pdf.filename);
      }
      
      onOpenChange(false);
      
      alert(
        `Project ${isEditing ? 'updated' : 'assigned'} successfully!\n\n` +
        `✓ Assignment order has been downloaded\n` +
        `✓ Email notifications sent to all assigned agencies\n\n` +
        `Agencies can now log in to view their milestones and begin work.`
      );
    },
    onError: (error) => alert(`Failed: ${error.response?.data?.message || error.message}`),
  });
  
  const availableAgencies = useMemo(() => {
    if (!allAgencies) return [];
    const assignedAgencyIds = project.assignments?.map(a => a.agency._id) || [];
    return allAgencies.filter(agency => !assignedAgencyIds.includes(agency._id));
  }, [allAgencies, project]);

  const totalPreviouslyAllocated = useMemo(() => 
    project.assignments?.reduce((sum, a) => sum + (a.allocatedFunds || 0), 0) || 0, 
    [project]
  );
  
  const totalNewlyAllocated = useMemo(() => 
    Object.values(agencyAllocations).reduce((sum, amount) => sum + (amount || 0), 0), 
    [agencyAllocations]
  );
  
  const remainingBudget = project.budget - totalPreviouslyAllocated - totalNewlyAllocated;

  const handleAllocationChange = (agencyId, value) => {
    const amount = Number(value);
    setAgencyAllocations(prev => ({ 
      ...prev, 
      [agencyId]: (isNaN(amount) || amount < 0) ? 0 : amount 
    }));
  };
  
  const handleAddMilestone = (agencyId) => {
    const text = newMilestoneText[agencyId] || '';
    if (text.trim()) {
      const currentMilestones = milestoneAssignments[agencyId] || [];
      setMilestoneAssignments({ 
        ...milestoneAssignments, 
        [agencyId]: [...currentMilestones, { text: text.trim() }] 
      });
      setNewMilestoneText({ ...newMilestoneText, [agencyId]: '' });
    }
  };
  
  const handleRemoveMilestone = (agencyId, indexToRemove) => {
    const currentMilestones = milestoneAssignments[agencyId] || [];
    setMilestoneAssignments({ 
      ...milestoneAssignments, 
      [agencyId]: currentMilestones.filter((_, index) => index !== indexToRemove) 
    });
  };
  
  const handleAssign = () => {
    if (selectedAgencies.length === 0) { 
      alert("Please select at least one new agency."); 
      return; 
    }
    
    if (remainingBudget < 0) { 
      alert("Total allocated funds cannot exceed the project budget."); 
      return; 
    }

    // *** KEY FIX: Convert lakhs to actual amount before sending to backend ***
    const newAssignments = selectedAgencies.map(agency => ({
      agency: agency._id,
      allocatedFunds: (agencyAllocations[agency._id] || 0) * 100000, // Convert lakhs to actual amount
      checklist: milestoneAssignments[agency._id] || [],
    }));

    if (newAssignments.some(a => a.checklist.length === 0)) { 
      alert("Please add at least one milestone for each newly selected agency."); 
      return; 
    }

    mutation.mutate({ projectId: project._id, assignments: newAssignments });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Add Agencies to Project' : 'Assign Project'}: {project.name}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Select new agencies to add to this project.' 
              : 'Select agencies and define their funds and milestones.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {isEditing && project.assignments.length > 0 && (
          <div className="space-y-2 border-b pb-4">
            <Label className="font-semibold text-base">Previously Assigned Agencies</Label>
            <div className="flex flex-wrap gap-2">
              {project.assignments.map(a => (
                <Badge key={a.agency._id} variant="outline">
                  {a.agency.name} ({formatBudget(a.allocatedFunds)})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="py-4">
          <Label>Select New Executing Agencies</Label>
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                role="combobox" 
                aria-expanded={openPopover} 
                className="w-full justify-between h-auto min-h-10 flex-wrap"
              >
                {selectedAgencies.length > 0 
                  ? selectedAgencies.map(agency => (
                      <Badge key={agency._id} variant="secondary" className="m-0.5">
                        {agency.name}
                      </Badge>
                    ))
                  : "Select new agencies to add..."
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search available agencies..." />
                <CommandList>
                  <CommandEmpty>No available agencies found.</CommandEmpty>
                  <CommandGroup>
                    {availableAgencies.map(agency => (
                      <CommandItem 
                        key={agency._id} 
                        onSelect={() => setSelectedAgencies(prev => 
                          prev.find(a => a._id === agency._id) 
                            ? prev.filter(a => a._id !== agency._id) 
                            : [...prev, agency]
                        )}
                      >
                        <Check 
                          className={cn(
                            "mr-2 h-4 w-4", 
                            selectedAgencies.find(a => a._id === agency._id) 
                              ? "opacity-100" 
                              : "opacity-0"
                          )} 
                        />
                        {agency.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedAgencies.length > 0 && (
          <div className="flex-grow overflow-y-auto pr-4 -mr-4">
            <Tabs defaultValue={selectedAgencies[0]._id} className="w-full">
              <TabsList 
                className="grid w-full" 
                style={{ gridTemplateColumns: `repeat(${selectedAgencies.length}, minmax(0, 1fr))`}}
              >
                {selectedAgencies.map(agency => (
                  <TabsTrigger key={agency._id} value={agency._id}>
                    {agency.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {selectedAgencies.map(agency => (
                <TabsContent key={agency._id} value={agency._id} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 rounded-lg border p-4">
                      <Label className="font-semibold text-base">
                        Allocate Funds (in Lakhs)
                      </Label>
                      <Input 
                        type="number" 
                        min={0}
                        step="0.01"
                        placeholder="Enter amount in lakhs..."
                        value={agencyAllocations[agency._id] || ''}
                        onChange={(e) => handleAllocationChange(agency._id, e.target.value)} 
                      />
                      <p className="text-xs text-muted-foreground">
                        Amount will be: {formatBudget((agencyAllocations[agency._id] || 0) * 100000)}
                      </p>
                    </div>
                    <div className="space-y-4 rounded-lg border p-4">
                      <Label className="font-semibold text-base">Define Milestones</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={newMilestoneText[agency._id] || ''} 
                          onChange={(e) => setNewMilestoneText({
                            ...newMilestoneText, 
                            [agency._id]: e.target.value
                          })} 
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMilestone(agency._id);
                            }
                          }}
                          placeholder="Add a new milestone..." 
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={() => handleAddMilestone(agency._id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(milestoneAssignments[agency._id] || []).map((m, i) => (
                          <div 
                            key={i} 
                            className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                          >
                            <span>{i + 1}. {m.text}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleRemoveMilestone(agency._id, i)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
        
        <div className="mt-4 flex flex-col gap-2 border-t pt-4">
          <p className="text-sm text-center">
            Remaining Project Budget: 
            <span className={`font-bold ml-2 ${remainingBudget < 0 ? 'text-destructive' : ''}`}>
              {formatBudget(remainingBudget)}
            </span>
          </p>
          <Button 
            onClick={handleAssign} 
            disabled={mutation.isLoading || selectedAgencies.length === 0}
          >
            {mutation.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              "Confirm & Save Assignments"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}