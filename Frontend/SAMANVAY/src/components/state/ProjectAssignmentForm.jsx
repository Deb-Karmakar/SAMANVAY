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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, X, Check, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBudget } from "@/components/BudgetDisplay";
import AgencyRecommendation from "@/components/agency/AgencyRecommendation";

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

  const [showAIRecommendations, setShowAIRecommendations] = useState(!isEditing);
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [agencyAllocations, setAgencyAllocations] = useState({});
  const [milestoneAssignments, setMilestoneAssignments] = useState({});
  const [newMilestoneText, setNewMilestoneText] = useState({});
  const [openPopover, setOpenPopover] = useState(false);
  const [activeTab, setActiveTab] = useState(""); // Track active tab

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

  // ✅ FIX 1: Prevent double selection with event stopping and single alert
  const handleSelectFromAI = (aiRecommendation, event) => {
    // Stop event propagation to prevent double firing
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Find the full agency object from available agencies
    const agency = availableAgencies.find(a => a.name === aiRecommendation.agencyName);
    
    if (agency && !selectedAgencies.find(a => a._id === agency._id)) {
      setSelectedAgencies(prev => [...prev, agency]);
      setActiveTab(agency._id); // Set as active tab
      setShowAIRecommendations(false);
      
      // Single alert with timeout to prevent double firing
      setTimeout(() => {
        alert(
          `✓ ${agency.name} selected based on AI recommendation!\n\n` +
          `Confidence: ${aiRecommendation.confidenceScore}%\n\n` +
          `Next: Define funds and milestones for this agency.`
        );
      }, 100);
    }
  };

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

    // Convert lakhs to actual amount before sending to backend
    const newAssignments = selectedAgencies.map(agency => ({
      agency: agency._id,
      allocatedFunds: (agencyAllocations[agency._id] || 0) * 100000,
      checklist: milestoneAssignments[agency._id] || [],
    }));

    if (newAssignments.some(a => a.checklist.length === 0)) { 
      alert("Please add at least one milestone for each newly selected agency."); 
      return; 
    }

    mutation.mutate({ projectId: project._id, assignments: newAssignments });
  };

  // Auto-set first agency as active tab when agencies are selected
  useMemo(() => {
    if (selectedAgencies.length > 0 && !activeTab) {
      setActiveTab(selectedAgencies[0]._id);
    }
  }, [selectedAgencies, activeTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">
            {isEditing ? 'Add Agencies to Project' : 'Assign Project'}: {project.name}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            {isEditing 
              ? 'Select new agencies to add to this project.' 
              : 'Get AI-powered recommendations or manually select agencies.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Previously Assigned Agencies */}
        {isEditing && project.assignments.length > 0 && (
          <div className="space-y-2 border-b pb-4">
            <Label className="font-semibold text-sm md:text-base">Previously Assigned Agencies</Label>
            <div className="flex flex-wrap gap-2">
              {project.assignments.map(a => (
                <Badge key={a.agency._id} variant="outline" className="text-xs">
                  {a.agency.name} ({formatBudget(a.allocatedFunds)})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex-grow overflow-y-auto pr-2">
          {/* AI Recommendations Section */}
          {showAIRecommendations ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  AI-Powered Agency Recommendations
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAIRecommendations(false)}
                  className="text-xs md:text-sm"
                >
                  Skip to Manual Selection <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                </Button>
              </div>

              <AgencyRecommendation
                projectData={{
                  name: project.name,
                  component: project.component,
                  district: project.district,
                  budget: project.budget,
                  description: project.description,
                  state: project.state,
                }}
                onSelectAgency={handleSelectFromAI}
              />

              <Separator className="my-4" />

              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => setShowAIRecommendations(false)}
                  className="text-xs md:text-sm"
                >
                  Or Select Agencies Manually
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Show AI button if hidden */}
              {!isEditing && selectedAgencies.length === 0 && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIRecommendations(true)}
                    className="w-full border-blue-200 hover:bg-blue-50 text-xs md:text-sm"
                  >
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2 text-blue-600" />
                    Show AI Recommendations
                  </Button>
                </div>
              )}

              {/* Manual Agency Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs md:text-sm">Select New Executing Agencies</Label>
                  <Popover open={openPopover} onOpenChange={setOpenPopover}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        aria-expanded={openPopover} 
                        className="w-full justify-between h-auto min-h-10 flex-wrap mt-2 text-xs md:text-sm"
                      >
                        {selectedAgencies.length > 0 
                          ? selectedAgencies.map(agency => (
                              <Badge key={agency._id} variant="secondary" className="m-0.5 text-xs">
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
                                onSelect={() => {
                                  const isSelected = selectedAgencies.find(a => a._id === agency._id);
                                  if (isSelected) {
                                    setSelectedAgencies(prev => prev.filter(a => a._id !== agency._id));
                                  } else {
                                    setSelectedAgencies(prev => [...prev, agency]);
                                    setActiveTab(agency._id); // Set as active
                                  }
                                }}
                              >
                                <Check 
                                  className={cn(
                                    "mr-2 h-4 w-4", 
                                    selectedAgencies.find(a => a._id === agency._id) 
                                      ? "opacity-100" 
                                      : "opacity-0"
                                  )} 
                                />
                                <span className="text-xs md:text-sm">{agency.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* ✅ FIX 2: Better responsive tabs layout */}
                {selectedAgencies.length > 0 && (
                  <div className="mt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      {/* Scrollable tabs on mobile */}
                      <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="inline-flex w-full md:grid h-auto" 
                          style={{ 
                            gridTemplateColumns: selectedAgencies.length <= 3 
                              ? `repeat(${selectedAgencies.length}, minmax(0, 1fr))` 
                              : 'repeat(auto-fit, minmax(120px, 1fr))'
                          }}
                        >
                          {selectedAgencies.map(agency => (
                            <TabsTrigger 
                              key={agency._id} 
                              value={agency._id}
                              className="text-xs md:text-sm px-2 py-2 whitespace-normal min-w-[100px] md:min-w-[120px]"
                            >
                              <span className="truncate max-w-[150px] block">
                                {agency.name}
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </ScrollArea>

                      {selectedAgencies.map(agency => (
                        <TabsContent key={agency._id} value={agency._id} className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Fund Allocation */}
                            <div className="space-y-4 rounded-lg border p-3 md:p-4">
                              <Label className="font-semibold text-sm md:text-base">
                                Allocate Funds (in Lakhs)
                              </Label>
                              <Input 
                                type="number" 
                                min={0}
                                step="0.01"
                                placeholder="Enter amount in lakhs..."
                                value={agencyAllocations[agency._id] || ''}
                                onChange={(e) => handleAllocationChange(agency._id, e.target.value)}
                                className="text-sm md:text-base"
                              />
                              <p className="text-xs text-muted-foreground">
                                Amount will be: {formatBudget((agencyAllocations[agency._id] || 0) * 100000)}
                              </p>
                            </div>

                            {/* Milestones */}
                            <div className="space-y-4 rounded-lg border p-3 md:p-4">
                              <Label className="font-semibold text-sm md:text-base">Define Milestones</Label>
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
                                  className="text-xs md:text-sm"
                                />
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  onClick={() => handleAddMilestone(agency._id)}
                                >
                                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              </div>
                              <ScrollArea className="h-40 md:h-48">
                                <div className="space-y-2 pr-3">
                                  {(milestoneAssignments[agency._id] || []).map((m, i) => (
                                    <div 
                                      key={i} 
                                      className="flex items-center justify-between p-2 bg-muted rounded-md text-xs md:text-sm"
                                    >
                                      <span className="flex-1 pr-2">{i + 1}. {m.text}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 flex-shrink-0" 
                                        onClick={() => handleRemoveMilestone(agency._id, i)}
                                      >
                                        <X className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Footer with Budget and Submit */}
        {!showAIRecommendations && (
          <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            <p className="text-xs md:text-sm text-center">
              Remaining Project Budget: 
              <span className={`font-bold ml-2 ${remainingBudget < 0 ? 'text-destructive' : ''}`}>
                {formatBudget(remainingBudget)}
              </span>
            </p>
            <Button 
              onClick={handleAssign} 
              disabled={mutation.isPending || selectedAgencies.length === 0}
              className="text-xs md:text-sm"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" /> 
                  Processing...
                </>
              ) : (
                "Confirm & Save Assignments"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}