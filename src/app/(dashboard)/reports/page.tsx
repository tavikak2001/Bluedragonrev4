
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
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminTimesheetInsights, AdminTimesheetInsightsOutput } from "@/ai/flows/admin-timesheet-insights";
import { Badge } from "@/components/ui/badge";

const reportCategories = [
  { id: "payroll", name: "รายงานจ่ายเงินเดือน", description: "สรุปค่าแรงปกติและ OT รายเดือน" },
  { id: "billing", name: "รายงานเรียกเก็บลูกค้า", description: "สรุปค่าใช้จ่ายแยกตามโครงการสำหรับลูกค้า" },
  { id: "summary", name: "สรุปการเข้างานพนักงาน", description: "สถิติการมาทำงาน สาย และลางานรายบุคคล" },
  { id: "ot", name: "รายงานวิเคราะห์ OT", description: "วิเคราะห์ช่วงเวลาที่มีการทำโอเวอร์ไทม์สูง" },
];

export default function ReportsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AdminTimesheetInsightsOutput | null>(null);

  const handleGenerateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      const result = await adminTimesheetInsights({
        monthYear: "พฤษภาคม 2567",
        dailyRecords: [
          { date: "2024-05-01", employeeId: "EMP001", employeeName: "สมชาย ใจดี", totalWorkingHours: 8, totalOtHours: 2, projectName: "ไซส์งานสุขุมวิท 24" },
          { date: "2024-05-02", employeeId: "EMP001", employeeName: "สมชาย ใจดี", totalWorkingHours: 8, totalOtHours: 0, projectName: "ไซส์งานสุขุมวิท 24" },
          { date: "2024-05-03", employeeId: "EMP002", employeeName: "วิไลวรรณ รักงาน", totalWorkingHours: 6, totalOtHours: 0, remarks: "ลาป่วย", projectName: "อาคารใบหยก" },
          { date: "2024-05-15", employeeId: "EMP001", employeeName: "สมชาย ใจดี", totalWorkingHours: 8, totalOtHours: 4, remarks: "เร่งงานส่งลูกค้า", projectName: "ไซส์งานสุขุมวิท 24" }
        ],
        additionalContext: "ช่วงสัปดาห์ที่ 2 มีฝนตกหนักทำให้งานภายนอกอาคารล่าช้ากว่ากำหนด"
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
          <h1 className="text-3xl font-bold text-primary tracking-tight">รายงานและบทวิเคราะห์</h1>
          <p className="text-muted-foreground">สร้างรายงานเงินเดือน บิลลูกค้า และใช้ AI วิเคราะห์ประสิทธิภาพการทำงาน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold px-2 text-primary">รายการรายงาน</h2>
          <div className="space-y-3">
            {reportCategories.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:border-accent transition-all group border-slate-100 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-accent/10 transition-colors">
                      <FileText className="w-5 h-5 text-slate-600 group-hover:text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{report.name}</p>
                      <p className="text-[10px] text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
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
          <Card className="border-none shadow-sm min-h-[500px] rounded-xl overflow-hidden">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">ผลการวิเคราะห์ข้อมูล</CardTitle>
                  <CardDescription>ข้อมูลประจำเดือน พฤษภาคม 2567</CardDescription>
                </div>
                {insights && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs border-slate-200">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs border-slate-200">
                      <Download className="w-4 h-4 text-blue-600" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs border-slate-200">
                      <Printer className="w-4 h-4" /> พิมพ์
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {!insights && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-4">
                  <div className="p-6 bg-slate-50 rounded-full">
                    <Sparkles className="w-16 h-16 text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">ยังไม่มีการวิเคราะห์</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">คลิกที่ปุ่ม "วิเคราะห์ข้อมูลด้วย AI" เพื่อให้ระบบช่วยสรุปข้อมูลและให้คำแนะนำเชิงลึกจากข้อมูลเวลาทำงานของคุณ</p>
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
                    <p className="text-lg font-bold text-primary animate-pulse">กำลังวิเคราะห์ข้อมูล...</p>
                    <p className="text-sm text-muted-foreground">AI กำลังตรวจสอบรูปแบบการทำงานและ OT ของพนักงาน</p>
                  </div>
                </div>
              )}

              {insights && (
                <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                  <section>
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-primary">
                      <div className="w-2 h-6 bg-accent rounded-full"></div>
                      สรุปภาพรวมรายเดือน
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl leading-relaxed text-slate-700">
                      {insights.overallSummary}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                      <h3 className="font-bold text-primary flex items-center gap-2 text-lg">
                        <TrendingDown className="w-5 h-5 text-orange-500" /> ความผันผวนของประสิทธิภาพ
                      </h3>
                      <div className="space-y-4">
                        {insights.productivityFluctuations.map((item, idx) => (
                          <div key={idx} className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow space-y-3">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-none font-bold">{item.period}</Badge>
                            <p className="text-sm font-bold text-primary">{item.description}</p>
                            <div className="text-xs text-slate-600">
                              <p className="font-bold mb-1">สาเหตุที่เป็นไปได้:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {item.potentialReasons.map((r, i) => <li key={i}>{r}</li>)}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="font-bold text-primary flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5 text-accent" /> รูปแบบ OT ที่น่าสนใจ
                      </h3>
                      <div className="space-y-4">
                        {insights.unusualOvertimePatterns.map((item, idx) => (
                          <div key={idx} className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow space-y-3">
                            <Badge variant="outline" className="bg-blue-50 text-accent border-none font-bold">{item.period}</Badge>
                            <p className="text-sm font-bold text-primary">{item.description}</p>
                            <div className="text-xs text-slate-600">
                              <p className="font-bold mb-1">สาเหตุที่เป็นไปได้:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {item.potentialReasons.map((r, i) => <li key={i}>{r}</li>)}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className="p-8 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                       <Sparkles className="w-40 h-40" />
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-3 mb-6 relative z-10 text-accent">
                      <Sparkles className="w-6 h-6" /> ข้อเสนอแนะเพื่อการพัฒนา
                    </h3>
                    <ul className="space-y-4 relative z-10">
                      {insights.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-4">
                          <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-accent">
                            {idx + 1}
                          </div>
                          <span className="text-slate-200 leading-relaxed">{rec}</span>
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
