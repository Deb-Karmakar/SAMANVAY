import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";

const fetchPendingReviews = async () => {
    const { data } = await axiosInstance.get('/projects/pending-reviews');
    return data;
};

const reviewMilestone = async ({ projectId, assignmentIndex, checklistIndex, action, comments }) => {
    const { data } = await axiosInstance.put(
        `/projects/${projectId}/checklist/${assignmentIndex}/${checklistIndex}/review`,
        { action, comments }
    );
    return data;
};

export default function ReviewsPage() {
    const [selectedReview, setSelectedReview] = useState(null);
    const [comments, setComments] = useState('');
    const queryClient = useQueryClient();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['pendingReviews'],
        queryFn: fetchPendingReviews,
    });

    const mutation = useMutation({
        mutationFn: reviewMilestone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
            queryClient.invalidateQueries({ queryKey: ['myStateProjects'] });
            setSelectedReview(null);
            setComments('');
            alert('Review submitted successfully!');
        },
    });

    const handleReview = (action) => {
        if (!comments.trim()) {
            alert('Please provide review comments');
            return;
        }
        mutation.mutate({ ...selectedReview, action, comments });
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const pendingMilestones = [];
    projects?.forEach(project => {
        project.assignments?.forEach((assignment, aIdx) => {
            assignment.checklist?.forEach((milestone, mIdx) => {
                if (milestone.status === 'Pending Review') {
                    pendingMilestones.push({
                        projectId: project._id,
                        projectName: project.name,
                        agencyName: assignment.agency?.name,
                        assignmentIndex: aIdx,
                        checklistIndex: mIdx,
                        milestone
                    });
                }
            });
        });
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Pending Milestone Reviews</h1>
            
            {pendingMilestones.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No pending reviews</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingMilestones.map((item, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{item.projectName}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Agency: {item.agencyName}
                                        </p>
                                    </div>
                                    <Badge>Pending Review</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="font-semibold">Milestone:</Label>
                                    <p>{item.milestone.text}</p>
                                </div>

                                <div>
                                    <Label className="font-semibold">Proof Images:</Label>
                                    <div className="flex gap-2 mt-2">
                                        {item.milestone.proofImages?.map((url, i) => (
                                            <img 
                                                key={i}
                                                src={url}
                                                alt={`Proof ${i}`}
                                                className="h-32 w-32 object-cover rounded cursor-pointer"
                                                onClick={() => window.open(url, '_blank')}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={() => setSelectedReview(item)}>
                                    Review Submission
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Milestone</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Comments:</Label>
                            <Textarea 
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Provide feedback..."
                                rows={4}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => handleReview('approve')}
                                disabled={mutation.isLoading}
                                className="flex-1"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                            <Button 
                                onClick={() => handleReview('reject')}
                                disabled={mutation.isLoading}
                                variant="destructive"
                                className="flex-1"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}