
"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock,
  Save,
  User,
  Building2,
  AlertCircle
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
import { Textarea } from "@/components/ui/textarea";

const dummyEmployees = [
  { id: "EMP001", name: "สมชาย ใจดี" },
  { id: "EMP002", name: "วิไลวรรณ รักงาน" },
];

const dummyProjects = [
  { id: "PRJ01", name: "ไซส์งานสุขุมวิท 24" },
  { id: "PRJ02", name: "อาคารใบหยก (ระบบไฟฟ้า)" },
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
    if (!formData.employeeId || !formData.projectId) {
      toast({
        variant: "destructive",
        title: "ข้อมูลไม่ครบถ้วน",
        description: "โปรดเลือกพนักงานและโครงการก่อนบันทึก",
      });
      return;
    }
    toast({
      title: "บันทึกเวลาสำเร็จ",
      description: `บันทึกงานวันที่ ${formData.date}: ปกติ ${calc.workingHours} ชม. + OT ${calc.otHours.toFixed(1)} ชม.`,
    });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">ลงเวลาทำงาน</h1>
        <p className="text-muted-foreground">บันทึกเวลาเข้า-ออกงานประจำวัน และคำนวณโอเวอร์ไทม์ (OT)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-md border-none rounded-xl overflow-hidden">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> บันทึกประจำวัน
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="font-bold">วันที่ปฏิบัติงาน</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="focus-visible:ring-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">พนักงาน</Label>
                  <Select onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                    <SelectTrigger className="focus:ring-accent">
                      <SelectValue placeholder="เลือกพนักงาน" />
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
                <Label className="font-bold">โครงการ / สถานที่ปฏิบัติงาน</Label>
                <Select onValueChange={(v) => setFormData({...formData, projectId: v})}>
                  <SelectTrigger className="focus:ring-accent">
                    <SelectValue placeholder="เลือกโครงการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyProjects.map(prj => (
                      <SelectItem key={prj.id} value={prj.id}>{prj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="checkIn" className="font-bold text-green-700">เวลาเข้างาน</Label>
                  <Input 
                    id="checkIn" 
                    type="time" 
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    className="border-green-100 focus-visible:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut" className="font-bold text-red-700">เวลาออกงาน</Label>
                  <Input 
                    id="checkOut" 
                    type="time" 
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    className="border-red-100 focus-visible:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break" className="font-bold">เวลาพัก (นาที)</Label>
                  <Input 
                    id="break" 
                    type="number" 
                    value={formData.break}
                    onChange={(e) => setFormData({...formData, break: parseInt(e.target.value) || 0})}
                    className="focus-visible:ring-accent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="font-bold">หมายเหตุ</Label>
                <Textarea 
                  id="remarks" 
                  placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" 
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="focus-visible:ring-accent"
                />
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-12 text-lg shadow-lg">
                <Save className="w-5 h-5 mr-2" /> บันทึกข้อมูล
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white border-none shadow-md rounded-xl overflow-hidden border-t-4 border-accent">
            <CardHeader>
              <CardTitle className="text-lg text-primary">สรุปผลการคำนวณ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground text-sm font-medium">ชั่วโมงทำงานปกติ</span>
                <span className="text-2xl font-bold text-primary">{calc.workingHours} ชม.</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                <span className="text-accent text-sm font-bold">เวลาล่วงเวลา (OT)</span>
                <span className="text-2xl font-bold text-accent">{calc.otHours.toFixed(1)} ชม.</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">สถานะมาสาย</span>
                  <Badge variant={calc.isLate ? "destructive" : "secondary"} className="px-3">
                    {calc.isLate ? "ใช่ (เกิน 08:00)" : "ปกติ"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">สถานะกลับก่อน</span>
                  <Badge variant={calc.isEarlyLeave ? "destructive" : "secondary"} className="px-3">
                    {calc.isEarlyLeave ? "ใช่ (ก่อน 17:00)" : "ปกติ"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-amber-50 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-amber-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> กฎการทำงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-800/80 space-y-2">
              <p>• เวลาเริ่มงานมาตรฐาน: 08:00 น.</p>
              <p>• เวลาพักกลางวัน: 12:00 - 13:00 น. (60 นาที)</p>
              <p>• เวลาเลิกงานมาตรฐาน: 17:00 น.</p>
              <p>• OT จะเริ่มคำนวณหลังเวลา 17:00 น. เป็นต้นไป</p>
              <p className="font-bold text-amber-900">• ระบบจะหักเวลาพักอัตโนมัติจากชั่วโมงทำงานรวม</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
