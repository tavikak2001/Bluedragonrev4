
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
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
        dailyWage: Number(emp?.dailyWage) || 0,
        otRate: Number(emp?.otRatePerHour) || 0
      };
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [timesheets, employees, projects]);

  const totals = useMemo(() => {
    return reportPreviewData.reduce((acc, curr) => {
      const wage = ((curr.workingHours / 8) * curr.dailyWage) + (curr.otHours * curr.otRate);
      return {
        hours: acc.hours + (curr.workingHours || 0),
        ot: acc.ot + (curr.otHours || 0),
        wages: acc.wages + wage
      };
    }, { hours: 0, ot: 0, wages: 0 });
  }, [reportPreviewData]);

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

    let csvContent = "\uFEFF"; // UTF-8 BOM
    
    if (selectedReport === "billing") {
      csvContent += "วันที่,โครงการ,ชื่อพนักงาน,ตำแหน่ง,ชั่วโมงปกติ,ชั่วโมงOT,หมายเหตุ\n";
      reportPreviewData.forEach(d => {
        csvContent += `"${d.date}","${d.projectName}","${d.employeeName}","${d.position}","${d.workingHours}","${d.otHours}","${d.remarks || "-"}"\n`;
      });
      csvContent += `,,TOTAL,,${totals.hours},${totals.ot},\n`;
    } else {
      csvContent += "วันที่,ชื่อพนักงาน,โครงการ,ชั่วโมงปกติ,ชั่วโมงOT,ค่าแรงรวม\n";
      reportPreviewData.forEach(d => {
        const total = ((d.workingHours / 8) * d.dailyWage) + (d.otHours * d.otRate);
        csvContent += `"${d.date}","${d.employeeName}","${d.projectName}","${d.workingHours}","${d.otHours}","${total.toFixed(2)}"\n`;
      });
      csvContent += `,,,${totals.hours},${totals.ot},${totals.wages.toFixed(2)}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Report_${selectedReport}_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    toast({ title: "ดาวน์โหลดสำเร็จ", description: "ไฟล์ Excel พร้อมใช้งานแล้ว" });
  };

  return (
    <div className="animate-in fade-in duration-500 font-sarabun pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">รายงานและบทวิเคราะห์</h1>
          <p className="text-muted-foreground">สรุปข้อมูลเพื่อส่งลูกค้าหรือตรวจสอบบัญชีภายใน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <h2 className="text-sm font-bold px-2 text-primary uppercase tracking-widest opacity-70">ประเภทรายงาน</h2>
          <div className="space-y-3">
            {reportCategories.map((report) => (
              <Card key={report.id} className={cn("cursor-pointer transition-all border-slate-100", selectedReport === report.id ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : 'hover:border-accent/50')} onClick={() => { setSelectedReport(report.id); setInsights(null); }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", selectedReport === report.id ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500')}>
                    {report.id === 'billing' ? <Briefcase className="w-5 h-5" /> : report.id === 'summary' ? <Users className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{report.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 mt-4 h-12 shadow-lg gap-2 rounded-xl" onClick={handleGenerateAIInsights} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />} วิเคราะห์ประสิทธิภาพด้วย AI
          </Button>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden print:shadow-none">
            <CardHeader className="border-b bg-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Badge className={cn("px-3 py-1 mb-2", selectedReport === 'billing' ? "bg-green-50 text-green-700 border-none" : "bg-blue-50 text-blue-700 border-none")}>
                    {selectedReport === 'billing' ? 'CLIENT REPORT' : 'INTERNAL REPORT'}
                  </Badge>
                  <CardTitle className="text-2xl font-bold text-primary">{reportCategories.find(r => r.id === selectedReport)?.name}</CardTitle>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  <Button variant="outline" className="gap-2 border-slate-200" onClick={downloadCSV}>
                    <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
                  </Button>
                  <Button className="gap-2 bg-primary" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" /> พิมพ์รายงาน
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead className="font-bold">วันที่</TableHead>
                      <TableHead className="font-bold">พนักงาน</TableHead>
                      <TableHead className="font-bold">โครงการ</TableHead>
                      <TableHead className="font-bold text-center">ชม.ปกติ</TableHead>
                      <TableHead className="font-bold text-center">OT</TableHead>
                      {selectedReport === 'payroll' && <TableHead className="font-bold text-right">ค่าแรงรวม</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportPreviewData.map((d, idx) => {
                      const totalWage = ((d.workingHours / 8) * d.dailyWage) + (d.otHours * d.otRate);
                      return (
                        <TableRow key={idx} className="hover:bg-slate-50/50">
                          <TableCell className="text-xs">{d.date}</TableCell>
                          <TableCell className="text-sm font-bold">{d.employeeName}</TableCell>
                          <TableCell className="text-xs">{d.projectName}</TableCell>
                          <TableCell className="text-center">{d.workingHours}</TableCell>
                          <TableCell className="text-center">{d.otHours || '-'}</TableCell>
                          {selectedReport === 'payroll' && (
                            <TableCell className="text-right font-bold">฿{totalWage.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter className="bg-slate-50">
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold">รวมยอดทั้งหมด</TableCell>
                      <TableCell className="text-center font-bold">{totals.hours}</TableCell>
                      <TableCell className="text-center font-bold">{totals.ot}</TableCell>
                      {selectedReport === 'payroll' && (
                        <TableCell className="text-right font-bold text-primary">฿{totals.wages.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      )}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {insights && (
                <div className="p-8 border-t bg-slate-50/50 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> บทวิเคราะห์ AI</h3>
                  <div className="bg-white p-6 rounded-xl border shadow-sm leading-relaxed">{insights.overallSummary}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-5"><h4 className="font-bold mb-4 text-primary">ปัญหาหน้างาน</h4>{insights.productivityFluctuations.map((f, i) => (<p key={i} className="text-sm mb-2 border-l-2 border-orange-200 pl-3"><strong>{f.period}:</strong> {f.description}</p>))}</Card>
                    <Card className="p-5"><h4 className="font-bold mb-4 text-primary">ข้อมูล OT</h4>{insights.unusualOvertimePatterns.map((o, i) => (<p key={i} className="text-sm mb-2 border-l-2 border-blue-200 pl-3"><strong>{o.period}:</strong> {o.description}</p>))}</Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          aside, header, .print-hidden { display: none !important; }
          .max-w-7xl { max-width: 100% !important; padding: 0 !important; }
          .rounded-2xl { border-radius: 0 !important; border: 1px solid #ddd !important; }
          table { font-size: 10px !important; }
          .shadow-xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
