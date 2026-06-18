
"use client";

import React, { useMemo } from "react";
import { 
  Users, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Wallet,
  Activity,
  Loader2,
  AlertTriangle,
  UserX,
  UserMinus,
  Info
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfWeek, eachDayOfInterval, isSameDay, addDays, subDays } from "date-fns";
import { th } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const db = useFirestore();
  const today = format(new Date(), "d MMMM yyyy", { locale: th });
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);
  const timesheetsRef = useMemoFirebase(() => db ? collection(db, "timesheets") : null, [db]);

  const { data: employees, loading: loadingEmps } = useCollection(employeesRef);
  const { data: projects, loading: loadingPrjs } = useCollection(projectsRef);
  const { data: timesheets, loading: loadingTs } = useCollection(timesheetsRef);

  const stats = useMemo(() => {
    if (!employees || !timesheets || !projects) return null;

    const activeEmployeesList = employees.filter(e => e.status === "Active");
    const activeEmployees = activeEmployeesList.length;
    const checkedInToday = timesheets.filter(ts => ts.date === todayStr).length;
    
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    
    let totalMonthlyWages = 0;
    let totalMonthlyOtHours = 0;

    timesheets.forEach(ts => {
      const tsDate = parseISO(ts.date);
      if (isWithinInterval(tsDate, { start, end })) {
        totalMonthlyOtHours += (ts.otHours || 0);
        const emp = employees.find(e => e.id === ts.employeeId);
        if (emp) {
          const dailyWage = Number(emp.dailyWage) || 0;
          const otRate = Number(emp.otRatePerHour) || 0;
          const dayWage = (ts.workingHours / 8) * dailyWage;
          const otWage = (ts.otHours || 0) * otRate;
          totalMonthlyWages += (dayWage + otWage);
        }
      }
    });

    const activeProjects = projects.filter(p => p.status === "In Progress").length;
    
    // พนักงานที่ใกล้ครบ 119 วัน
    const probationList = activeEmployeesList.filter(emp => {
      if (!emp.startDate) return false;
      const day119 = addDays(parseISO(emp.startDate), 119);
      const diff = (day119.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diff > 0 && diff <= 14;
    }).map(emp => ({
      id: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      nickname: emp.nickname,
      dueDate: format(addDays(parseISO(emp.startDate), 119), "d MMM yyyy", { locale: th })
    }));

    return {
      totalEmployees: employees.length,
      activeEmployees,
      checkedInToday,
      monthlyWages: totalMonthlyWages,
      monthlyOtHours: totalMonthlyOtHours,
      activeProjects,
      probationList
    };
  }, [employees, timesheets, projects, todayStr]);

  // วิเคราะห์พฤติกรรมย้อนหลัง 30 วัน
  const behavioralInsights = useMemo(() => {
    if (!employees || !timesheets) return { late: [], leave: [], absent: [] };

    const last30Days = subDays(new Date(), 30);
    const recentTs = timesheets.filter(ts => parseISO(ts.date) >= last30Days);
    
    const statsMap: Record<string, { late: number, leave: number, daysPresent: number }> = {};
    
    employees.forEach(emp => {
      statsMap[emp.id] = { late: 0, leave: 0, daysPresent: 0 };
    });

    recentTs.forEach(ts => {
      if (statsMap[ts.employeeId]) {
        if (ts.isLate) statsMap[ts.employeeId].late += 1;
        if (ts.entryType === "Sick Leave" || ts.entryType === "Business Leave") statsMap[ts.employeeId].leave += 1;
        if (ts.entryType === "Work") statsMap[ts.employeeId].daysPresent += 1;
      }
    });

    const getEmpInfo = (id: string) => {
      const emp = employees.find(e => e.id === id);
      return emp ? { name: `${emp.firstName} ${emp.lastName}`, code: emp.employeeId } : { name: "Unknown", code: id };
    };

    const lateRank = Object.entries(statsMap)
      .filter(([_, s]) => s.late > 0)
      .map(([id, s]) => ({ ...getEmpInfo(id), count: s.late }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const leaveRank = Object.entries(statsMap)
      .filter(([_, s]) => s.leave > 0)
      .map(([id, s]) => ({ ...getEmpInfo(id), count: s.leave }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return { late: lateRank, leave: leaveRank };
  }, [employees, timesheets]);

  const weeklyData = useMemo(() => {
    if (!timesheets) return [];
    
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end: addDays(start, 6) });
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayName = format(day, "eee", { locale: th });
      const dayTs = timesheets.filter(ts => ts.date === dayStr);
      
      return {
        name: dayName,
        hours: dayTs.reduce((sum, ts) => sum + (ts.workingHours || 0), 0),
        ot: dayTs.reduce((sum, ts) => sum + (ts.otHours || 0), 0)
      };
    });
  }, [timesheets]);

  if (loadingEmps || loadingPrjs || loadingTs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">กำลังรวบรวมสรุปภาพรวมสำหรับผู้บริหาร...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 font-sarabun">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">สรุปผลการดำเนินงานและสถิติพนักงานรายวัน</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-2 bg-white flex items-center gap-2 border-primary text-primary font-bold shadow-sm">
            <Calendar className="w-4 h-4" />
            {today}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="พนักงานปฏิบัติงาน" 
          value={stats?.activeEmployees || 0} 
          icon={Users} 
          description={`จากพนักงานทั้งหมด ${stats?.totalEmployees || 0} คน`}
        />
        <StatCard 
          title="เข้างานวันนี้" 
          value={stats?.checkedInToday || 0} 
          icon={Activity} 
          description="จำนวนคนที่เช็คอินล่าสุด"
        />
        <StatCard 
          title="ค่าแรงประมาณการ" 
          value={`฿${(stats?.monthlyWages || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={Wallet} 
          description="ยอดสะสมเดือนนี้ (รวม OT)"
        />
        <StatCard 
          title="ใกล้ครบประเมิน" 
          value={stats?.probationList.length || 0} 
          icon={AlertTriangle} 
          description="พนักงานที่ใกล้ครบ 119 วัน"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* กราฟสรุปรายสัปดาห์ */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-bold">สรุปชั่วโมงงานรายสัปดาห์</CardTitle>
            <CardDescription>แนวโน้มชั่วโมงงานปกติและ OT แยกรายวัน</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Area name="เวลาปกติ (ชม.)" type="monotone" dataKey="hours" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                  <Area name="OT (ชม.)" type="monotone" dataKey="ot" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorOT)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* รายงานพฤติกรรมที่ต้องติดตาม (Insights) */}
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden border-t-4 border-t-amber-500">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" /> พนักงานที่ต้องติดตาม (30 วันล่าสุด)
            </CardTitle>
            <CardDescription>สรุปสถิติ มาสาย และ ลา บ่อยที่สุด</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" /> มาสายบ่อยที่สุด
              </p>
              {behavioralInsights.late.length > 0 ? behavioralInsights.late.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">รหัส: {item.code}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-none">{item.count} ครั้ง</Badge>
                </div>
              )) : <p className="text-xs text-muted-foreground italic text-center py-2">ไม่มีข้อมูลมาสายผิดปกติ</p>}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserMinus className="w-3 h-3" /> ลาบ่อยที่สุด (ป่วย/กิจ)
              </p>
              {behavioralInsights.leave.length > 0 ? behavioralInsights.leave.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">รหัส: {item.code}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-none">{item.count} ครั้ง</Badge>
                </div>
              )) : <p className="text-xs text-muted-foreground italic text-center py-2">ไม่มีข้อมูลลางานผิดปกติ</p>}
            </div>
            
            <div className="p-3 bg-primary/5 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-[10px] text-primary/70 leading-relaxed">
                ข้อมูลวิเคราะห์จากบันทึกการลงเวลา 30 วันล่าสุด เพื่อช่วยในการพิจารณาปรับปรุงประสิทธิภาพการทำงาน
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* รายชื่อพนักงานใกล้ครบประเมิน (Probation) */}
        <Card className="md:col-span-2 border-none shadow-sm rounded-2xl bg-white border-t-4 border-t-accent">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" /> พนักงานใกล้ครบประเมิน 119 วัน
            </CardTitle>
            <CardDescription>รายชื่อพนักงานที่จะครบกำหนดในอีก 14 วันข้างหน้า</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.probationList && stats.probationList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.probationList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-accent/5 border border-accent/10 rounded-2xl hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                        {item.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">รหัส: {item.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-accent">ครบกำหนด</p>
                      <p className="text-xs font-bold text-primary">{item.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl">
                <Info className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">ไม่มีพนักงานที่ใกล้ครบกำหนดประเมินในช่วงนี้</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* สรุปสถานะโครงการ */}
        <Card className="bg-primary text-white border-none shadow-lg rounded-2xl">
          <CardHeader>
             <CardTitle className="text-lg font-bold text-white/90">โครงการปัจจุบัน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white/50 text-xs uppercase tracking-widest font-bold">In Progress</p>
                <h3 className="text-4xl font-black">{stats?.activeProjects || 0}</h3>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <Briefcase className="w-8 h-8 text-white/40" />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white/60">รวมชั่วโมง OT เดือนนี้</span>
                <span className="text-accent">{(stats?.monthlyOtHours || 0).toFixed(1)} ชม.</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white/60">พนักงานเช็คอินวันนี้</span>
                <span className="text-green-400">{stats?.checkedInToday || 0} คน</span>
              </div>
            </div>
            <Button asChild className="w-full bg-white text-primary hover:bg-slate-100 font-bold h-11 rounded-xl mt-4">
              <Link href="/reports">ไปที่หน้ารายงาน</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
