// Frontend/src/pages/admin/ProjectDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Calendar, IndianRupee, MapPin, Building, CheckCircle2, User, Mail } from "lucide-react";
import { formatBudget } from "@/components/BudgetDisplay";

const fetchProjectById = async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}`);
    return data;
};

const statusVariant = {
    'On Track': 'default',
    'Delayed': 'destructive',
    'Completed': 'secondary',
    'Pending Approval': 'outline',
};

const milestoneStatusConfig = {
    'Not Started': { color: 'text-muted-foreground', bgColor: 'bg-muted' },
    'Pending Review': { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    'Approved': { color: 'text-green-600', bgColor: 'bg-green-50' },
    'Rejected': { color: 'text-destructive', bgColor: 'bg-red-50' }
};

export default function AdminProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { data: project, isLoading, isError, error } = useQuery({
        queryKey: ['adminProject', projectId],
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

    const totalAllocated = project.assignments?.reduce((sum, a) => sum + (a.allocatedFunds || 0), 0) || 0;
    const remainingBudget = project.budget - totalAllocated;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => navigate('/admin/projects')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <p className="text-sm text-muted-foreground">Project ID: {project._id}</p>
                </div>
                <Badge variant={statusVariant[project.status]} className="text-base px-4 py-2">
                    {project.status}
                </Badge>
            </div>

            {/* Project Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                    <CardDescription>Basic information about this project</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5"/>
                        <div>
                            <p className="font-semibold">State/UT</p>
                            <p>{project.state}</p>
                            {project.district && <p className="text-muted-foreground">{project.district}</p>}
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <Building className="h-5 w-5 text-primary mt-0.5"/>
                        <div>
                            <p className="font-semibold">Component</p>
                            <p>{project.component}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <IndianRupee className="h-5 w-5 text-primary mt-0.5"/>
                        <div>
                            <p className="font-semibold">Total Budget</p>
                            <p>{formatBudget(project.budget)}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5"/>
                        <div>
                            <p className="font-semibold">Timeline</p>
                            <p className="text-xs">
                                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - 
                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Budget Allocation */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget Allocation</CardTitle>
                    <CardDescription>Fund distribution across agencies</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Budget</span>
                            <span className="font-bold">{formatBudget(project.budget)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Allocated</span>
                            <span className="font-bold text-blue-600">{formatBudget(totalAllocated)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Remaining</span>
                            <span className={`font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {formatBudget(remainingBudget)}
                            </span>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm font-medium mb-2">Overall Progress</p>
                            <div className="flex items-center gap-3">
                                <Progress value={project.progress} className="flex-1" />
                                <span className="text-lg font-bold">{project.progress}%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Agency Assignments */}
            <Card>
                <CardHeader>
                    <CardTitle>Agency Assignments & Milestones</CardTitle>
                    <CardDescription>
                        {!project.assignments || project.assignments.length === 0
                            ? "No agencies have been assigned to this project yet."
                            : `${project.assignments.length} ${project.assignments.length === 1 ? 'agency' : 'agencies'} working on this project`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!project.assignments || project.assignments.length === 0 ? (
                        <div className="text-center p-8 bg-muted/50 rounded-lg">
                            <p className="text-muted-foreground">
                                This project is awaiting agency assignment by the state officer.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {project.assignments.map((assignment, index) => (
                                <div key={assignment._id || index} className="border rounded-lg p-6">
                                    {/* Agency Header */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Building className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{assignment.agency?.name || 'Unknown Agency'}</p>
                                                <p className="text-sm text-muted-foreground">Executing Agency</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Allocated Funds</p>
                                            <p className="text-xl font-bold text-primary">
                                                {formatBudget(assignment.allocatedFunds || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator className="mb-6" />

                                    {/* Milestones */}
                                    <div>
                                        <p className="font-semibold mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Assigned Milestones ({assignment.checklist?.filter(m => m.completed).length || 0}/{assignment.checklist?.length || 0} completed)
                                        </p>
                                        
                                        {assignment.checklist && assignment.checklist.length > 0 ? (
                                            <div className="space-y-3">
                                                {assignment.checklist.map((milestone, mIdx) => (
                                                    <div 
                                                        key={milestone._id || mIdx}
                                                        className={`p-4 rounded-md border ${milestoneStatusConfig[milestone.status]?.bgColor || 'bg-muted'}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <CheckCircle2 className={`h-5 w-5 mt-0.5 ${milestone.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                                <div className="flex-1">
                                                                    <p className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                                        {milestone.text}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <Badge 
                                                                            variant="outline" 
                                                                            className={milestoneStatusConfig[milestone.status]?.color}
                                                                        >
                                                                            {milestone.status}
                                                                        </Badge>
                                                                        {milestone.submittedAt && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Submitted: {new Date(milestone.submittedAt).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                        {milestone.reviewedAt && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Reviewed: {new Date(milestone.reviewedAt).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {milestone.reviewComments && (
                                                                        <div className="mt-3 p-2 bg-background rounded text-sm">
                                                                            <p className="font-semibold text-xs mb-1">Review Comments:</p>
                                                                            <p className="text-muted-foreground">{milestone.reviewComments}</p>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {milestone.proofImages && milestone.proofImages.length > 0 && (
                                                                        <div className="mt-3">
                                                                            <p className="text-xs font-semibold mb-2">Proof Images:</p>
                                                                            <div className="flex gap-2 flex-wrap">
                                                                                {milestone.proofImages.map((url, imgIdx) => (
                                                                                    <img 
                                                                                        key={imgIdx}
                                                                                        src={url}
                                                                                        alt={`Proof ${imgIdx + 1}`}
                                                                                        className="h-16 w-16 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                                                                                        onClick={() => window.open(url, '_blank')}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No milestones defined yet.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}