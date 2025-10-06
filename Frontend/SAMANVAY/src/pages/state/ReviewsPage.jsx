// src/pages/state/ReviewsPage.jsx (Complete & Final Code)

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Inbox, FileText, Check, X } from "lucide-react";

// --- API Functions ---
const fetchPendingMilestones = async () => {
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

const fetchPendingUtilizationReports = async () => {
    const { data } = await axiosInstance.get('/utilization/pending');
    return data;
};

const reviewUtilizationReport = async ({ reportId, status, reviewComments }) => {
    const { data } = await axiosInstance.put(`/utilization/${reportId}/review`, { status, reviewComments });
    return data;
};

export default function ReviewsPage() {
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [selectedUtilization, setSelectedUtilization] = useState(null);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [comments, setComments] = useState('');
    const queryClient = useQueryClient();

    // --- Data Fetching for BOTH review types ---
    const { data: projects, isLoading: isLoadingMilestones } = useQuery({
        queryKey: ['pendingMilestoneReviews'],
        queryFn: fetchPendingMilestones,
    });

    const { data: utilizationReports, isLoading: isLoadingUtilization } = useQuery({
        queryKey: ['pendingUtilizationReports'],
        queryFn: fetchPendingUtilizationReports,
    });

    // --- Mutations for BOTH review types ---
    const milestoneMutation = useMutation({
        mutationFn: reviewMilestone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingMilestoneReviews'] });
            setSelectedMilestone(null);
            setComments('');
            alert('Milestone review submitted successfully!');
        },
    });

    const utilizationMutation = useMutation({
        mutationFn: reviewUtilizationReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingUtilizationReports'] });
            setSelectedUtilization(null);
            setComments('');
            alert('Utilization review submitted successfully!');
        },
        onError: (err) => {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    });

    // --- Event Handlers ---
    const handleMilestoneReview = (action) => {
        if (!comments.trim()) {
            alert('Please provide review comments.');
            return;
        }
        milestoneMutation.mutate({ ...selectedMilestone, action, comments });
    };

    const handleUtilizationReview = (decision) => {
        if (decision === 'Rejected' && !comments.trim()) {
            alert('Comments are required when rejecting a report.');
            return;
        }
        utilizationMutation.mutate({ reportId: selectedUtilization._id, status: decision, reviewComments: comments });
    };

    // --- Data Processing ---
    const pendingMilestones = [];
    projects?.forEach(project => {
        project.assignments?.forEach((assignment, aIdx) => {
            assignment.checklist?.forEach((milestone, mIdx) => {
                if (milestone.status === 'Pending Review') {
                    pendingMilestones.push({
                        projectId: project._id, projectName: project.name, agencyName: assignment.agency?.name,
                        assignmentIndex: aIdx, checklistIndex: mIdx, milestone
                    });
                }
            });
        });
    });

    if (isLoadingMilestones || isLoadingUtilization) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Review Submissions</h1>
                <p className="text-muted-foreground">Approve or reject submissions from executing agencies.</p>
            </div>

            <Tabs defaultValue="milestones" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="milestones">
                        Milestone Reviews <Badge className="ml-2">{pendingMilestones.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="utilization">
                        Fund Utilization Reviews <Badge className="ml-2">{utilizationReports?.length || 0}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* --- MILESTONES TAB --- */}
                <TabsContent value="milestones">
                    {pendingMilestones.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg"><Inbox className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-semibold">No Pending Milestone Reviews</h3></div>
                    ) : (
                        <div className="space-y-4 pt-4">
                            {pendingMilestones.map((item, idx) => (
                                <Card key={idx}>
                                    <CardHeader><div className="flex justify-between items-start"><CardTitle>{item.projectName}</CardTitle><Badge>Pending Review</Badge></div><p className="text-sm text-muted-foreground pt-1">Agency: {item.agencyName}</p></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div><Label className="font-semibold">Milestone:</Label><p>{item.milestone.text}</p></div>
                                        <div><Label className="font-semibold">Proof Images:</Label><div className="flex gap-2 mt-2">{item.milestone.proofImages?.map((url, i) => (<img key={i} src={url} alt={`Proof ${i}`} className="h-32 w-32 object-cover rounded cursor-pointer" onClick={() => setZoomedImage(url)} />))}</div></div>
                                        <Button onClick={() => setSelectedMilestone(item)}>Review Submission</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* --- UTILIZATION TAB --- */}
                <TabsContent value="utilization">
                    {utilizationReports?.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg"><Inbox className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-semibold">No Pending Utilization Reviews</h3></div>
                    ) : (
                         <div className="space-y-4 pt-4">
                            {utilizationReports?.map(report => (
                                <Card key={report._id}>
                                    <CardHeader><div className="flex justify-between items-start"><CardTitle>{report.project.name}</CardTitle><Badge>Pending Review</Badge></div><p className="text-sm text-muted-foreground pt-1">Agency: {report.agency.name}</p></CardHeader>
                                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Submitted on {new Date(report.createdAt).toLocaleDateString()}</p>
                                            <Badge variant="secondary" className="mt-2">Amount: ₹{(report.amount / 100000).toFixed(2)} Lakhs</Badge>
                                        </div>
                                        <Button onClick={() => setSelectedUtilization(report)}>Review Report</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* --- DIALOG for Milestone Review --- */}
            <Dialog open={!!selectedMilestone} onOpenChange={(open) => { if (!open) { setSelectedMilestone(null); setComments(''); }}}>
                <DialogContent><DialogHeader><DialogTitle>Review Milestone</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div><Label>Comments:</Label><Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Provide feedback..." rows={4} /></div>
                        <div className="flex gap-2">
                            <Button onClick={() => handleMilestoneReview('approve')} disabled={milestoneMutation.isPending} className="flex-1"><CheckCircle className="mr-2 h-4 w-4" /> Approve</Button>
                            <Button onClick={() => handleMilestoneReview('reject')} disabled={milestoneMutation.isPending} variant="destructive" className="flex-1"><XCircle className="mr-2 h-4 w-4" /> Reject</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- DIALOG for Utilization Review --- */}
            <Dialog open={!!selectedUtilization} onOpenChange={() => { if (!open) { setSelectedUtilization(null); setComments(''); }}}>
                <DialogContent className="sm:max-w-[525px]"><DialogHeader><DialogTitle>Review Utilization Report</DialogTitle><DialogDescription>From: <span className="font-semibold">{selectedUtilization?.agency.name}</span></DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex justify-between items-center bg-muted p-3 rounded-md"><span className="text-sm font-medium">Amount Utilized:</span><span className="text-lg font-bold">₹{(selectedUtilization?.amount / 100000).toFixed(2)} Lakhs</span></div>
                        <a href={`${import.meta.env.VITE_BACKEND_URL}${selectedUtilization?.certificateUrl}`} target="_blank" rel="noopener noreferrer" className="w-full"><Button variant="outline" className="w-full"><FileText className="mr-2 h-4 w-4" /> View Submitted Certificate (PDF)</Button></a>
                        <div className="space-y-2"><Label htmlFor="review-comments">Your Comments (Required for Rejection)</Label><Textarea id="review-comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Provide feedback or reasons for rejection..." /></div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={() => handleUtilizationReview('Rejected')} disabled={utilizationMutation.isPending}><X className="mr-2 h-4 w-4" /> Reject</Button>
                        <Button onClick={() => handleUtilizationReview('Approved')} disabled={utilizationMutation.isPending}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- DIALOG for Zoomed Image --- */}
            <Dialog open={!!zoomedImage} onOpenChange={(open) => { if (!open) setZoomedImage(null); }}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
                    <img src={zoomedImage} alt="Zoomed proof image" className="w-full h-full object-contain" />
                </DialogContent>
            </Dialog>
        </div>
    );
}