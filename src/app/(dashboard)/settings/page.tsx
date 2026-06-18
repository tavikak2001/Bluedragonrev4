
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  Clock, 
  Save, 
  User,
  CalendarDays,
  Loader2,
  AlertCircle,
  Info
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

export default function SettingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // States for tabs
  const [activeTab, setActiveTab] = useState("profile");

  // Company Settings
  const settingsRef = useMemoFirebase(() => db ? doc(db, "settings", "global") : null, [db]);
  const { data: settings, loading: loadingSettings } = useDoc(settingsRef);

  // User Profile
  const userProfileRef = useMemoFirebase(() => (db && user) ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile, loading: loadingProfile } = useDoc(userProfileRef);

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    companyNameEn: "",
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

  // Calculate 119 days
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
        companyNameEn: settings.companyNameEn || "",
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
        toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลโปรไฟล์ส่วนตัวได้รับการอัปเดตแล้ว" });
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
      <p className="text-muted-foreground font-sarabun">กำลังโหลดข้อมูล...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 font-sarabun">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">ตั้งค่าและโปรไฟล์</h1>
        <p className="text-muted-foreground">จัดการข้อมูลส่วนตัวของคุณและตั้งค่าบริษัท</p>
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
              <CardTitle className="text-lg">โปรไฟล์ส่วนตัว</CardTitle>
              <CardDescription>ข้อมูลของคุณที่แสดงในระบบ</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>ชื่อ-นามสกุล</Label>
                  <Input 
                    placeholder="เช่น สมชาย ใจดี"
                    value={profileForm.displayName} 
                    onChange={e => setProfileForm({...profileForm, displayName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>ตำแหน่ง</Label>
                  <Input 
                    placeholder="เช่น ผู้บริหาร, แอดมิน"
                    value={profileForm.position} 
                    onChange={e => setProfileForm({...profileForm, position: e.target.value})} 
                  />
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
                    <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-accent uppercase tracking-wider">วันที่ทำงานครบ 119 วัน</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {format(probationEndDate, "d MMMM yyyy", { locale: th })}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">คำนวณอัตโนมัติจากวันที่เริ่มทำงานเพื่อประเมินผลงาน</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button className="bg-accent gap-2 min-w-[150px]" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึกโปรไฟล์
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลพื้นฐานบริษัท</CardTitle>
              <CardDescription>ข้อมูลนี้จะแสดงในรายงานและใบเรียกเก็บเงินของลูกค้า</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>ชื่อบริษัท (ภาษาไทย)</Label>
                  <Input value={companyForm.companyName} onChange={e => setCompanyForm({...companyForm, companyName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เลขประจำตัวผู้เสียภาษี</Label>
                  <Input value={companyForm.taxId} onChange={e => setCompanyForm({...companyForm, taxId: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์สำนักงาน</Label>
                  <Input value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>ที่อยู่สำนักงานใหญ่</Label>
                  <Input value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="bg-accent gap-2" onClick={handleSaveCompany} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">ตั้งค่าเวลาและกฎการทำงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">เวลาเข้างานมาตรฐาน</Label>
                  <Input type="time" value={companyForm.standardStartTime} onChange={e => setCompanyForm({...companyForm, standardStartTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">เวลาเลิกงานมาตรฐาน</Label>
                  <Input type="time" value={companyForm.standardEndTime} onChange={e => setCompanyForm({...companyForm, standardEndTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">เวลาพัก (นาที)</Label>
                  <Input type="number" value={companyForm.lunchBreakMinutes} onChange={e => setCompanyForm({...companyForm, lunchBreakMinutes: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button className="bg-accent gap-2" onClick={handleSaveCompany} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึกกฎการทำงาน
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
