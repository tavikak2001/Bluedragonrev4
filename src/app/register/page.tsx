
'use client';

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!auth || !db) {
      setErrorMsg("ระบบไม่พร้อมใช้งานชั่วคราว");
      return;
    }

    if (!position) {
      setErrorMsg("โปรดระบุตำแหน่งงานที่ได้รับอนุญาต");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("รหัสผ่านไม่ตรงกัน");
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // บันทึกโปรไฟล์ลง Firestore ทันที
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName,
        position,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: `ยินดีต้อนรับเข้าสู่ระบบ ${position}`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      let message = "เกิดข้อผิดพลาดในการลงทะเบียน";
      if (error.code === 'auth/email-already-in-use') message = "อีเมลนี้ถูกใช้งานแล้ว";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sarabun">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tighter">BLUE DRAGON</h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-1">INTERNAL MANAGEMENT SYSTEM</p>
        </div>

        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary text-white py-6">
            <CardTitle className="text-xl text-center">ลงทะเบียนฝ่ายบริหาร/บัญชี</CardTitle>
            <CardDescription className="text-slate-300 text-center text-xs">เฉพาะพนักงานกลุ่ม HR, Payroll และผู้บริหารเท่านั้น</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4 pt-6">
              {errorMsg && (
                <Alert variant="destructive" className="bg-destructive/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>พบข้อผิดพลาด</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label>ชื่อ-นามสกุล</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="ระบุชื่อเพื่อใช้ในระบบ" />
              </div>

              <div className="space-y-2">
                <Label>ตำแหน่งงาน (ที่ได้รับสิทธิ์)</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="เลือกกลุ่มงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ฝ่ายบริหาร">ฝ่ายบริหาร (Management)</SelectItem>
                    <SelectItem value="บัญชี">บัญชี (Accounting)</SelectItem>
                    <SelectItem value="HR Payroll">HR Payroll</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>อีเมลหน่วยงาน</Label>
                <Input type="email" placeholder="example@bluedragon.com" className="bg-slate-50" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>รหัสผ่าน</Label>
                <Input type="password" className="bg-slate-50" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>ยืนยันรหัสผ่าน</Label>
                <Input type="password" className="bg-slate-50" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-12 shadow-lg font-bold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                ยืนยันเพื่อเข้าใช้งาน
              </Button>
              <Link href="/login" className="w-full text-center">
                <Button variant="ghost" className="text-muted-foreground hover:bg-slate-50">
                  <ArrowLeft className="w-4 h-4 mr-2" /> ย้อนกลับไปหน้าล็อกอิน
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
