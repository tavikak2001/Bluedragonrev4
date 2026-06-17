
"use client";

import React from "react";
import { 
  Users, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Wallet,
  Activity
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  BarChart,
  Bar,
  Legend
} from "recharts";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const performanceData = [
  { name: 'จันทร์', hours: 140, ot: 20 },
  { name: 'อังคาร', hours: 145, ot: 15 },
  { name: 'พุธ', hours: 130, ot: 25 },
  { name: 'พฤหัสบดี', hours: 155, ot: 30 },
  { name: 'ศุกร์', hours: 150, ot: 28 },
  { name: 'เสาร์', hours: 40, ot: 10 },
  { name: 'อาทิตย์', hours: 10, ot: 5 },
];

const recentTimesheets = [
  { id: 1, employee: "สมชาย ใจดี", project: "ไซส์งานสุขุมวิท 24", date: "20/05/2024", checkIn: "08:00", checkOut: "18:00", status: "อนุมัติแล้ว" },
  { id: 2, employee: "วิไลวรรณ รักงาน", project: "อาคารใบหยก", date: "20/05/2024", checkIn: "08:15", checkOut: "17:00", status: "รอตรวจสอบ" },
  { id: 3, employee: "เกรียงศักดิ์ สายดี", project: "สะพานพระราม 9", date: "19/05/2024", checkIn: "07:55", checkOut: "17:30", status: "อนุมัติแล้ว" },
  { id: 4, employee: "สมหญิง ขยันหมั่นเพียร", project: "โรงพยาบาลศิริราช", date: "19/05/2024", checkIn: "08:00", checkOut: "20:00", status: "รอตรวจสอบ" },
];

export default function DashboardPage() {
  const today = format(new Date(), "d MMMM yyyy", { locale: th });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">แดชบอร์ด</h1>
          <p className="text-muted-foreground text-sm">ยินดีต้อนรับสู่ระบบ Blue Dragon Management</p>
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
          value="124" 
          icon={Users} 
          trend={{ value: 12, isPositive: true }}
          description="พนักงานที่ปฏิบัติงานอยู่"
        />
        <StatCard 
          title="เข้างานวันนี้" 
          value="98" 
          icon={Activity} 
          description="จำนวนพนักงานที่เช็คอินแล้ว"
        />
        <StatCard 
          title="ค่าแรงรวมเดือนนี้" 
          value="฿456,200" 
          icon={Wallet} 
          trend={{ value: 5, isPositive: false }}
          description="สะสมตั้งแต่ต้นเดือน"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Working Hours Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg">ชั่วโมงการทำงานรวมรายสัปดาห์</CardTitle>
            <CardDescription>เปรียบเทียบเวลาทำงานปกติและ OT ในสัปดาห์นี้</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
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
                  <Area name="เวลาปกติ" type="monotone" dataKey="hours" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                  <Area name="OT" type="monotone" dataKey="ot" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorOT)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="border-none shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">การเข้างานล่าสุด</CardTitle>
            <CardDescription>รายการบันทึกเวลาล่าสุด 4 รายการ</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {recentTimesheets.slice(0, 4).map((item) => (
                 <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                       {item.employee.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-primary">{item.employee}</p>
                       <p className="text-[10px] text-muted-foreground">{item.project}</p>
                     </div>
                   </div>
                   <Badge variant={item.status === 'อนุมัติแล้ว' ? 'secondary' : 'outline'} className={item.status === 'อนุมัติแล้ว' ? 'bg-green-50 text-green-700 border-none' : 'border-slate-200'}>
                     {item.status}
                   </Badge>
                 </div>
               ))}
               <Button variant="outline" className="w-full mt-2 border-accent text-accent hover:bg-accent/5">ดูเวลาทำงานทั้งหมด</Button>
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
                    <h3 className="text-3xl font-bold mt-1">12</h3>
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
                    <h3 className="text-3xl font-bold mt-1 text-primary">456</h3>
                  </div>
                  <Clock className="w-6 h-6 text-accent" />
                </div>
             </CardContent>
           </Card>
           <Card className="bg-white border-none shadow-sm border-l-4 border-l-green-500">
             <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">มาสายวันนี้</p>
                    <h3 className="text-3xl font-bold mt-1 text-primary">2</h3>
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
                    <h3 className="text-3xl font-bold mt-1 text-primary">0</h3>
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
