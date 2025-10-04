import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, IndianRupee, Upload, FileText } from "lucide-react";

// --- Mock Data ---
const mockFundHistory = [
    { date: '2025-09-20', description: 'UC Submitted for #PROJ004', amount: -80, type: 'debit' },
    { date: '2025-09-01', description: 'Funds Received for #PROJ008', amount: 100, type: 'credit' },
    { date: '2025-08-15', description: 'UC Submitted for #PROJ001', amount: -120, type: 'debit' },
    { date: '2025-07-10', description: 'Initial Funds for #PROJ001', amount: 250, type: 'credit' },
];

export default function AgencyFunds() {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Utilization report submitted successfully!");
    setFileName('');
    e.target.reset();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Fund Utilization</h1>
        <p className="text-muted-foreground">
          View funds received and submit utilization reports.
        </p>
      </div>

      {/* 2. High-Level Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Received</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ 350 Cr</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Utilized</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ 200 Cr</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Available Balance</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ 150 Cr</div></CardContent>
        </Card>
      </div>

      {/* 3. Submit Utilization Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Utilization Report</CardTitle>
          <CardDescription>Fill out the form to report expenditures for a project.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select name="project"><SelectTrigger id="project"><SelectValue placeholder="Select a project..." /></SelectTrigger>
                  <SelectContent><SelectItem value="PROJ001">PROJ001 - Jaipur Adarsh Gram</SelectItem><SelectItem value="PROJ008">PROJ008 - Alwar Road Widening</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Utilized (in Lakhs)</Label>
                <div className="relative"><IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input id="amount" name="amount" type="number" placeholder="80" className="pl-8" required /></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Upload Utilization Certificate (PDF)</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="uc-file" className="flex-grow">
                    <div className="cursor-pointer flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium border rounded-md border-input bg-background hover:bg-accent hover:text-accent-foreground">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>{fileName || "Choose a file..."}</span>
                    </div>
                </Label>
                <Input id="uc-file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea id="comments" name="comments" placeholder="Add any relevant notes or details..." />
            </div>
            <div className="flex justify-end">
              <Button type="submit"><FileText className="mr-2 h-4 w-4" /> Submit Report</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 4. Transaction History */}
      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (Cr)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFundHistory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className={`text-right font-semibold ${item.type === 'credit' ? 'text-green-600' : ''}`}>
                    {item.type === 'credit' ? '+' : '-'}₹{Math.abs(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}