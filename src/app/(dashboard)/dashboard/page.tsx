
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
  Loader2
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
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const db = useFirestore();
  const today = format(new Date(), "d MMMM yyyy", { locale: th });
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Fetch Real Data
  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);
  const timesheetsRef = useMemoFirebase(() => db ? collection(db, "timesheets") : null, [db]);

  const { data: employees, loading: loadingEmps } = useCollection(employeesRef);
  const { data: projects, loading: loadingPrjs } = useCollection(projectsRef);
  const { data: timesheets, loading: loadingTs } = useCollection(timesheetsRef);

  // 1. Calculate Summary Stats
  const stats = useMemo(() => {
    if (!employees || !timesheets || !projects) return null;

    const activeEmployees = employees.filter(e => e.status === "Active").length;
    const checkedInToday = timesheets.filter(ts => ts.date === todayStr).length;
    
    // Monthly Wages & OT
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    
    let totalMonthlyWages = 0;
    let totalMonthlyOtHours = 0;

    timesheets.forEach(ts => {
      const tsDate = parseISO(ts.date);
      if (isWithinInterval(tsDate, { start, end })) {
        totalMonthlyOtHours += (ts.otHours || 0);
        
        // Find employee to get wage rate
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
    const lateToday = timesheets.filter(ts => ts.date === todayStr && ts.isLate).length;
    const earlyLeaveToday = timesheets.filter(ts => ts.date === todayStr && ts.isEarlyLeave).length;

    return {
      totalEmployees: employees.length,
      activeEmployees,
      checkedInToday,
      monthlyWages: totalMonthlyWages,
      monthlyOtHours: totalMonthlyOtHours,
      activeProjects,
      lateToday,
      earlyLeaveToday
    };
  }, [employees, timesheets, projects, todayStr]);

  // 2. Prepare Weekly Chart Data
  const weeklyData = useMemo(() => {
    if (!timesheets) return [];
    
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start Monday
    const end = new Date();
    const days = eachDayOfInterval({ start, end: eachDayOfInterval({start, end})[6] || new Date() });
    
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

  // 3. Recent Activity Data
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
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <p className="text-muted-foreground font-medium">กำลังรวบรวมข้อมูลแดชบอร์ด...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 font-sarabun">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">แดชบอร์ด</h1>
          <p className="text-muted-foreground text-sm">ภาพรวมระบบบริหารจัดการพนักงานและโครงการ</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-white flex items-center gap-2 border-accent text-accent font-medium">
            <Calendar className="w-4 h-4" />
            วันนี้: {today}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="พนักงานทั้งหมด" 
          value={stats?.totalEmployees || 0} 
          icon={Users} 
          description={`พนักงานที่ปฏิบัติงานอยู่ ${stats?.activeEmployees || 0} คน`}
        />
        <StatCard 
          title="เข้างานวันนี้" 
          value={stats?.checkedInToday || 0} 
          icon={Activity} 
          description="จำนวนพนักงานที่เช็คอินแล้ววันนี้"
        />
        <StatCard 
          title="ค่าแรงรวมเดือนนี้" 
          value={`฿${(stats?.monthlyWages || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={Wallet} 
          description="ประมาณการค่าแรงสะสมรวม OT"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Working Hours Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg">ชั่วโมงการทำงานรายวัน (สัปดาห์นี้)</CardTitle>
            <CardDescription>กราฟเปรียบเทียบชั่วโมงงานปกติและ OT รวมทั้งโครงการ</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Area name="เวลาปกติ (ชม.)" type="monotone" dataKey="hours" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                  <Area name="OT (ชม.)" type="monotone" dataKey="ot" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorOT)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="border-none shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">การลงเวลาล่าสุด</CardTitle>
            <CardDescription>รายการล่าสุด 5 รายการจากทุกโครงการ</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {recentActivities.length > 0 ? (
                 recentActivities.map((item) => (
                   <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                         {item.employee.charAt(0)}
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-semibold text-primary truncate">{item.employee}</p>
                         <p className="text-[10px] text-muted-foreground truncate">{item.project}</p>
                       </div>
                     </div>
                     <Badge 
                      variant="outline" 
                      className={item.status === 'ปกติ' ? 'bg-green-50 text-green-700 border-none text-[10px]' : 'bg-red-50 text-red-700 border-none text-[10px]'}
                     >
                       {item.status}
                     </Badge>
                   </div>
                 ))
               ) : (
                 <p className="text-center text-sm text-muted-foreground py-10">ยังไม่มีข้อมูลการลงเวลา</p>
               )}
               <Button asChild variant="outline" className="w-full mt-2 border-accent text-accent hover:bg-accent/5">
                 <Link href="/timesheets">ดูเวลาทำงานทั้งหมด</Link>
               </Button>
             </div>
          </CardContent>
        </Card>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:col-span-3 gap-6">
           <Card className="bg-primary text-white border-none shadow-lg">
             <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">โครงการที่เปิดอยู่</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.activeProjects || 0}</h3>
                  </div>
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
             </CardContent>
           </Card>
           <Card className="bg-white border-none shadow-sm border-l-4 border-l-accent">
             <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">ชั่วโมง OT เดือนนี้</p>
                    <h3 className="text-3xl font-bold mt-1 text-primary">{(stats?.monthlyOtHours || 0).toFixed(1)}</h3>
                  </div>
                  <Clock className="w-6 h-6 text-accent" />
                </div>
             </CardContent>
           </Card>
           <Card className="bg-white border-none shadow-sm border-l-4 border-l-red-500">
             <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">มาสายวันนี้</p>
                    <h3 className="text-3xl font-bold mt-1 text-primary">{stats?.lateToday || 0}</h3>
                  </div>
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
             </CardContent>
           </Card>
           <Card className="bg-white border-none shadow-sm border-l-4 border-l-blue-400">
             <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">กลับก่อนเวลา</p>
                    <h3 className="text-3xl font-bold mt-1 text-primary">{stats?.earlyLeaveToday || 0}</h3>
                  </div>
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
