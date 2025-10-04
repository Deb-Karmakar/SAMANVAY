import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MessageSquareWarning, Send, ArrowUpCircle, Forward } from "lucide-react";

// --- Mock Data ---
const mockInboxMessages = [
  { id: 'MSG001', from: 'MoSJE Admin', subject: 'Action Required: Fund Utilization Deadlines for Q3', snippet: 'Please ensure all executing agencies submit their reports by...', date: '2025-09-28', read: false },
  { id: 'MSG002', from: 'MoSJE Admin', subject: 'Information: New Guidelines for Adarsh Gram', snippet: 'A new circular has been issued regarding the updated...', date: '2025-09-25', read: true },
  { id: 'MSG003', from: 'MoSJE Admin', subject: 'Reminder: Upcoming Progress Review Meeting', snippet: 'This is a reminder for the national-level progress review...', date: '2025-09-22', read: true },
];

export default function StateCommunications() {
  const [escalation, setEscalation] = useState({ subject: '', message: '' });
  const [forward, setForward] = useState({ to: '', subject: '', message: '' });

  const handleEscalate = (e) => { e.preventDefault(); alert("Issue Escalated!"); console.log("Escalating:", escalation); };
  const handleForward = (e) => { e.preventDefault(); alert("Notice Forwarded!"); console.log("Forwarding:", forward); };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Communications</h1>
        <p className="text-muted-foreground">
          Receive notices from the Centre and escalate issues.
        </p>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inbox">Inbox ({mockInboxMessages.filter(m => !m.read).length})</TabsTrigger>
          <TabsTrigger value="escalate">Escalate Issue</TabsTrigger>
          <TabsTrigger value="forward">Forward Notice</TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader><CardTitle>Inbox</CardTitle><CardDescription>Notices and alerts received from the Central Ministry.</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInboxMessages.map((msg, index) => (
                  <div key={msg.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg hover:bg-muted/50">
                      <div className="flex items-start gap-4">
                        {!msg.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5"></div>}
                        <div className={msg.read ? 'text-muted-foreground' : ''}>
                          <p className="font-semibold text-sm">{msg.from}</p>
                          <p className="font-medium">{msg.subject}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{msg.snippet}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-xs text-muted-foreground mr-2">{msg.date}</span>
                        <Button variant="secondary" size="sm">View</Button>
                      </div>
                    </div>
                    {index < mockInboxMessages.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalate Issue Tab */}
        <TabsContent value="escalate">
          <Card>
            <CardHeader><CardTitle>Issue Escalation Tool</CardTitle><CardDescription>Request clarification or report a bottleneck to the Central Ministry.</CardDescription></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleEscalate}>
                <div><Label htmlFor="to-admin">To</Label><Input id="to-admin" value="Central Ministry (MoSJE)" disabled /></div>
                <div><Label htmlFor="escalate-subject">Subject</Label><Input id="escalate-subject" placeholder="e.g., Bottleneck in Project #RAJ-HOS-04" onChange={(e) => setEscalation({...escalation, subject: e.target.value})} /></div>
                <div><Label htmlFor="escalate-message">Message</Label><Textarea id="escalate-message" placeholder="Describe the issue in detail..." rows={8} onChange={(e) => setEscalation({...escalation, message: e.target.value})} /></div>
                <div className="flex justify-end"><Button type="submit"><ArrowUpCircle className="mr-2 h-4 w-4" /> Send Escalation</Button></div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Forward Notice Tab */}
        <TabsContent value="forward">
          <Card>
            <CardHeader><CardTitle>Forward Notice</CardTitle><CardDescription>Send a new notice or forward one to your executing agencies.</CardDescription></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleForward}>
                <div><Label htmlFor="to-agency">Recipient Agency</Label><Select onValueChange={(value) => setForward({...forward, to: value})}><SelectTrigger id="to-agency"><SelectValue placeholder="Select an agency..." /></SelectTrigger><SelectContent><SelectItem value="all">All Agencies in State</SelectItem><SelectItem value="PWD">Rajasthan PWD</SelectItem><SelectItem value="JMC">Jodhpur Municipal Corp</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="forward-subject">Subject</Label><Input id="forward-subject" placeholder="e.g., FW: Fund Utilization Deadlines" onChange={(e) => setForward({...forward, subject: e.target.value})} /></div>
                <div><Label htmlFor="forward-message">Message</Label><Textarea id="forward-message" placeholder="Add your message here..." rows={8} onChange={(e) => setForward({...forward, message: e.target.value})} /></div>
                <div className="flex justify-end"><Button type="submit"><Forward className="mr-2 h-4 w-4" /> Forward to Agency</Button></div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}