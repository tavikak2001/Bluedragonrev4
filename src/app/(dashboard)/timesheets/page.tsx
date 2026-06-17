
"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateHours } from "@/lib/utils/timesheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const dummyEmployees = [
  { id: "EMP001", name: "John Doe" },
  { id: "EMP002", name: "Jane Smith" },
];

const dummyProjects = [
  { id: "PRJ01", name: "Central Mall Renovation" },
  { id: "PRJ02", name: "Sky Tower Electrical" },
];

export default function TimesheetsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeId: "",
    projectId: "",
    checkIn: "08:00",
    checkOut: "17:00",
    break: 60,
    remarks: ""
  });

  const [calc, setCalc] = useState({
    workingHours: 0,
    otHours: 0,
    isLate: false,
    isEarlyLeave: false
  });

  useEffect(() => {
    const result = calculateHours(formData.checkIn, formData.checkOut, formData.break);
    setCalc(result);
  }, [formData.checkIn, formData.checkOut, formData.break]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Timesheet Saved",
      description: `Recorded ${calc.workingHours}h normal + ${calc.otHours.toFixed(1)}h OT for ${formData.date}`,
    });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Timesheet Entry</h1>
        <p className="text-muted-foreground">Log daily working hours and overtime records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Daily Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Work Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyEmployees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project / Site</Label>
                <Select onValueChange={(v) => setFormData({...formData, projectId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyProjects.map(prj => (
                      <SelectItem key={prj.id} value={prj.id}>{prj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check In</Label>
                  <Input 
                    id="checkIn" 
                    type="time" 
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check Out</Label>
                  <Input 
                    id="checkOut" 
                    type="time" 
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break">Break (min)</Label>
                  <Input 
                    id="break" 
                    type="number" 
                    value={formData.break}
                    onChange={(e) => setFormData({...formData, break: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input 
                  id="remarks" 
                  placeholder="e.g., Extended shift for deadline" 
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                Submit Timesheet
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Auto-Calculations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Working Hours</span>
                <span className="text-2xl font-bold">{calc.workingHours}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Overtime (OT)</span>
                <span className="text-2xl font-bold text-accent">{calc.otHours.toFixed(1)}h</span>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Late Arrival</span>
                  <Badge variant={calc.isLate ? "destructive" : "secondary"} className="text-[10px]">
                    {calc.isLate ? "YES" : "NO"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Early Leave</span>
                  <Badge variant={calc.isEarlyLeave ? "destructive" : "secondary"} className="text-[10px]">
                    {calc.isEarlyLeave ? "YES" : "NO"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-accent">OT Rules Reminder</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Normal Shift: 08:00 - 17:00</p>
              <p>• Lunch Break: 12:00 - 13:00</p>
              <p>• OT starts strictly after 17:00</p>
              <p>• System automatically flags late check-ins</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
