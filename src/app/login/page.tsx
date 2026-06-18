
'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!auth) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "ยินดีต้อนรับ",
        description: "เข้าสู่ระบบ Blue Dragon สำเร็จ",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let message = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      
      if (error.code === 'auth/user-not-found') {
        message = "ไม่พบบัญชีผู้ใช้นี้ในระบบ";
      } else if (error.code === 'auth/wrong-password') {
        message = "รหัสผ่านไม่ถูกต้อง";
      } else if (error.code === 'auth/invalid-credential') {
        message = "ข้อมูลไม่ถูกต้อง โปรดตรวจสอบอีเมลและรหัสผ่าน";
      }
      
      setErrorMsg(message);
      toast({
        variant: "destructive",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: message,
      });
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sarabun text-primary">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center font-bold text-white shadow-xl rotate-3 mx-auto mb-4 text-2xl">
            BD
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter">Blue Dragon</h1>
          <p className="text-muted-foreground font-medium">ระบบบริหารจัดการพนักงานมืออาชีพ</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 bg-white border-b">
            <CardTitle className="text-2xl text-center font-bold">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-center">
              ระบุบัญชีผู้ใช้งานเพื่อเข้าถึงข้อมูลบริษัท
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              {errorMsg && (
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>เข้าสู่ระบบผิดพลาด</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">อีเมลผู้ใช้งาน</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@bluedragon.com" 
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
                  placeholder="••••••••"
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-accent h-12 text-lg shadow-lg hover:bg-accent/90" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                ล็อกอินเข้าใช้งาน
              </Button>
              <div className="text-center w-full space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">หรือ</span>
                  </div>
                </div>
                <Link href="/register" className="block w-full">
                  <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/5">
                    <UserPlus className="w-4 h-4 mr-2" />
                    สมัครสมาชิกใหม่
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          &copy; 2024 Blue Dragon Construction Co., Ltd. สงวนลิขสิทธิ์
        </p>
      </div>
    </div>
  );
}
