
'use client';

import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Loader2,
  AlertCircle,
  UserX,
  UserCheck,
  Clock,
  Briefcase,
  FileText,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

export default function AttendanceReportPage() {
  const db = useFirestore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const timesheetsRef = useMemoFirebase(() => db ? collection(db, "timesheets") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);

  const { data: employees, loading: loadingEmps } = useCollection(employeesRef);
  const { data: timesheets, loading: loadingTs } = useCollection(timesheetsRef);
  const { data: projects } = useCollection(projectsRef);

  const dailyReport = useMemo(() => {
    if (!employees || !timesheets) return [];

    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    const todaysTimesheets = timesheets.filter(ts => ts.date === selectedDate);

    return activeEmployees.map(emp => {
      const ts = todaysTimesheets.find(t => t.employeeId === emp.id);
      const prj = ts ? projects.find(p => p.id === ts.projectId) : null;

      let status = "ขาดงาน";
      let statusColor = "bg-red-50 text-red-700 border-red-100";
      let detail = "-";

      if (ts) {
        if (ts.entryType === "Sick Leave") {
          status = "ลาป่วย";
          statusColor = "bg-amber-50 text-amber-700 border-amber-100";
          detail = ts.remarks || "ไม่ได้ระบุเหตุผล";
        } else if (ts.entryType === "Business Leave") {
          status = "ลากิจ";
          statusColor = "bg-blue-50 text-blue-700 border-blue-100";
          detail = ts.remarks || "ไม่ได้ระบุเหตุผล";
        } else if (ts.entryType === "Work") {
          status = ts.isLate ? "มาสาย" : "ปกติ";
          statusColor = ts.isLate ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-green-50 text-green-700 border-green-100";
          detail = `${ts.checkIn} - ${ts.checkOut}`;
        }
      }

      return {
        id: emp.id,
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        nickname: emp.nickname,
        position: emp.position,
        project: prj ? prj.projectName : (ts ? "ไม่ระบุโครงการ" : "-"),
        status,
        statusColor,
        detail,
        isLate: ts?.isLate || false
      };
    }).sort((a, b) => {
        if (a.status === "ขาดงาน" && b.status !== "ขาดงาน") return -1;
        if (a.status !== "ขาดงาน" && b.status === "ขาดงาน") return 1;
        return 0;
    });
  }, [employees, timesheets, projects, selectedDate]);

  const filteredReport = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return dailyReport.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.employeeId.toLowerCase().includes(term) ||
      item.nickname?.toLowerCase().includes(term)
    );
  }, [dailyReport, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: dailyReport.length,
      present: dailyReport.filter(r => r.status === "ปกติ" || r.status === "มาสาย").length,
      late: dailyReport.filter(r => r.status === "มาสาย").length,
      absent: dailyReport.filter(r => r.status === "ขาดงาน").length,
      leave: dailyReport.filter(r => r.status === "ลาป่วย" || r.status === "ลากิจ").length
    };
  }, [dailyReport]);

  if (loadingEmps || loadingTs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold">กำลังประมวลผลสรุปยอดการเข้างาน...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-sarabun">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">สรุปการเข้างานรายวัน</h1>
          <p className="text-muted-foreground font-medium">ติดตามสถานะพนักงานแบบรายบุคคล ประจำวันที่เลือก</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white border-primary text-primary px-5 py-2.5 font-bold flex gap-2 items-center h-12 shadow-sm">
            <CalendarIcon className="w-4 h-4" />
            {format(parseISO(selectedDate), "d MMMM yyyy", { locale: th })}
          </Badge>
          <Input 
            type="date" 
            className="w-auto h-12 font-bold text-primary" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-primary text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Active Staff</p>
                <h3 className="text-3xl font-black mt-2">{stats.total} <span className="text-sm font-normal opacity-70">คน</span></h3>
              </div>
              <Briefcase className="w-8 h-8 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white border-l-4 border-l-green-500 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">มาทำงานวันนี้</p>
                <h3 className="text-3xl font-black mt-2 text-primary">{stats.present} <span className="text-sm font-normal opacity-50">คน</span></h3>
              </div>
              <UserCheck className="w-8 h-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white border-l-4 border-l-amber-500 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">ลางาน (ลาป่วย/กิจ)</p>
                <h3 className="text-3xl font-black mt-2 text-primary">{stats.leave} <span className="text-sm font-normal opacity-50">คน</span></h3>
              </div>
              <FileText className="w-8 h-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white border-l-4 border-l-red-500 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">ขาดงาน / ยังไม่มา</p>
                <h3 className="text-3xl font-black mt-2 text-primary">{stats.absent} <span className="text-sm font-normal opacity-50">คน</span></h3>
              </div>
              <UserX className="w-8 h-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหารายชื่อ หรือรหัสพนักงาน..."
              className="pl-10 h-11 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-orange-500"></div>
               <span className="text-xs font-bold text-slate-600">มาสาย: {stats.late} คน</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <span className="text-xs font-bold text-slate-600">ขาดงาน: {stats.absent} คน</span>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="w-[100px] font-bold text-primary">รหัส</TableHead>
                <TableHead className="font-bold text-primary">ชื่อ-นามสกุล (เล่น)</TableHead>
                <TableHead className="font-bold text-primary">ตำแหน่งงาน</TableHead>
                <TableHead className="font-bold text-primary">สถานที่ปฏิบัติงาน</TableHead>
                <TableHead className="font-bold text-primary">ช่วงเวลา / หมายเหตุ</TableHead>
                <TableHead className="font-bold text-primary">สถานะวันนี้</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReport.length > 0 ? (
                filteredReport.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <TableCell className="font-mono text-[10px] font-bold text-slate-400">{item.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">{item.name}</span>
                        {item.nickname && <span className="text-[10px] text-muted-foreground">ชื่อเล่น: {item.nickname}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">{item.position}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">{item.project}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        <span className={item.status === "ขาดงาน" ? "text-red-400 italic" : "font-bold text-primary"}>
                          {item.detail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`px-4 py-1 font-bold border ${item.statusColor}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 opacity-10" />
                      <p className="font-bold">ไม่พบข้อมูลพนักงานที่ตรงกับการค้นหา</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
