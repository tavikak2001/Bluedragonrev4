
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
  CheckCircle2,
  Users,
  Clock,
  Briefcase
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

const reportCategories = [
  { id: "payroll", name: "รายงานจ่ายเงินเดือน (ภายใน)", description: "สรุปค่าแรงปกติและ OT รายเดือนสำหรับแอดมิน" },
  { id: "billing", name: "รายงานส่งตัวพนักงาน (สำหรับลูกค้า)", description: "สรุปชั่วโมงงานและ OT แยกตามโครงการ (ไม่แสดงค่าแรง)" },
  { id: "summary", name: "สรุปสถิติพนักงาน", description: "สถิติการมาทำงาน สาย และลางานรายบุคคล" },
];

export default function ReportsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AdminTimesheetInsightsOutput | null>(null);
  const [selectedReport, setSelectedReport] = useState("billing");

  // Fetch Data from Firestore
  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const timesheetsRef = useMemoFirebase(() => db ? collection(db, "timesheets") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);

  const { data: employees } = useCollection(employeesRef);
  const { data: timesheets } = useCollection(timesheetsRef);
  const { data: projects } = useCollection(projectsRef);

  const currentMonthLabel = format(new Date(), "MMMM yyyy", { locale: th });

  // กรองข้อมูลสำหรับแสดงในตารางตัวอย่าง (Preview)
  const reportPreviewData = useMemo(() => {
    if (!timesheets || !employees || !projects) return [];
    
    return timesheets.map(ts => {
      const emp = employees.find(e => e.id === ts.employeeId);
      const prj = projects.find(p => p.id === ts.projectId);
      return {
        ...ts,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "ไม่ระบุ",
        projectName: prj ? prj.projectName : "ไม่ระบุโครงการ",
        position: emp?.position || "-"
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
        additionalContext: "วิเคราะห์เพื่อความโปร่งใสในการเรียกเก็บเงินลูกค้า"
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

    let csvContent = "\uFEFF"; // UTF-8 BOM
    
    if (selectedReport === "billing") {
      // หัวข้อสำหรับลูกค้า (ไม่มีค่าแรง)
      csvContent += "วันที่,โครงการ,รหัสพนักงาน,ชื่อพนักงาน,ตำแหน่ง,เวลาเข้า,เวลาออก,ชั่วโมงงานปกติ,ชั่วโมง OT,หมายเหตุ\n";
      reportPreviewData.forEach(d => {
        csvContent += `${d.date},${d.projectName},${d.employeeId},${d.employeeName},${d.position},${d.checkIn},${d.checkOut},${d.workingHours},${d.otHours},${d.remarks || "-"}\n`;
      });
    } else {
      // หัวข้อสำหรับภายใน (มีค่าแรง)
      csvContent += "วันที่,ชื่อพนักงาน,ตำแหน่ง,ชั่วโมงงาน,ชั่วโมง OT,ค่าแรงต่อวัน,ค่า OT,รวมเงิน\n";
      reportPreviewData.forEach(d => {
        const emp = employees.find(e => e.id === d.employeeId);
        const dailyWage = emp?.dailyWage || 0;
        const otRate = emp?.otRatePerHour || 0;
        const total = ((d.workingHours / 8) * dailyWage) + (d.otHours * otRate);
        csvContent += `${d.date},${d.employeeName},${d.position},${d.workingHours},${d.otHours},${dailyWage},${otRate},${total.toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${selectedReport}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "ดาวน์โหลดสำเร็จ", description: "ไฟล์รายงานพร้อมใช้งานแล้ว" });
  };

  return (
    <div className="animate-in fade-in duration-500 font-sarabun">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">รายงานและบทวิเคราะห์</h1>
          <p className="text-muted-foreground">สรุปข้อมูลการทำงานเพื่อส่งลูกค้า หรือตรวจสอบภายใน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <h2 className="text-lg font-bold px-2 text-primary">ประเภทรายงาน</h2>
          <div className="space-y-3">
            {reportCategories.map((report) => (
              <Card 
                key={report.id} 
                className={`cursor-pointer transition-all border-slate-100 shadow-sm ${selectedReport === report.id ? 'border-accent ring-1 ring-accent bg-accent/5' : 'hover:border-accent'}`}
                onClick={() => {
                  setSelectedReport(report.id);
                  setInsights(null);
                }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedReport === report.id ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {report.id === 'billing' ? <Briefcase className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{report.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{report.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 mt-4 h-11 shadow-lg gap-2"
            onClick={handleGenerateAIInsights}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
            วิเคราะห์ประสิทธิภาพด้วย AI
          </Button>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden print:shadow-none">
            <CardHeader className="border-b bg-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Badge className="mb-2 bg-accent/10 text-accent border-none">{selectedReport === 'billing' ? 'Client Copy' : 'Internal Only'}</Badge>
                  <CardTitle className="text-xl">รายงาน: {reportCategories.find(r => r.id === selectedReport)?.name}</CardTitle>
                  <CardDescription>ข้อมูลประจำเดือน {currentMonthLabel}</CardDescription>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200" onClick={downloadCSV}>
                    <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" /> พิมพ์ PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* ตาราง Preview ข้อมูลที่จะส่งให้ลูกค้า */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-bold">วันที่</TableHead>
                      <TableHead className="font-bold">พนักงาน</TableHead>
                      <TableHead className="font-bold">โครงการ</TableHead>
                      <TableHead className="font-bold">เวลาเข้า-ออก</TableHead>
                      <TableHead className="font-bold text-center">ชั่วโมงงาน</TableHead>
                      <TableHead className="font-bold text-center">OT</TableHead>
                      {selectedReport === 'payroll' && <TableHead className="font-bold text-right">ค่าแรงรวม</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportPreviewData.length > 0 ? (
                      reportPreviewData.map((d, idx) => {
                        const emp = employees?.find(e => e.id === d.employeeId);
                        const totalWage = ((d.workingHours / 8) * (emp?.dailyWage || 0)) + (d.otHours * (emp?.otRatePerHour || 0));
                        
                        return (
                          <TableRow key={idx}>
                            <TableCell className="text-xs">{d.date}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">{d.employeeName}</span>
                                <span className="text-[10px] text-muted-foreground">{d.position}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{d.projectName}</TableCell>
                            <TableCell className="text-xs">{d.checkIn} - {d.checkOut}</TableCell>
                            <TableCell className="text-center font-bold text-primary">{d.workingHours}</TableCell>
                            <TableCell className="text-center font-bold text-accent">{d.otHours}</TableCell>
                            {selectedReport === 'payroll' && (
                              <TableCell className="text-right font-mono font-bold text-green-700">
                                ฿{totalWage.toLocaleString()}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={selectedReport === 'payroll' ? 7 : 6} className="text-center py-20 text-muted-foreground">
                          ไม่มีข้อมูลการทำงานในระบบ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {insights && (
                <div className="p-8 border-t bg-slate-50 space-y-8 animate-in fade-in duration-500 print:bg-white">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-primary">บทวิเคราะห์โดย AI สำหรับลูกค้า</h3>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm leading-relaxed">
                    {insights.overallSummary}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-orange-600">
                        <TrendingDown className="w-4 h-4" /> ประสิทธิภาพหน้างาน
                      </h4>
                      <div className="space-y-4">
                        {insights.productivityFluctuations.map((f, i) => (
                          <div key={i} className="text-sm">
                            <p className="font-bold text-primary">{f.period}: {f.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">สาเหตุหลัก: {f.potentialReasons[0]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-accent">
                        <Clock className="w-4 h-4" /> สถิติการทำ OT
                      </h4>
                      <div className="space-y-4">
                        {insights.unusualOvertimePatterns.map((o, i) => (
                          <div key={i} className="text-sm">
                            <p className="font-bold text-primary">{o.period}: {o.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">เหตุผล: {o.potentialReasons[0]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
