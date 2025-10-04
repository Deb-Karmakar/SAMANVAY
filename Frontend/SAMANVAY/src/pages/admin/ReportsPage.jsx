import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, FileDown, Settings2 } from "lucide-react";

// --- Mock Data Generation Logic ---
const generateMockReport = (type) => {
  if (type === 'fund-utilization') {
    return {
      title: 'Fund Utilization Report',
      headers: ['State/UT', 'Disbursed (Cr)', 'Utilized (Cr)', 'Utilization %'],
      data: [
        ['Uttar Pradesh', '750', '650', '87%'],
        ['Rajasthan', '420', '210', '50%'],
        ['Bihar', '510', '480', '94%'],
      ],
    };
  }
  if (type === 'project-status') {
    return {
      title: 'Project Status Summary',
      headers: ['Project ID', 'Name', 'State', 'Status', 'Progress'],
      data: [
        ['PROJ001', 'Jaipur Adarsh Gram', 'Rajasthan', 'On Track', '65%'],
        ['PROJ002', 'Patna Hostel', 'Bihar', 'Delayed', '30%'],
        ['PROJ004', 'Lucknow Hostel', 'Uttar Pradesh', 'On Track', '85%'],
      ],
    };
  }
  return null;
};

export default function AdminReports() {
  const [reportParams, setReportParams] = useState({ type: '', state: 'all', startDate: '', endDate: '' });
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerateReport = () => {
    if (!reportParams.type) {
      alert("Please select a report type.");
      return;
    }
    const reportData = generateMockReport(reportParams.type);
    setGeneratedReport(reportData);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Generate custom reports on performance, funding, and project statuses for policymaking.
        </p>
      </div>

      {/* 2. Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Report Generator</CardTitle>
          <CardDescription>Select parameters below to generate a new report.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportParams.type} onValueChange={(value) => setReportParams({...reportParams, type: value})}>
                <SelectTrigger id="reportType"><SelectValue placeholder="Select a report type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fund-utilization">Fund Utilization Report</SelectItem>
                  <SelectItem value="project-status">Project Status Summary</SelectItem>
                  <SelectItem value="agency-performance" disabled>Agency Performance (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/UT</Label>
              <Select value={reportParams.state} onValueChange={(value) => setReportParams({...reportParams, state: value})}>
                <SelectTrigger id="state"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All States</SelectItem><SelectItem value="UP">Uttar Pradesh</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={reportParams.startDate} onChange={(e) => setReportParams({...reportParams, startDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={reportParams.endDate} onChange={(e) => setReportParams({...reportParams, endDate: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleGenerateReport}>Generate Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Report Preview Section (Conditional) */}
      {generatedReport && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{generatedReport.title}</CardTitle>
              <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
            </div>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Export as CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {generatedReport.headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedReport.data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => <TableCell key={cellIndex}>{cell}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}