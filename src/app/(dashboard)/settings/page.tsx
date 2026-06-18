
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  Clock, 
  Save, 
  User,
  Loader2,
  Info,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { addDays, format, parseISO, isValid } from 'date-fns';
import { th } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // ดึงข้อมูลบริษัท
  const settingsRef = useMemoFirebase(() => db ? doc(db, "settings", "global") : null, [db]);
  const { data: settings, loading: loadingSettings } = useDoc(settingsRef);

  // ดึงข้อมูลโปรไฟล์ผู้ใช้งาน
  const userProfileRef = useMemoFirebase(() => (db && user) ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile, loading: loadingProfile } = useDoc(userProfileRef);

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    taxId: "",
    phone: "",
    address: "",
    standardStartTime: "08:00",
    standardEndTime: "17:00",
    lunchBreakMinutes: "60"
  });

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    position: "",
    startDate: ""
  });

  // คำนวณวันครบ 119 วัน
  const probationEndDate = useMemo(() => {
    if (!profileForm.startDate) return null;
    const date = parseISO(profileForm.startDate);
    if (!isValid(date)) return null;
    return addDays(date, 119);
  }, [profileForm.startDate]);

  useEffect(() => {
    if (settings) {
      setCompanyForm({
        companyName: settings.companyName || "",
        taxId: settings.taxId || "",
        phone: settings.phone || "",
        address: settings.address || "",
        standardStartTime: settings.standardStartTime || "08:00",
        standardEndTime: settings.standardEndTime || "17:00",
        lunchBreakMinutes: settings.lunchBreakMinutes?.toString() || "60"
      });
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || "",
        position: profile.position || "",
        startDate: profile.startDate || ""
      });
    }
  }, [profile]);

  const handleSaveCompany = async () => {
    if (!db) return;
    setIsSaving(true);
    const docRef = doc(db, "settings", "global");
    setDoc(docRef, companyForm, { merge: true })
      .then(() => {
        toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลบริษัทได้รับการอัปเดตแล้ว" });
        setIsSaving(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: companyForm }));
        setIsSaving(false);
      });
  };

  const handleSaveProfile = async () => {
    if (!db || !user) return;
    setIsSaving(true);
    const docRef = doc(db, "users", user.uid);
    const payload = { ...profileForm, email: user.email };
    setDoc(docRef, payload, { merge: true })
      .then(() => {
        toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว" });
        setIsSaving(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: payload }));
        setIsSaving(false);
      });
  };

  if (loadingSettings || loadingProfile) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-muted-foreground font-sarabun">กำลังโหลดข้อมูลตั้งค่า...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 font-sarabun">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">ตั้งค่าสิทธิ์ผู้ใช้งาน</h1>
        <p className="text-muted-foreground">เฉพาะฝ่ายบริหาร บัญชี และ HR Payroll เท่านั้นที่มีสิทธิ์เข้าถึงระบบนี้</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="profile" className="rounded-lg px-6 py-2.5 gap-2">
            <User className="w-4 h-4" /> ข้อมูลส่วนตัว
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg px-6 py-2.5 gap-2">
            <Building2 className="w-4 h-4" /> ข้อมูลบริษัท
          </TabsTrigger>
          <TabsTrigger value="workflow" className="rounded-lg px-6 py-2.5 gap-2">
            <Clock className="w-4 h-4" /> กฎการทำงาน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg">โปรไฟล์ผู้ใช้งาน</CardTitle>
              <CardDescription>ข้อมูลของคุณที่ใช้ระบุตัวตนในฐานะฝ่ายบริหาร/บัญชี</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>ชื่อ-นามสกุล</Label>
                  <Input 
                    placeholder="กรอกชื่อ-นามสกุล"
                    value={profileForm.displayName} 
                    onChange={e => setProfileForm({...profileForm, displayName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>ตำแหน่งงาน (ที่ได้รับสิทธิ์)</Label>
                  <Select value={profileForm.position} onValueChange={val => setProfileForm({...profileForm, position: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ฝ่ายบริหาร">ฝ่ายบริหาร (Management)</SelectItem>
                      <SelectItem value="บัญชี">บัญชี (Accounting)</SelectItem>
                      <SelectItem value="HR Payroll">HR Payroll</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>วันที่เริ่มทำงาน</Label>
                  <Input 
                    type="date"
                    value={profileForm.startDate} 
                    onChange={e => setProfileForm({...profileForm, startDate: e.target.value})} 
                  />
                </div>
                
                {probationEndDate && (
                  <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-accent uppercase tracking-wider">วันครบประเมิน 119 วันของคุณ</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {format(probationEndDate, "d MMMM yyyy", { locale: th })}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">ระบบคำนวณจากวันที่เริ่มทำงานเพื่อแจ้งเตือนฝ่ายบริหาร</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button className="bg-accent gap-2 min-w-[150px]" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  อัปเดตโปรไฟล์
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลพื้นฐานบริษัท</CardTitle>
              <CardDescription>ใช้สำหรับการออกรายงานเรียกเก็บลูกค้า (Billing)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>ชื่อบริษัท</Label>
                  <Input value={companyForm.companyName} onChange={e => setCompanyForm({...companyForm, companyName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เลขประจำตัวผู้เสียภาษี</Label>
                  <Input value={companyForm.taxId} onChange={e => setCompanyForm({...companyForm, taxId: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>ที่อยู่บริษัท</Label>
                  <Input value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="bg-accent gap-2" onClick={handleSaveCompany} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึกข้อมูลบริษัท
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">กฎการทำงานมาตรฐาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>เวลาเข้างาน</Label>
                  <Input type="time" value={companyForm.standardStartTime} onChange={e => setCompanyForm({...companyForm, standardStartTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เวลาเลิกงาน</Label>
                  <Input type="time" value={companyForm.standardEndTime} onChange={e => setCompanyForm({...companyForm, standardEndTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เวลาพัก (นาที)</Label>
                  <Input type="number" value={companyForm.lunchBreakMinutes} onChange={e => setCompanyForm({...companyForm, lunchBreakMinutes: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button className="bg-accent gap-2" onClick={handleSaveCompany} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึกกฎ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
