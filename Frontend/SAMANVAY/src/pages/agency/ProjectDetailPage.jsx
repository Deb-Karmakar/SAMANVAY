import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Paperclip } from "lucide-react";

// Mock data for a single project - in a real app, you'd fetch this using the projectId
const mockProjectDetails = {
  id: 'PROJ001',
  name: 'Jaipur Adarsh Gram Dev.',
  deadline: '2026-03-31',
  budget: '₹250 Lakhs',
  checklist: [
    { id: 'task1', text: 'Site Clearance and Levelling', completed: true },
    { id: 'task2', text: 'Foundation and Plinth Beam', completed: true },
    { id: 'task3', text: 'Ground Floor Slab Casting', completed: false },
    { id: 'task4', text: 'First Floor Walls and Slab', completed: false },
    { id: 'task5', text: 'Plumbing and Electrical Work', completed: false },
  ]
};

export default function AgencyProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Gets the project ID from the URL
  const [checklist, setChecklist] = useState(mockProjectDetails.checklist);

  const handleCheckChange = (taskId) => {
    setChecklist(
      checklist.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const handleSubmit = () => {
      const completedCount = checklist.filter(task => task.completed).length;
      const progress = Math.round((completedCount / checklist.length) * 100);
      alert(`Submitting progress update: ${progress}% for project ${projectId}.`);
      navigate('/agency/projects');
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/agency/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold">{mockProjectDetails.name}</h1>
            <p className="text-sm text-muted-foreground">Project ID: {projectId}</p>
        </div>
      </div>

      {/* Project Summary Card */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
            <div><p className="font-semibold">Deadline</p><p>{mockProjectDetails.deadline}</p></div>
            <div><p className="font-semibold">Budget</p><p>{mockProjectDetails.budget}</p></div>
        </CardContent>
      </Card>
      
      {/* Interactive Checklist Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Milestones</CardTitle>
          <CardDescription>Check off tasks as they are completed and upload proof.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {checklist.map((task, index) => (
            <div key={task.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => handleCheckChange(task.id)} />
                  <Label htmlFor={task.id} className={`text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</Label>
                </div>
                <Button variant="outline" size="sm"><Paperclip className="h-4 w-4 mr-2"/> Upload Proof</Button>
              </div>
              {index < checklist.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Button className="w-full" size="lg" onClick={handleSubmit}>Submit Progress Update</Button>
    </div>
  );
}