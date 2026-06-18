
'use client';

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock,
  Save,
  Loader2,
  FileText
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
    entryType: "Work",
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

  const employeesRef = useMemoFirebase(() => db ? collection(db, "employees") : null, [db]);
  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);
  const { data: employees } = useCollection(employeesRef);
  const { data: projects } = useCollection(projectsRef);

  // กรองเฉพาะพนักงานที่ยังไม่พ้นสภาพ
  const activeEmployees = useMemo(() => {
    return employees?.filter(emp => emp.status !== 'Inactive') || [];
  }, [employees]);

  useEffect(() => {
    if (formData.entryType === "Work") {
      const result = calculateHours(formData.checkIn, formData.checkOut, formData.breakMinutes);
      setCalc(result);
    } else {
      setCalc({ workingHours: 0, otHours: 0, isLate: false, isEarlyLeave: false });
    }
  }, [formData.checkIn, formData.checkOut, formData.breakMinutes, formData.entryType]);

  const handleSubmit = (e: React.FormEvent) => {
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
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: timesheetsRef.path,
          operation: 'create',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({
      title: "บันทึกสำเร็จ",
      description: `ระบบกำลังดำเนินการบันทึกสถานะเรียบร้อยแล้ว`,
    });
    
    setLoading(false);
    setFormData(prev => ({
      ...prev,
      employeeId: "",
      remarks: ""
    }));
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto font-sarabun">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">ลงเวลาทำงาน / บันทึกการลา</h1>
        <p className="text-muted-foreground">บันทึกการทำงานของพนักงานที่ยังปฏิบัติงานอยู่</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-md border-none rounded-xl overflow-hidden">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> รายละเอียดการลงเวลา
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
                  <Label className="font-bold">ประเภทการลงเวลา</Label>
                  <Select 
                    value={formData.entryType}
                    onValueChange={(v) => setFormData({...formData, entryType: v})}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Work">มาทำงานปกติ (Work)</SelectItem>
                      <SelectItem value="Sick Leave">ลาป่วย (Sick Leave)</SelectItem>
                      <SelectItem value="Business Leave">ลากิจ (Business Leave)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">พนักงาน (เฉพาะที่ยังทำงานอยู่)</Label>
                  <Select 
                    value={formData.employeeId}
                    onValueChange={(v) => setFormData({...formData, employeeId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพนักงาน" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEmployees?.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.nickname})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">โครงการ / สถานที่</Label>
                  <Select 
                    value={formData.projectId}
                    onValueChange={(v) => setFormData({...formData, projectId: v})}
                  >
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
              </div>

              {formData.entryType === "Work" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
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
              )}

              <div className="space-y-2">
                <Label htmlFor="remarks" className="font-bold">หมายเหตุ / เหตุผลการลา</Label>
                <Textarea 
                  id="remarks" 
                  placeholder={formData.entryType === 'Work' ? "รายละเอียดงาน..." : "ระบุสาเหตุการลา..."}
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="min-h-[100px]"
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
              <CardTitle className="text-lg text-primary">สรุปรายการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {formData.entryType === "Work" ? (
                <>
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground text-sm font-medium">ชั่วโมงทำงานปกติ</span>
                    <span className="text-2xl font-bold text-primary">{calc.workingHours} ชม.</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                    <span className="text-accent text-sm font-bold">เวลาล่วงเวลา (OT)</span>
                    <span className="text-2xl font-bold text-accent">{calc.otHours.toFixed(1)} ชม.</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="p-3 bg-amber-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-amber-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-primary">
                    บันทึกสถานะ: {formData.entryType === 'Sick Leave' ? 'ลาป่วย' : 'ลากิจ'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
