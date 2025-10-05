import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Calendar, IndianRupee, MapPin, Building, CheckCircle } from 'lucide-react';
import { formatBudget } from '@/components/BudgetDisplay';
import ProjectAssignmentForm from '@/components/state/ProjectAssignmentForm';

const fetchProjectById = async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}`);
    return data;
};

export default function StateProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);

  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectById(projectId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center text-destructive">
        Error: {error.message}
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="text-center text-muted-foreground">
        Project not found.
      </div>
    );
  }

  // Calculate total allocated funds in the actual currency (not lakhs)
  const totalAllocated = project.assignments?.reduce((sum, a) => sum + (a.allocatedFunds || 0), 0) || 0;
  const remainingBudget = project.budget - totalAllocated;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/state/projects')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Project ID: {project._id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview from MoSJE</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary"/>
            <div className="flex-grow">
              <p className="font-semibold">State/UT</p>
              <p>{project.state}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-primary"/>
            <div className="flex-grow">
              <p className="font-semibold">Component</p>
              <p>{project.component}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <IndianRupee className="h-5 w-5 text-primary"/>
            <div className="flex-grow">
              <p className="font-semibold">Total Budget</p>
              <p>{formatBudget(project.budget)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary"/>
            <div className="flex-grow">
              <p className="font-semibold">Timeline</p>
              <p>
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Assignment & Milestones</CardTitle>
          <CardDescription>
            {!project.assignments || project.assignments.length === 0
              ? "Assign executing agencies, allocate funds, and define the project checklist."
              : "Review the assigned agencies and their specific milestones."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!project.assignments || project.assignments.length === 0 ? (
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <p className="font-semibold mb-2">This project is currently unassigned.</p>
              <p className="text-muted-foreground mb-4">
                The next step is to complete the assignment details.
              </p>
              <Button onClick={() => setIsAssignFormOpen(true)}>
                Assign Project
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {project.assignments.map((assignment, index) => (
                <div key={assignment.agency._id || index}>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground">Executing Agency</p>
                        <p className="font-semibold text-lg">{assignment.agency.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Allocated Funds</p>
                        <p className="font-semibold text-lg text-right">
                          {formatBudget(assignment.allocatedFunds || 0)}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Assigned Milestones
                      </Label>
                      <ul className="space-y-3 mt-2">
                        {assignment.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 mr-3 text-muted-foreground" />
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {remainingBudget > 0 && (
                <div className="text-center mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Remaining Budget: {formatBudget(remainingBudget)}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAssignFormOpen(true)}
                  >
                    Assign Another Agency
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isAssignFormOpen && (
        <ProjectAssignmentForm
          project={project}
          open={isAssignFormOpen}
          onOpenChange={setIsAssignFormOpen}
        />
      )}
    </div>
  );
}