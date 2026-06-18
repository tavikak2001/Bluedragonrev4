
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
  FileText
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

  // คำนวณสรุปการเข้างานสำหรับวันที่เลือก
  const dailyReport = useMemo(() => {
    if (!employees || !timesheets) return [];

    // กรองเฉพาะพนักงานที่ Active
    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    
    // กรอง Timesheet ของวันที่เลือก
    const todaysTimesheets = timesheets.filter(ts => ts.date === selectedDate);

    return activeEmployees.map(emp => {
      const ts = todaysTimesheets.find(t => t.employeeId === emp.id);
      const prj = ts ? projects.find(p => p.id === ts.projectId) : null;

      let status = "ขาดงาน";
      let statusColor = "bg-red-50 text-red-700";
      let detail = "-";

      if (ts) {
        if (ts.entryType === "Sick Leave") {
          status = "ลาป่วย";
          statusColor = "bg-amber-50 text-amber-700";
          detail = ts.remarks || "ไม่ได้ระบุเหตุผล";
        } else if (ts.entryType === "Business Leave") {
          status = "ลากิจ";
          statusColor = "bg-blue-50 text-blue-700";
          detail = ts.remarks || "ไม่ได้ระบุเหตุผล";
        } else if (ts.entryType === "Work") {
          status = ts.isLate ? "มาสาย" : "ปกติ";
          statusColor = ts.isLate ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700";
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
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <p className="text-muted-foreground font-medium">กำลังรวบรวมรายงานประจำวัน...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 font-sarabun">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">สรุปการเข้างานรายวัน</h1>
          <p className="text-muted-foreground">ตรวจสอบพนักงาน มาทำงาน, สาย, ลา หรือ ขาดงาน ประจำวัน</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white border-accent text-accent px-4 py-2 font-bold flex gap-2 items-center h-11">
            <CalendarIcon className="w-4 h-4" />
            {format(parseISO(selectedDate), "d MMMM yyyy", { locale: th })}
          </Badge>
          <Input 
            type="date" 
            className="w-auto h-11" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">พนักงานทั้งหมด</p>
                <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              </div>
              <Briefcase className="w-6 h-6 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">มาทำงาน (รวมสาย)</p>
                <h3 className="text-3xl font-bold mt-1 text-primary">{stats.present}</h3>
              </div>
              <UserCheck className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">ลา / ลาป่วย</p>
                <h3 className="text-3xl font-bold mt-1 text-primary">{stats.leave}</h3>
              </div>
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">ขาดงาน / ไม่พบข้อมูล</p>
                <h3 className="text-3xl font-bold mt-1 text-primary">{stats.absent}</h3>
              </div>
              <UserX className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อ หรือรหัสพนักงาน..."
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1">
               <div className="w-3 h-3 rounded-full bg-orange-500"></div>
               <span className="text-xs text-muted-foreground">มาสาย: {stats.late} คน</span>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[120px] font-bold">รหัส</TableHead>
                <TableHead className="font-bold">พนักงาน</TableHead>
                <TableHead className="font-bold">ตำแหน่ง</TableHead>
                <TableHead className="font-bold">โครงการ</TableHead>
                <TableHead className="font-bold">เวลา / รายละเอียด</TableHead>
                <TableHead className="font-bold">สถานะวันนี้</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReport.length > 0 ? (
                filteredReport.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-xs font-bold text-slate-400">{item.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">{item.name}</span>
                        {item.nickname && <span className="text-[10px] text-muted-foreground">({item.nickname})</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{item.position}</TableCell>
                    <TableCell className="text-xs">{item.project}</TableCell>
                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.detail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-none px-3 font-bold ${item.statusColor}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <AlertCircle className="w-10 h-10 opacity-20" />
                      <p>ไม่พบข้อมูลพนักงานสำหรับวันที่เลือก</p>
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
