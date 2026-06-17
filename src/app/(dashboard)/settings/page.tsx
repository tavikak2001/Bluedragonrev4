"use client";

import React from "react";
import { 
  Settings, 
  Building2, 
  Clock, 
  Wallet, 
  Save, 
  Image as ImageIcon,
  Bell,
  ShieldCheck,
  CalendarDays
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

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "บันทึกการตั้งค่าสำเร็จ",
      description: "ข้อมูลระบบของคุณได้รับการอัปเดตเรียบร้อยแล้ว",
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">จัดการข้อมูลบริษัท กฎการทำงาน และความปลอดภัยของระบบ</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="company" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-lg px-6 py-2.5 gap-2">
            <Building2 className="w-4 h-4" /> ข้อมูลบริษัท
          </TabsTrigger>
          <TabsTrigger value="workflow" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-lg px-6 py-2.5 gap-2">
            <Clock className="w-4 h-4" /> กฎการทำงาน
          </TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-lg px-6 py-2.5 gap-2">
            <Wallet className="w-4 h-4" /> อัตราค่าแรง
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-lg px-6 py-2.5 gap-2">
            <Bell className="w-4 h-4" /> การแจ้งเตือน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลพื้นฐานบริษัท</CardTitle>
              <CardDescription>ข้อมูลนี้จะแสดงในรายงานและใบเรียกเก็บเงินของลูกค้า</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="space-y-4 shrink-0">
                  <Label>โลโก้บริษัท</Label>
                  <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-200 transition-colors">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px] font-medium">อัปโหลดรูป</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyName">ชื่อบริษัท (ภาษาไทย)</Label>
                    <Input id="companyName" defaultValue="บริษัท บลูดราก้อน คอนสตรัคชั่น จำกัด" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyNameEn">ชื่อบริษัท (English)</Label>
                    <Input id="companyNameEn" defaultValue="Blue Dragon Construction Co., Ltd." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                    <Input id="taxId" defaultValue="0105560000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์สำนักงาน</Label>
                    <Input id="phone" defaultValue="02-123-4567" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">ที่อยู่สำนักงานใหญ่</Label>
                    <Input id="address" defaultValue="99/9 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110" />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="bg-accent gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">ตั้งค่าเวลาและกฎการทำงาน</CardTitle>
              <CardDescription>กำหนดเวลามาตรฐานเพื่อใช้คำนวณการมาสายและการเลิกงาน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" /> เวลาเข้างานมาตรฐาน
                  </Label>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" /> เวลาเลิกงานมาตรฐาน
                  </Label>
                  <Input type="time" defaultValue="17:00" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-600" /> เวลาพัก (นาที)
                  </Label>
                  <Input type="number" defaultValue="60" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary">การตั้งค่าขั้นสูง</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">อนุญาตให้พนักงานลงเวลาเอง</p>
                      <p className="text-[10px] text-muted-foreground">พนักงานสามารถเช็คอินผ่านมือถือด้วยตัวเองเมื่ออยู่ในพิกัดโครงการ</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">ระบบอนุมัติ OT อัตโนมัติ</p>
                      <p className="text-[10px] text-muted-foreground">อนุมัติชั่วโมงล่วงเวลาทันทีหากมีการลงเวลาออกหลัง 17:00 น.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button className="bg-accent gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" /> บันทึกกฎการทำงาน
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="border-none shadow-sm rounded-xl">
               <CardHeader>
                 <CardTitle className="text-lg">อัตราค่าแรงมาตรฐาน</CardTitle>
                 <CardDescription>ค่าเริ่มต้นสำหรับพนักงานใหม่</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label>ค่าแรงขั้นต่ำต่อวัน (บาท)</Label>
                   <Input type="number" defaultValue="450" />
                 </div>
                 <div className="space-y-2">
                   <Label>ตัวคูณค่า OT (เท่าของค่าแรงปกติ)</Label>
                   <Input type="number" step="0.1" defaultValue="1.5" />
                 </div>
                 <Button className="w-full bg-primary mt-4" onClick={handleSave}>อัปเดตอัตราพื้นฐาน</Button>
               </CardContent>
             </Card>

             <Card className="border-none shadow-sm rounded-xl">
               <CardHeader>
                 <CardTitle className="text-lg">ความปลอดภัย</CardTitle>
                 <CardDescription>จัดการสิทธิ์และการเข้าถึงข้อมูล</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm font-bold">เปลี่ยนรหัสผ่าน</p>
                      <p className="text-[10px] text-muted-foreground">เปลี่ยนรหัสผ่านสำหรับบัญชีผู้ดูแลระบบ</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <Settings className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-bold">ประวัติการเข้าใช้งาน</p>
                      <p className="text-[10px] text-muted-foreground">ตรวจสอบประวัติการล็อกอินและการแก้ไขข้อมูล</p>
                    </div>
                 </div>
               </CardContent>
             </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
