'use client';

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RegisterPage() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    if (!auth) {
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบ Firebase ได้ โปรดตรวจสอบการตั้งค่า Config");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("รหัสผ่านไม่ตรงกัน โปรดตรวจสอบอีกครั้ง");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบ Blue Dragon",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = "";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = "อีเมลนี้ถูกใช้งานแล้วในระบบ";
          break;
        case 'auth/invalid-email':
          message = "รูปแบบอีเมลไม่ถูกต้อง";
          break;
        case 'auth/weak-password':
          message = "รหัสผ่านไม่ปลอดภัยพอ (ต้องมีอย่างน้อย 6 ตัวอักษร)";
          break;
        case 'auth/operation-not-allowed':
          message = "ระบบลงทะเบียนด้วยอีเมลยังไม่ถูกเปิดใช้งานใน Firebase Console";
          break;
        case 'auth/network-request-failed':
          message = "การเชื่อมต่อเครือข่ายล้มเหลว โปรดตรวจสอบอินเทอร์เน็ต";
          break;
        case 'auth/internal-error':
          message = "เกิดข้อผิดพลาดภายในระบบ Firebase";
          break;
        default:
          message = `เกิดข้อผิดพลาด: ${error.message} (${error.code})`;
      }
      
      setErrorMsg(message);
      toast({
        variant: "destructive",
        title: "ลงทะเบียนไม่สำเร็จ",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sarabun">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center font-bold text-white shadow-xl rotate-3 mx-auto mb-4 text-2xl">
            BD
          </div>
          <h1 className="text-3xl font-bold text-primary">Blue Dragon</h1>
          <p className="text-muted-foreground">ลงทะเบียนเพื่อจัดการข้อมูลพนักงาน</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 bg-white border-b">
            <CardTitle className="text-2xl text-center">สมัครสมาชิกใหม่</CardTitle>
            <CardDescription className="text-center">
              กรอกข้อมูลด้านล่างเพื่อสร้างบัญชี
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4 pt-6">
              {errorMsg && (
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>พบข้อผิดพลาด</AlertTitle>
                  <AlertDescription className="font-medium">{errorMsg}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
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
                  placeholder="กำหนดรหัสผ่าน (6 ตัวขึ้นไป)"
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
              <Button type="submit" className="w-full bg-accent h-12 text-lg shadow-lg hover:bg-accent/90" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    กำลังสร้างบัญชี...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    ยืนยันลงทะเบียน
                  </>
                )}
              </Button>
              <Link href="/login" className="w-full text-center">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ย้อนกลับไปหน้าเข้าสู่ระบบ
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          &copy; 2024 Blue Dragon Construction Co., Ltd.
        </p>
      </div>
    </div>
  );
}