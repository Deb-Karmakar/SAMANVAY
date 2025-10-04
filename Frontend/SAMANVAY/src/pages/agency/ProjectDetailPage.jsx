// Frontend/src/pages/agency/ProjectDetailPage.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";

const fetchProjectDetails = async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}`);
    return data;
};

const updateChecklist = async ({ projectId, assignmentIndex, checklistIndex, completed }) => {
    const { data} = await axiosInstance.put(
        `/projects/${projectId}/checklist/${assignmentIndex}/${checklistIndex}`,
        { completed }
    );
    return data;
};

export default function AgencyProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projectDetail', projectId],
    queryFn: () => fetchProjectDetails(projectId),
    enabled: !!projectId,
  });

  const mutation = useMutation({
    mutationFn: updateChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['myAgencyProjects'] });
    },
    onError: (error) => {
      alert(`Failed to update checklist: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleCheckChange = (assignmentIndex, checklistIndex, currentStatus) => {
    mutation.mutate({
      projectId,
      assignmentIndex,
      checklistIndex,
      completed: !currentStatus
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load project: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Find the assignment for this agency
  const myAssignment = project.assignment || project.assignments?.[0];
  
  if (!myAssignment) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No assignment found for this project.</p>
        </CardContent>
      </Card>
    );
  }

  const assignmentIndex = project.assignments?.findIndex(a => a._id === myAssignment._id) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/agency/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">Project ID: {projectId}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Component</p>
            <p>{project.component}</p>
          </div>
          <div>
            <p className="font-semibold">Budget</p>
            <p>₹{(project.budget / 100000).toFixed(2)} Lakhs</p>
          </div>
          <div>
            <p className="font-semibold">State</p>
            <p>{project.state}</p>
          </div>
          <div>
            <p className="font-semibold">Progress</p>
            <p>{project.progress}%</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Milestones</CardTitle>
          <CardDescription>
            Check off tasks as they are completed. Progress is calculated automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {myAssignment.checklist && myAssignment.checklist.length > 0 ? (
            myAssignment.checklist.map((task, index) => (
              <div key={task._id || index}>
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id={`task-${index}`}
                    checked={task.completed}
                    onCheckedChange={() => handleCheckChange(assignmentIndex, index, task.completed)}
                    disabled={mutation.isLoading}
                  />
                  <Label 
                    htmlFor={`task-${index}`}
                    className={`text-base cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.text}
                  </Label>
                </div>
                {index < myAssignment.checklist.length - 1 && <Separator className="mt-6" />}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No milestones defined for this project yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}