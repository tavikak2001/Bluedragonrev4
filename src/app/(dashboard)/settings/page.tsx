
"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Clock, 
  Wallet, 
  Save, 
  Image as ImageIcon,
  Bell,
  ShieldCheck,
  CalendarDays,
  Loader2
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const settingsRef = useMemoFirebase(() => db ? doc(db, "settings", "global") : null, [db]);
  const { data: settings, loading } = useDoc(settingsRef);

  const [formData, setFormData] = useState({
    companyName: "",
    companyNameEn: "",
    taxId: "",
    phone: "",
    address: "",
    standardStartTime: "08:00",
    standardEndTime: "17:00",
    lunchBreakMinutes: "60"
  });

  useEffect(() => {
    if (settings) {
      setFormData({
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

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    
    const docRef = doc(db, "settings", "global");
    setDoc(docRef, formData, { merge: true })
      .then(() => {
        toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลระบบของคุณได้รับการอัปเดตแล้ว" });
        setIsSaving(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData }));
        setIsSaving(false);
      });
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-muted-foreground">กำลังโหลดข้อมูลการตั้งค่า...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">จัดการข้อมูลบริษัท กฎการทำงาน และความปลอดภัยของระบบ</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="company" className="rounded-lg px-6 py-2.5 gap-2">
            <Building2 className="w-4 h-4" /> ข้อมูลบริษัท
          </TabsTrigger>
          <TabsTrigger value="workflow" className="rounded-lg px-6 py-2.5 gap-2">
            <Clock className="w-4 h-4" /> กฎการทำงาน
          </TabsTrigger>
        </TabsList>

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
                  <Input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>ชื่อบริษัท (English)</Label>
                  <Input value={formData.companyNameEn} onChange={e => setFormData({...formData, companyNameEn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เลขประจำตัวผู้เสียภาษี</Label>
                  <Input value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์สำนักงาน</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>ที่อยู่สำนักงานใหญ่</Label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="bg-accent gap-2" onClick={handleSave} disabled={isSaving}>
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
                  <Input type="time" value={formData.standardStartTime} onChange={e => setFormData({...formData, standardStartTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">เวลาเลิกงานมาตรฐาน</Label>
                  <Input type="time" value={formData.standardEndTime} onChange={e => setFormData({...formData, standardEndTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">เวลาพัก (นาที)</Label>
                  <Input type="number" value={formData.lunchBreakMinutes} onChange={e => setFormData({...formData, lunchBreakMinutes: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button className="bg-accent gap-2" onClick={handleSave} disabled={isSaving}>
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
