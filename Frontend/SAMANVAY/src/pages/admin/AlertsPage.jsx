import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, MoreHorizontal, Send } from "lucide-react";
import { useState } from "react";

// --- Mock Alerts Data ---
const mockAlerts = [
  { id: 'ALRT001', severity: 'Critical', source: 'Rajasthan', message: 'Hostel project #RAJ-HOS-04 delayed by 45+ days.', date: '2025-10-02', status: 'New' },
  { id: 'ALRT002', severity: 'High', source: 'Uttar Pradesh', message: 'Funds of ₹2.5 Cr for Adarsh Gram #UP-AG-12 not utilized in 30 days.', date: '2025-09-28', status: 'New' },
  { id: 'ALRT003', severity: 'Medium', source: 'Bihar', message: 'GIA utilization report for #BIH-GIA-07 is overdue.', date: '2025-09-25', status: 'Acknowledged' },
  { id: 'ALRT004', severity: 'Medium', source: 'Karnataka', message: 'Low progress reported for project #KAR-HOS-09 for 2 consecutive weeks.', date: '2025-09-22', status: 'Acknowledged' },
  { id: 'ALRT005', severity: 'Low', source: 'Tamil Nadu', message: 'New executing agency registered. Awaiting role assignment.', date: '2025-09-20', status: 'Resolved' },
];

const severityVariant = {
  Critical: "destructive",
  High: "secondary",
  Medium: "default",
  Low: "outline"
};

export default function AdminAlerts() {
  const [notice, setNotice] = useState({ to: '', subject: '', message: '' });

  const handleSendNotice = (e) => {
    e.preventDefault();
    alert("Notice Sent (Simulated)!\nSee console for details.");
    console.log("Sending Notice:", notice);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Alerts & Notices</h1>
      </div>
      <p className="text-muted-foreground">
        Review system-generated alerts and communicate directly with State Nodal Officers.
      </p>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox">Alerts Inbox ({mockAlerts.filter(a => a.status === 'New').length})</TabsTrigger>
          <TabsTrigger value="send">Send Notice</TabsTrigger>
        </TabsList>

        {/* Alerts Inbox Tab */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Alerts</CardTitle>
              <CardDescription>System-detected issues that may require your attention.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Source State/UT</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell><Badge variant={severityVariant[alert.severity]}>{alert.severity}</Badge></TableCell>
                      <TableCell>{alert.source}</TableCell>
                      <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                      <TableCell>{alert.date}</TableCell>
                      <TableCell>{alert.status}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Acknowledge</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Notice Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Notice Composer</CardTitle>
              <CardDescription>Draft and send an official notice to one or more State/UT agencies.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSendNotice}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient">Recipient State/UT</Label>
                    <Select onValueChange={(value) => setNotice({...notice, to: value})}>
                      <SelectTrigger id="recipient"><SelectValue placeholder="Select a state..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UP">Uttar Pradesh</SelectItem>
                        <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="Bihar">Bihar</SelectItem>
                        <SelectItem value="All">All States/UTs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="e.g., Urgent: Overdue Fund Utilization Report" onChange={(e) => setNotice({...notice, subject: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Compose your notice here..." rows={8} onChange={(e) => setNotice({...notice, message: e.target.value})} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" /> Send Notice
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}