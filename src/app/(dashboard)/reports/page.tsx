
"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Printer, 
  Sparkles,
  Loader2,
  TrendingDown,
  FileSpreadsheet,
  Users,
  Clock,
  Briefcase,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminTimesheetInsights, AdminTimesheetInsightsOutput } from "@/ai/flows/admin-timesheet-insights";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const reportCategories = [
  { id: "billing", name: "รายงานส่งตัวพนักงาน (สำหรับลูกค้า)", description: "สรุปชั่วโมงงานและ OT แยกตามโครงการ (ไม่แสดงค่าแรง)" },
  { id: "payroll", name: "รายงานค่าแรงพนักงาน (ภายใน)", description: "สรุปค่าแรงปกติและ OT รายเดือนสำหรับตรวจสอบบัญชี" },
  { id: "summary", name: "สรุปสถิติการเข้างาน", description: "สถิติการมาทำงาน สาย และลางานของพนักงานทุกคน" },
];

export default function ReportsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AdminTimesheetInsightsOutput | null>(null);
  const [selectedReport, setSelectedReport] = useState("billing");

  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const timesheetsRef = useMemoFirebase(() => db ? collection(db, "timesheets") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);

  const { data: employees } = useCollection(employeesRef);
  const { data: timesheets } = useCollection(timesheetsRef);
  const { data: projects } = useCollection(projectsRef);

  const currentMonthLabel = format(new Date(), "MMMM yyyy", { locale: th });

  const reportPreviewData = useMemo(() => {
    if (!timesheets || !employees || !projects) return [];
    
    return timesheets.map(ts => {
      const emp = employees.find(e => e.id === ts.employeeId);
      const prj = projects.find(p => p.id === ts.projectId);
      return {
        ...ts,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "ไม่ระบุ",
        projectName: prj ? prj.projectName : "ไม่ระบุโครงการ",
        position: emp?.position || "-",
        dailyWage: emp?.dailyWage || 0,
        otRate: emp?.otRatePerHour || 0
      };
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [timesheets, employees, projects]);

  const handleGenerateAIInsights = async () => {
    if (!timesheets || timesheets.length === 0) {
      toast({ variant: "destructive", title: "ไม่พบข้อมูล", description: "ไม่มีข้อมูลการลงเวลาทำงานสำหรับวิเคราะห์" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const dailyRecords = reportPreviewData.map(d => ({
        date: d.date,
        employeeId: d.employeeId,
        employeeName: d.employeeName,
        projectId: d.projectId,
        projectName: d.projectName,
        totalWorkingHours: d.workingHours || 0,
        totalOtHours: d.otHours || 0,
        remarks: d.remarks || ""
      }));

      const result = await adminTimesheetInsights({
        monthYear: currentMonthLabel,
        dailyRecords: dailyRecords.slice(0, 50),
        additionalContext: selectedReport === 'billing' ? "เน้นความโปร่งใสของคุณภาพพนักงานที่ส่งไปให้ลูกค้า" : "เน้นการควบคุมงบประมาณค่าแรงและประสิทธิภาพภายใน"
      });
      setInsights(result);
      toast({ title: "วิเคราะห์สำเร็จ", description: "AI สรุปรูปแบบการทำงานเรียบร้อยแล้ว" });
    } catch (error) {
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาด", description: "ไม่สามารถเรียกใช้งาน AI ได้" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadCSV = () => {
    if (!reportPreviewData.length) return;

    let csvContent = "\uFEFF"; // UTF-8 BOM for Thai Excel support
    
    if (selectedReport === "billing") {
      csvContent += "วันที่,โครงการ,ชื่อพนักงาน,ตำแหน่ง,เวลาเข้า,เวลาออก,ชั่วโมงปกติ,ชั่วโมงOT,หมายเหตุ\n";
      reportPreviewData.forEach(d => {
        csvContent += `"${d.date}","${d.projectName}","${d.employeeName}","${d.position}","${d.checkIn}","${d.checkOut}","${d.workingHours}","${d.otHours}","${d.remarks || "-"}"\n`;
      });
    } else {
      csvContent += "วันที่,ชื่อพนักงาน,โครงการ,ตำแหน่ง,ชั่วโมงปกติ,ชั่วโมงOT,ค่าแรงต่อวัน,ค่าOT/ชม,รวมเงิน\n";
      reportPreviewData.forEach(d => {
        const total = ((d.workingHours / 8) * d.dailyWage) + (d.otHours * d.otRate);
        csvContent += `"${d.date}","${d.employeeName}","${d.projectName}","${d.position}","${d.workingHours}","${d.otHours}","${d.dailyWage}","${d.otRate}","${total.toFixed(2)}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BlueDragon_Report_${selectedReport}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "ดาวน์โหลดสำเร็จ", description: "ไฟล์ Excel พร้อมใช้งานแล้ว" });
  };

  return (
    <div className="animate-in fade-in duration-500 font-sarabun pb-20">
      {/* Header - Hidden in Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">รายงานและบทวิเคราะห์</h1>
          <p className="text-muted-foreground">สรุปข้อมูลเพื่อส่งลูกค้า (Billing) หรือตรวจสอบบัญชีภายใน (Payroll)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Hidden in Print */}
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <h2 className="text-sm font-bold px-2 text-primary uppercase tracking-widest opacity-70">เลือกประเภทรายงาน</h2>
          <div className="space-y-3">
            {reportCategories.map((report) => (
              <Card 
                key={report.id} 
                className={cn(
                  "cursor-pointer transition-all border-slate-100 shadow-sm hover:shadow-md",
                  selectedReport === report.id ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : 'hover:border-accent/50'
                )}
                onClick={() => {
                  setSelectedReport(report.id);
                  setInsights(null);
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    selectedReport === report.id ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500'
                  )}>
                    {report.id === 'billing' ? <Briefcase className="w-5 h-5" /> : report.id === 'summary' ? <Users className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary leading-tight">{report.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 mt-4 h-12 shadow-lg gap-2 rounded-xl"
            onClick={handleGenerateAIInsights}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
            {isAnalyzing ? "กำลังวิเคราะห์..." : "วิเคราะห์ประสิทธิภาพด้วย AI"}
          </Button>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="text-xs font-bold text-blue-700 flex items-center gap-2 mb-2">
              <Building2 className="w-3 h-3" /> หมายเหตุสำหรับแอดมิน
            </h4>
            <p className="text-[10px] text-blue-600/80 leading-relaxed">
              รายงานฉบับ "ส่งตัวพนักงาน" จะซ่อนข้อมูลค่าแรงพนักงานเพื่อใช้ส่งให้ลูกค้าตรวจสอบชั่วโมงงานได้ทันที
            </p>
          </div>
        </div>

        {/* Main Report Area */}
        <div className="lg:col-span-3">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden print:shadow-none print:border-none">
            {/* Report Header */}
            <CardHeader className="border-b bg-white print:pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <Badge variant="outline" className={cn(
                       "px-3 py-1 border-none font-bold",
                       selectedReport === 'billing' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                     )}>
                       {selectedReport === 'billing' ? 'EXTERNAL REPORT' : 'INTERNAL REPORT'}
                     </Badge>
                     <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold print:hidden">ID: {format(new Date(), 'yyyyMMddHHmm')}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    {reportCategories.find(r => r.id === selectedReport)?.name}
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">ข้อมูลสรุปประจำเดือน {currentMonthLabel}</CardDescription>
                </div>
                
                {/* Print/Download Actions - Hidden in Print */}
                <div className="flex items-center gap-3 print:hidden">
                  <Button variant="outline" className="gap-2 border-slate-200 h-10 shadow-sm" onClick={downloadCSV}>
                    <FileSpreadsheet className="w-4 h-4 text-green-600" /> 
                    <span className="hidden sm:inline">Excel</span>
                  </Button>
                  <Button variant="default" className="gap-2 bg-primary h-10 shadow-md" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" /> 
                    <span className="hidden sm:inline">พิมพ์รายงาน (PDF)</span>
                  </Button>
                </div>
              </div>

              {/* Company Header for Print Only */}
              <div className="hidden print:block border-t mt-6 pt-6">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-primary text-lg">BLUE DRAGON PERFECT TEAM CO., LTD.</p>
                      <p className="text-xs text-slate-500">เอกสารสรุปผลการทำงานของพนักงานส่งตัว</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">วันที่ออกเอกสาร: {format(new Date(), 'd MMMM yyyy', { locale: th })}</p>
                    </div>
                 </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Data Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b-2">
                      <TableHead className="font-bold text-primary">วันที่</TableHead>
                      <TableHead className="font-bold text-primary">พนักงาน / ตำแหน่ง</TableHead>
                      <TableHead className="font-bold text-primary">โครงการ</TableHead>
                      <TableHead className="font-bold text-primary text-center">เข้า-ออก</TableHead>
                      <TableHead className="font-bold text-primary text-center">ชั่วโมงปกติ</TableHead>
                      <TableHead className="font-bold text-primary text-center">OT</TableHead>
                      {selectedReport === 'payroll' && <TableHead className="font-bold text-primary text-right">รวมค่าแรง</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportPreviewData.length > 0 ? (
                      reportPreviewData.map((d, idx) => {
                        const totalWage = ((d.workingHours / 8) * d.dailyWage) + (d.otHours * d.otRate);
                        
                        return (
                          <TableRow key={idx} className="hover:bg-slate-50/50 print:break-inside-avoid">
                            <TableCell className="text-xs font-medium">{d.date}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-primary">{d.employeeName}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{d.position}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-slate-600">{d.projectName}</TableCell>
                            <TableCell className="text-xs text-center font-mono">{d.checkIn} - {d.checkOut}</TableCell>
                            <TableCell className="text-center">
                               <Badge variant="outline" className="bg-white border-slate-200 font-bold px-3">
                                 {d.workingHours}
                               </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                               <Badge variant="outline" className={cn(
                                 "px-3 font-bold",
                                 d.otHours > 0 ? "bg-accent text-white border-none" : "bg-white border-slate-200 text-slate-300"
                               )}>
                                 {d.otHours > 0 ? d.otHours : '-'}
                               </Badge>
                            </TableCell>
                            {selectedReport === 'payroll' && (
                              <TableCell className="text-right font-mono font-bold text-primary">
                                ฿{totalWage.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={selectedReport === 'payroll' ? 7 : 6} className="text-center py-32">
                          <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-30">
                            <FileText className="w-16 h-16" />
                            <p className="text-lg font-bold">ไม่พบข้อมูลในเดือนนี้</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* AI Analysis Area */}
              {insights && (
                <div className="p-8 border-t bg-slate-50/50 space-y-8 animate-in slide-in-from-bottom duration-700 print:bg-white print:border-t-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent rounded-full text-white">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary">บทวิเคราะห์ประสิทธิภาพโดย AI</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Generative Insight Engine</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl border shadow-sm leading-relaxed text-slate-700 print:shadow-none print:p-0 print:border-none">
                    <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-accent first-letter:mr-2">
                      {insights.overallSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none">
                      <h4 className="font-bold flex items-center gap-2 mb-6 text-primary border-b pb-3">
                        <TrendingDown className="w-4 h-4 text-orange-500" /> 
                        ประสิทธิภาพและปัญหาหน้างาน
                      </h4>
                      <div className="space-y-6">
                        {insights.productivityFluctuations.map((f, i) => (
                          <div key={i} className="relative pl-4 border-l-2 border-orange-200">
                            <p className="font-bold text-sm text-primary">{f.period}</p>
                            <p className="text-sm text-slate-600 mt-1 font-medium">{f.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {f.potentialReasons.map((r, ri) => (
                                <Badge key={ri} variant="secondary" className="text-[9px] py-0">{r}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none">
                      <h4 className="font-bold flex items-center gap-2 mb-6 text-primary border-b pb-3">
                        <Clock className="w-4 h-4 text-accent" /> 
                        สถิติการทำงานล่วงเวลา (OT)
                      </h4>
                      <div className="space-y-6">
                        {insights.unusualOvertimePatterns.map((o, i) => (
                          <div key={i} className="relative pl-4 border-l-2 border-blue-200">
                            <p className="font-bold text-sm text-primary">{o.period}</p>
                            <p className="text-sm text-slate-600 mt-1 font-medium">{o.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-2 italic">สาเหตุ: {o.potentialReasons.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary p-8 rounded-3xl text-white shadow-xl print:bg-slate-100 print:text-primary print:shadow-none print:border">
                    <h4 className="font-bold flex items-center gap-2 mb-4 text-accent print:text-primary">
                      <FileText className="w-4 h-4" /> ข้อแนะนำสำหรับฝ่ายบริหาร
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {insights.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3 text-sm opacity-90">
                          <span className="shrink-0 w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          {rec}
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

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          aside, header, footer, .print-hidden {
            display: none !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          main {
            padding: 0 !important;
          }
          .rounded-2xl, .rounded-3xl {
            border-radius: 0 !important;
          }
          .shadow-xl, .shadow-sm, .shadow-md {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #e2e8f0 !important;
          }
          table {
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          .bg-slate-50\/50, .bg-slate-50\/80 {
            background-color: #f8fafc !important;
          }
        }
      `}</style>
    </div>
  );
}
