
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
  AlertTriangle
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
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
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
    
    const nearingProbation = activeEmployeesList.filter(emp => {
      if (!emp.startDate) return false;
      const day119 = addDays(parseISO(emp.startDate), 119);
      const diff = (day119.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diff > 0 && diff <= 14;
    }).length;

    return {
      totalEmployees: employees.length,
      activeEmployees,
      checkedInToday,
      monthlyWages: totalMonthlyWages,
      monthlyOtHours: totalMonthlyOtHours,
      activeProjects,
      nearingProbation
    };
  }, [employees, timesheets, projects, todayStr]);

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

  const recentActivities = useMemo(() => {
    if (!timesheets || !employees || !projects) return [];
    
    return [...timesheets]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map(ts => {
        const emp = employees.find(e => e.id === ts.employeeId);
        const prj = projects.find(p => p.id === ts.projectId);
        return {
          id: ts.id,
          employee: emp ? `${emp.firstName} ${emp.nickname ? `(${emp.nickname})` : ""}` : "Unknown",
          project: prj ? prj.projectName : "Unknown Project",
          time: `${ts.checkIn} - ${ts.checkOut}`,
          status: ts.isLate ? "เข้าสาย" : "ปกติ"
        };
      });
  }, [timesheets, employees, projects]);

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
          <p className="text-muted-foreground">สรุปผลการดำเนินงานและสถิติพนักงานเรียลไทม์</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-2 bg-white flex items-center gap-2 border-primary text-primary font-bold shadow-sm">
            <Calendar className="w-4 h-4" />
            ประจำวันที่: {today}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="พนักงานปฏิบัติงาน" 
          value={stats?.activeEmployees || 0} 
          icon={Users} 
          description={`จากทั้งหมด ${stats?.totalEmployees || 0} รายชื่อ`}
        />
        <StatCard 
          title="เข้างานวันนี้" 
          value={stats?.checkedInToday || 0} 
          icon={Activity} 
          description="จำนวนการเช็คอินล่าสุด"
        />
        <StatCard 
          title="ค่าแรงประมาณการ" 
          value={`฿${(stats?.monthlyWages || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={Wallet} 
          description="ยอดสะสมรวม OT ประจำเดือนนี้"
        />
        <StatCard 
          title="ใกล้ครบประเมิน" 
          value={stats?.nearingProbation || 0} 
          icon={AlertTriangle} 
          description="พนักงานที่ใกล้ครบ 119 วัน (ใน 2 สัปดาห์)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-bold">สรุปชั่วโมงงานรายสัปดาห์</CardTitle>
            <CardDescription>ข้อมูลชั่วโมงงานปกติและ OT แยกรายวัน (ทุกโครงการ)</CardDescription>
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

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">บันทึกการทำงานล่าสุด</CardTitle>
            <CardDescription>การเคลื่อนไหวหน้างานล่าสุด 5 รายการ</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-5">
               {recentActivities.length > 0 ? (
                 recentActivities.map((item) => (
                   <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-xs border border-slate-200">
                         {item.employee.charAt(0)}
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-bold text-primary truncate">{item.employee}</p>
                         <p className="text-[10px] text-muted-foreground truncate">{item.project}</p>
                       </div>
                     </div>
                     <Badge 
                      variant="outline" 
                      className={item.status === 'ปกติ' ? 'bg-green-50 text-green-700 border-none text-[10px] font-bold' : 'bg-red-50 text-red-700 border-none text-[10px] font-bold'}
                     >
                       {item.status}
                     </Badge>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 opacity-50">
                   <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                   <p className="text-sm">ยังไม่พบข้อมูลการลงเวลาในวันนี้</p>
                 </div>
               )}
               <Button asChild variant="outline" className="w-full mt-4 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                 <Link href="/timesheets">ดูรายละเอียดทั้งหมด</Link>
               </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">โครงการกำลังดำเนินการ</p>
              <h3 className="text-4xl font-black mt-2">{stats?.activeProjects || 0}</h3>
            </div>
            <Briefcase className="w-10 h-10 text-white/20" />
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">รวมชั่วโมง OT เดือนนี้</p>
              <h3 className="text-4xl font-black mt-2 text-primary">{(stats?.monthlyOtHours || 0).toFixed(1)}</h3>
            </div>
            <Clock className="w-10 h-10 text-blue-500/20" />
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-amber-500 shadow-sm rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">พนักงานที่ใช้งานอยู่</p>
              <h3 className="text-4xl font-black mt-2 text-primary">{stats?.activeEmployees || 0}</h3>
            </div>
            <Users className="w-10 h-10 text-amber-500/20" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
