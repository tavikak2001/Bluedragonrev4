
"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles,
  ChevronRight,
  Loader2,
  TrendingDown,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminTimesheetInsights, AdminTimesheetInsightsOutput } from "@/ai/flows/admin-timesheet-insights";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { th } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const reportCategories = [
  { id: "payroll", name: "รายงานจ่ายเงินเดือน", description: "สรุปค่าแรงปกติและ OT รายเดือน" },
  { id: "billing", name: "รายงานเรียกเก็บลูกค้า", description: "สรุปค่าใช้จ่ายแยกตามโครงการสำหรับลูกค้า" },
  { id: "summary", name: "สรุปการเข้างานพนักงาน", description: "สถิติการมาทำงาน สาย และลางานรายบุคคล" },
  { id: "ot", name: "รายงานวิเคราะห์ OT", description: "วิเคราะห์ช่วงเวลาที่มีการทำโอเวอร์ไทม์สูง" },
];

export default function ReportsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AdminTimesheetInsightsOutput | null>(null);
  const [selectedReport, setSelectedReport] = useState("payroll");

  // Fetch Data from Firestore
  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const timesheetsRef = useMemoFirebase(() => db ? collection(db, "timesheets") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);

  const { data: employees } = useCollection(employeesRef);
  const { data: timesheets } = useCollection(timesheetsRef);
  const { data: projects } = useCollection(projectsRef);

  const currentMonthLabel = format(new Date(), "MMMM yyyy", { locale: th });

  const handleGenerateAIInsights = async () => {
    if (!timesheets || timesheets.length === 0) {
      toast({
        variant: "destructive",
        title: "ไม่พบข้อมูล",
        description: "ต้องมีข้อมูลการลงเวลาทำงานก่อนจึงจะวิเคราะห์ได้",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Prepare real data for AI
      const dailyRecords = timesheets.map(ts => {
        const emp = employees.find(e => e.id === ts.employeeId);
        const prj = projects.find(p => p.id === ts.projectId);
        return {
          date: ts.date,
          employeeId: ts.employeeId,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "Unknown",
          projectId: ts.projectId,
          projectName: prj ? prj.projectName : "Unknown",
          totalWorkingHours: ts.workingHours || 0,
          totalOtHours: ts.otHours || 0,
          remarks: ts.remarks || ""
        };
      });

      const result = await adminTimesheetInsights({
        monthYear: currentMonthLabel,
        dailyRecords: dailyRecords.slice(0, 50), // Send latest 50 for analysis
        additionalContext: "วิเคราะห์จากฐานข้อมูลจริงของระบบ บลู ดราก้อน"
      });
      setInsights(result);
      toast({
        title: "วิเคราะห์สำเร็จ",
        description: "AI สรุปข้อมูลให้คุณเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อมูลให้ AI วิเคราะห์ได้ในขณะนี้",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadCSV = () => {
    if (!employees || !timesheets) return;

    // Create CSV Header
    let csvContent = "\uFEFF"; // UTF-8 BOM for Thai support in Excel
    csvContent += "พนักงาน,ตำแหน่ง,ชั่วโมงงานรวม,ชั่วโมงOTรวม,ค่าแรงโดยประมาณ\n";

    employees.forEach(emp => {
      const empTimesheets = timesheets.filter(ts => ts.employeeId === emp.id);
      const totalHours = empTimesheets.reduce((sum, ts) => sum + (ts.workingHours || 0), 0);
      const totalOT = empTimesheets.reduce((sum, ts) => sum + (ts.otHours || 0), 0);
      const estimatedWage = (totalHours/8 * (emp.dailyWage || 0)) + (totalOT * (emp.otRatePerHour || 0));
      
      csvContent += `${emp.firstName} ${emp.lastName},${emp.position},${totalHours},${totalOT},${estimatedWage}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "ดาวน์โหลดสำเร็จ",
      description: "ไฟล์รายงาน Excel (CSV) พร้อมใช้งานแล้ว",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in duration-500 print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">รายงานและบทวิเคราะห์</h1>
          <p className="text-muted-foreground">สรุปข้อมูลเงินเดือน และใช้ AI วิเคราะห์ประสิทธิภาพรายเดือน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <h2 className="text-lg font-bold px-2 text-primary">เลือกประเภทรายงาน</h2>
          <div className="space-y-3">
            {reportCategories.map((report) => (
              <Card 
                key={report.id} 
                className={`cursor-pointer transition-all group border-slate-100 shadow-sm ${selectedReport === report.id ? 'border-accent ring-1 ring-accent' : 'hover:border-accent'}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${selectedReport === report.id ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-accent/10 group-hover:text-accent'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{report.name}</p>
                      <p className="text-[10px] text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  {selectedReport === report.id ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 mt-4 flex items-center gap-2 h-11 shadow-lg"
            onClick={handleGenerateAIInsights}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
            วิเคราะห์ข้อมูลด้วย AI
          </Button>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-none shadow-sm min-h-[500px] rounded-xl overflow-hidden print:shadow-none print:border-none">
            <CardHeader className="border-b bg-white print:px-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">รายงาน{reportCategories.find(r => r.id === selectedReport)?.name}</CardTitle>
                  <CardDescription>ข้อมูลสรุปประจำเดือน {currentMonthLabel}</CardDescription>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <Button variant="outline" size="sm" className="gap-2 text-xs border-slate-200" onClick={downloadCSV}>
                    <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-xs border-slate-200" onClick={handlePrint}>
                    <Download className="w-4 h-4 text-blue-600" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-xs border-slate-200" onClick={handlePrint}>
                    <Printer className="w-4 h-4" /> พิมพ์
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 print:p-0 print:pt-6">
              {!insights && !isAnalyzing && (
                <div className="space-y-6">
                   <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                     <p className="text-sm font-medium text-slate-600">พร้อมสำหรับการส่งออกข้อมูล {employees?.length || 0} รายชื่อพนักงาน</p>
                     <p className="text-xs text-muted-foreground">คุณสามารถคลิกปุ่มดาวน์โหลด Excel หรือ PDF ด้านบนเพื่อรับไฟล์รายงานฉบับสมบูรณ์</p>
                   </div>
                   
                   <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-4">
                    <div className="p-4 bg-accent/5 rounded-full">
                      <Sparkles className="w-10 h-10 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-primary">ต้องการบทวิเคราะห์เชิงลึก?</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">ให้ AI ของเราช่วยตรวจสอบความผิดปกติของเวลาทำงานและโอเวอร์ไทม์เพื่อเพิ่มประสิทธิภาพ</p>
                    </div>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-accent" />
                    <Sparkles className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-primary animate-pulse">AI กำลังวิเคราะห์ฐานข้อมูล...</p>
                    <p className="text-sm text-muted-foreground">ตรวจสอบรูปแบบการทำงานและ OT ของพนักงานแต่ละโครงการ</p>
                  </div>
                </div>
              )}

              {insights && (
                <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                  <section>
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-primary">
                      <div className="w-2 h-6 bg-accent rounded-full"></div>
                      สรุปภาพรวมรายเดือน (AI Analysis)
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl leading-relaxed text-slate-700">
                      {insights.overallSummary}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                      <h3 className="font-bold text-primary flex items-center gap-2 text-lg">
                        <TrendingDown className="w-5 h-5 text-orange-500" /> ความผันผวนที่พบ
                      </h3>
                      <div className="space-y-4">
                        {insights.productivityFluctuations.map((item, idx) => (
                          <div key={idx} className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-none font-bold">{item.period}</Badge>
                            <p className="text-sm font-bold text-primary">{item.description}</p>
                            <ul className="text-[10px] text-slate-600 list-disc pl-4 space-y-1">
                              {item.potentialReasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="font-bold text-primary flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5 text-accent" /> รูปแบบ OT ผิดปกติ
                      </h3>
                      <div className="space-y-4">
                        {insights.unusualOvertimePatterns.map((item, idx) => (
                          <div key={idx} className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
                            <Badge variant="outline" className="bg-blue-50 text-accent border-none font-bold">{item.period}</Badge>
                            <p className="text-sm font-bold text-primary">{item.description}</p>
                            <ul className="text-[10px] text-slate-600 list-disc pl-4 space-y-1">
                              {item.potentialReasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className="p-8 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden break-inside-avoid">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                       <Sparkles className="w-40 h-40" />
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-3 mb-6 relative z-10 text-accent">
                      <Sparkles className="w-6 h-6" /> ข้อเสนอแนะจากระบบ AI
                    </h3>
                    <ul className="space-y-4 relative z-10">
                      {insights.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-4">
                          <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-accent">
                            {idx + 1}
                          </div>
                          <span className="text-slate-200 leading-relaxed text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
