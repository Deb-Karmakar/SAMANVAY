// Frontend/src/pages/agency/ProjectDetailPage.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Upload, X, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";

const fetchProjectDetails = async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}`);
    return data;
};

const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    // Replace with your actual image upload endpoint
    const { data } = await axiosInstance.post('/upload/image', formData);
    return data.url; // Assumes endpoint returns { url: 'https://...' }
};

const submitMilestone = async ({ projectId, assignmentIndex, checklistIndex, proofImages }) => {
    const { data } = await axiosInstance.put(
        `/projects/${projectId}/checklist/${assignmentIndex}/${checklistIndex}/submit`,
        { proofImages }
    );
    return data;
};

const statusConfig = {
    'Not Started': { icon: Clock, color: 'text-muted-foreground', variant: 'outline' },
    'Pending Review': { icon: Clock, color: 'text-yellow-600', variant: 'secondary' },
    'Approved': { icon: CheckCircle2, color: 'text-green-600', variant: 'default' },
    'Rejected': { icon: XCircle, color: 'text-destructive', variant: 'destructive' }
};

export default function AgencyProjectDetail() {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const queryClient = useQueryClient();
    
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { data: project, isLoading } = useQuery({
        queryKey: ['projectDetail', projectId],
        queryFn: () => fetchProjectDetails(projectId),
    });

    const submitMutation = useMutation({
        mutationFn: submitMilestone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectDetail', projectId] });
            queryClient.invalidateQueries({ queryKey: ['myAgencyProjects'] });
            setSelectedMilestone(null);
            setUploadedFiles([]);
            alert('Milestone submitted for review successfully!');
        },
        onError: (error) => {
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        
        try {
            const uploadPromises = files.map(file => uploadImage(file));
            const urls = await Promise.all(uploadPromises);
            setUploadedFiles(prev => [...prev, ...urls]);
        } catch (error) {
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitMilestone = () => {
        if (uploadedFiles.length === 0) {
            alert('Please upload at least one proof image');
            return;
        }

        const assignmentIndex = project.assignments?.findIndex(
            a => a._id === (project.assignment?._id || project.assignments[0]._id)
        ) || 0;

        submitMutation.mutate({
            projectId,
            assignmentIndex,
            checklistIndex: selectedMilestone,
            proofImages: uploadedFiles
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const myAssignment = project.assignment || project.assignments?.[0];
    
    if (!myAssignment) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">No assignment found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/agency/projects')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-sm text-muted-foreground">Progress: {project.progress}%</p>
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
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Project Milestones</CardTitle>
                    <CardDescription>
                        Submit proof images for each milestone. State officer will review your submissions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {myAssignment.checklist?.map((task, index) => {
                        const StatusIcon = statusConfig[task.status]?.icon || Clock;
                        const statusColor = statusConfig[task.status]?.color || 'text-muted-foreground';
                        
                        return (
                            <div key={task._id || index}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <StatusIcon className={`h-5 w-5 mt-0.5 ${statusColor}`} />
                                            <div className="flex-1">
                                                <Label className="text-base font-medium">{task.text}</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant={statusConfig[task.status]?.variant}>
                                                        {task.status}
                                                    </Badge>
                                                    {task.submittedAt && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Submitted: {new Date(task.submittedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {(task.status === 'Not Started' || task.status === 'Rejected') && (
                                            <Button 
                                                size="sm"
                                                onClick={() => setSelectedMilestone(index)}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Submit Proof
                                            </Button>
                                        )}
                                    </div>

                                    {task.reviewComments && (
                                        <div className="ml-8 p-3 bg-muted rounded-md">
                                            <p className="text-sm font-semibold mb-1">Review Comments:</p>
                                            <p className="text-sm">{task.reviewComments}</p>
                                        </div>
                                    )}

                                    {task.proofImages?.length > 0 && (
                                        <div className="ml-8">
                                            <p className="text-sm font-semibold mb-2">Submitted Images:</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {task.proofImages.map((url, i) => (
                                                    <img 
                                                        key={i}
                                                        src={url}
                                                        alt={`Proof ${i + 1}`}
                                                        className="h-20 w-20 object-cover rounded-md cursor-pointer"
                                                        onClick={() => window.open(url, '_blank')}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {index < myAssignment.checklist.length - 1 && <Separator className="mt-6" />}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Upload Dialog */}
            <Dialog open={selectedMilestone !== null} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Milestone Proof</DialogTitle>
                        <DialogDescription>
                            Upload images showing completion of: {myAssignment.checklist?.[selectedMilestone]?.text}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div>
                            <Input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {uploadedFiles.map((url, i) => (
                                    <div key={i} className="relative">
                                        <img src={url} alt={`Upload ${i}`} className="h-24 w-full object-cover rounded" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button 
                            onClick={handleSubmitMilestone}
                            disabled={uploadedFiles.length === 0 || submitMutation.isLoading}
                            className="w-full"
                        >
                            {submitMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Submit for Review
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}