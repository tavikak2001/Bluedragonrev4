
"use client";

import React from "react";
import { 
  Users, 
  Clock, 
  Briefcase, 
  ClipboardCheck, 
  TrendingUp, 
  Calendar 
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

const performanceData = [
  { name: 'Mon', hours: 140, ot: 20 },
  { name: 'Tue', hours: 145, ot: 15 },
  { name: 'Wed', hours: 130, ot: 25 },
  { name: 'Thu', hours: 155, ot: 30 },
  { name: 'Fri', hours: 150, ot: 28 },
  { name: 'Sat', hours: 40, ot: 10 },
  { name: 'Sun', hours: 10, ot: 5 },
];

const recentTimesheets = [
  { id: 1, employee: "John Doe", project: "Central Mall", date: "2024-05-20", checkIn: "08:00", checkOut: "18:00", status: "Approved" },
  { id: 2, employee: "Jane Smith", project: "Sky Tower", date: "2024-05-20", checkIn: "08:15", checkOut: "17:00", status: "Pending" },
  { id: 3, employee: "Robert Brown", project: "Metro Bridge", date: "2024-05-19", checkIn: "07:55", checkOut: "17:30", status: "Approved" },
  { id: 4, employee: "Sarah Wilson", project: "City Park", date: "2024-05-19", checkIn: "08:00", checkOut: "20:00", status: "Pending" },
];

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, SUEA Organizer Admin.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            May 20, 2024
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Employees" 
          value="124" 
          icon={Users} 
          trend={{ value: 12, isPositive: true }}
          description="Active staff in records"
        />
        <StatCard 
          title="Working Today" 
          value="98" 
          icon={TrendingUp} 
          description="Employees checked in"
        />
        <StatCard 
          title="Monthly OT Hours" 
          value="456" 
          icon={Clock} 
          trend={{ value: 5, isPositive: false }}
          description="Accumulated this month"
        />
        <StatCard 
          title="Active Projects" 
          value="12" 
          icon={Briefcase} 
          description="Ongoing site projects"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Working Hours Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Company Working Hours</CardTitle>
            <CardDescription>Visualizing normal hours vs overtime this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Area type="monotone" dataKey="hours" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                  <Area type="monotone" dataKey="ot" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorOT)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Recent timesheet activity</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {recentTimesheets.slice(0, 4).map((item) => (
                 <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                       {item.employee.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-primary">{item.employee}</p>
                       <p className="text-xs text-muted-foreground">{item.project}</p>
                     </div>
                   </div>
                   <Badge variant={item.status === 'Approved' ? 'secondary' : 'outline'}>
                     {item.status}
                   </Badge>
                 </div>
               ))}
               <Button variant="outline" className="w-full mt-2">View All Timesheets</Button>
             </div>
          </CardContent>
        </Card>

        {/* Weekly Summary Table */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Timesheet Overview</CardTitle>
                <CardDescription>Daily check-ins for active projects</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-accent/10">
                View Full Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTimesheets.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.employee}</TableCell>
                    <TableCell>{row.project}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.checkIn}</TableCell>
                    <TableCell>{row.checkOut}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={row.status === 'Approved' ? 'secondary' : 'outline'}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
