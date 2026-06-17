'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "ข้อผิดพลาด",
        description: "รหัสผ่านไม่ตรงกัน โปรดตรวจสอบอีกครั้ง",
      });
      return;
    }
    
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "สมัครสมาชิกสำเร็จ",
        description: "ยินดีต้อนรับ! บัญชีของคุณถูกสร้างเรียบร้อยแล้ว",
      });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = "เกิดข้อผิดพลาดในการลงทะเบียน";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "อีเมลนี้ถูกใช้งานแล้ว";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      }
      
      toast({
        variant: "destructive",
        title: "ข้อผิดพลาด",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sarabun">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center font-bold text-white shadow-xl rotate-3 mx-auto mb-4">
            BD
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Blue Dragon</h1>
          <p className="text-muted-foreground">ลงทะเบียนสมาชิกใหม่</p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">สมัครสมาชิก</CardTitle>
            <CardDescription className="text-center">
              กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีผู้ใช้งานใหม่
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="example@bluedragon.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-accent h-12 text-lg shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    ลงทะเบียน
                  </>
                )}
              </Button>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          &copy; 2024 Blue Dragon Construction Co., Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}