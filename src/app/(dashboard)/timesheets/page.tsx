
'use client';

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock,
  Save,
  Loader2,
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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function TimesheetsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeId: "",
    projectId: "",
    checkIn: "08:00",
    checkOut: "17:00",
    breakMinutes: 60,
    remarks: ""
  });

  const [calc, setCalc] = useState({
    workingHours: 0,
    otHours: 0,
    isLate: false,
    isEarlyLeave: false
  });

  // Get Employees & Projects for Dropdowns
  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);
  const { data: employees } = useCollection(employeesRef);
  const { data: projects } = useCollection(projectsRef);

  useEffect(() => {
    const result = calculateHours(formData.checkIn, formData.checkOut, formData.breakMinutes);
    setCalc(result);
  }, [formData.checkIn, formData.checkOut, formData.breakMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    if (!formData.employeeId || !formData.projectId) {
      toast({
        variant: "destructive",
        title: "ข้อมูลไม่ครบถ้วน",
        description: "โปรดเลือกพนักงานและโครงการก่อนบันทึก",
      });
      return;
    }

    setLoading(true);
    const timesheetsRef = collection(db, "timesheets");
    const payload = {
      ...formData,
      ...calc,
      createdAt: serverTimestamp()
    };

    addDoc(timesheetsRef, payload)
      .then(() => {
        toast({
          title: "บันทึกสำเร็จ",
          description: `บันทึกเวลาทำงานวันที่ ${formData.date} เรียบร้อยแล้ว`,
        });
        setLoading(false);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: timesheetsRef.path,
          operation: 'create',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">ลงเวลาทำงาน</h1>
        <p className="text-muted-foreground">บันทึกเวลาเข้า-ออกงานประจำวัน และคำนวณโอเวอร์ไทม์ (OT) อัตโนมัติ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-md border-none rounded-xl overflow-hidden">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> แบบฟอร์มบันทึกเวลา
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="font-bold">วันที่</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">พนักงาน</Label>
                  <Select onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพนักงาน" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.nickname})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">โครงการ</Label>
                <Select onValueChange={(v) => setFormData({...formData, projectId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกโครงการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map(prj => (
                      <SelectItem key={prj.id} value={prj.id}>{prj.projectName}</SelectItem>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut" className="font-bold text-red-700">เวลาออกงาน</Label>
                  <Input 
                    id="checkOut" 
                    type="time" 
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break" className="font-bold">เวลาพัก (นาที)</Label>
                  <Input 
                    id="break" 
                    type="number" 
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData({...formData, breakMinutes: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="font-bold">หมายเหตุ</Label>
                <Textarea 
                  id="remarks" 
                  placeholder="รายละเอียดงานที่ทำ หรือข้อมูลเพิ่มเติม" 
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-accent h-12 shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    บันทึกข้อมูล
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white border-none shadow-md border-t-4 border-accent">
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
                  <Badge variant={calc.isLate ? "destructive" : "secondary"}>
                    {calc.isLate ? "มาสาย" : "ปกติ"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
