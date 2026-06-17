
"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles,
  ChevronRight,
  Loader2,
  TrendingDown,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminTimesheetInsights, AdminTimesheetInsightsOutput } from "@/ai/flows/admin-timesheet-insights";
import { Badge } from "@/components/ui/badge";

const reportCategories = [
  { id: "payroll", name: "Payroll Report", description: "Monthly wages and OT summaries" },
  { id: "billing", name: "Customer Billing", description: "Project cost breakdown for clients" },
  { id: "summary", name: "Employee Summary", description: "Individual attendance performance" },
];

export default function ReportsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AdminTimesheetInsightsOutput | null>(null);

  const handleGenerateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      const result = await adminTimesheetInsights({
        monthYear: "May 2024",
        dailyRecords: [
          { date: "2024-05-01", employeeId: "EMP001", employeeName: "John Doe", totalWorkingHours: 8, totalOtHours: 2, projectName: "Central Mall" },
          { date: "2024-05-02", employeeId: "EMP001", employeeName: "John Doe", totalWorkingHours: 8, totalOtHours: 0, projectName: "Central Mall" },
          { date: "2024-05-03", employeeId: "EMP002", employeeName: "Jane Smith", totalWorkingHours: 6, totalOtHours: 0, remarks: "Sick Leave", projectName: "Sky Tower" },
          { date: "2024-05-15", employeeId: "EMP001", employeeName: "John Doe", totalWorkingHours: 8, totalOtHours: 4, remarks: "Project Deadline", projectName: "Central Mall" }
        ],
        additionalContext: "Heavy rain in the second week of May affected outdoor site progress."
      });
      setInsights(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Reports & Insights</h1>
          <p className="text-muted-foreground">Generate payroll, billing, and AI-powered performance analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold px-2">Available Reports</h2>
          {reportCategories.map((report) => (
            <Card key={report.id} className="cursor-pointer hover:border-accent transition-colors group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-accent/10 transition-colors">
                    <FileText className="w-5 h-5 text-slate-600 group-hover:text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </CardContent>
            </Card>
          ))}
          
          <Button 
            className="w-full bg-accent hover:bg-accent/90 mt-4 flex items-center gap-2"
            onClick={handleGenerateAIInsights}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze with AI
          </Button>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-none shadow-sm min-h-[500px]">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>Generated for the month of May 2024</CardDescription>
                </div>
                {insights && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" /> Export PDF
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Printer className="w-4 h-4" /> Print
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!insights && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                  <div className="p-4 bg-accent/5 rounded-full">
                    <Sparkles className="w-12 h-12 text-accent/30" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No Analysis Generated</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">Click "Analyze with AI" to get deep insights into your company's timesheet data.</p>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
                  <p className="text-muted-foreground">AI is analyzing patterns in your timesheets...</p>
                </div>
              )}

              {insights && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-accent" /> Overall Summary
                    </h3>
                    <p className="text-slate-600 leading-relaxed bg-accent/5 p-4 rounded-lg">
                      {insights.overallSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-orange-500" /> Productivity Dips
                      </h3>
                      {insights.productivityFluctuations.map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm space-y-2">
                          <Badge variant="outline" className="text-[10px]">{item.period}</Badge>
                          <p className="text-sm font-medium">{item.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Reasons:</strong>
                            <ul className="list-disc pl-4 mt-1">
                              {item.potentialReasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-accent" /> Overtime Spikes
                      </h3>
                      {insights.unusualOvertimePatterns.map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm space-y-2">
                          <Badge variant="outline" className="text-[10px]">{item.period}</Badge>
                          <p className="text-sm font-medium">{item.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Reasons:</strong>
                            <ul className="list-disc pl-4 mt-1">
                              {item.potentialReasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    <h3 className="font-bold flex items-center gap-2 mb-4 text-accent">
                      <Sparkles className="w-5 h-5" /> Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {insights.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-accent">
                            {idx + 1}
                          </div>
                          <span className="text-slate-200">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
