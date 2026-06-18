
'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Loader2, AlertCircle, Shield } from 'lucide-react';
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
        title: "ยินดีต้อนรับกลับ",
        description: "เข้าสู่ระบบฝ่ายบริหารสำเร็จ",
      });
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง เฉพาะเจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้น");
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
          <h1 className="text-4xl font-extrabold tracking-tighter text-primary">BLUE DRAGON</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] mt-2">Management & Payroll System</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-primary text-white text-center py-8">
            <div className="flex justify-center mb-2">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">เข้าสู่ระบบหลังบ้าน</CardTitle>
            <CardDescription className="text-slate-300">สำหรับฝ่ายบริหาร บัญชี และ HR Payroll</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-8">
              {errorMsg && (
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>การเข้าถึงถูกปฏิเสธ</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">อีเมลเจ้าหน้าที่</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@bluedragon.com" 
                  className="h-11 bg-slate-50"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-slate-700">รหัสผ่าน</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="h-11 bg-slate-50"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 shadow-lg text-lg font-bold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                ล็อกอินเข้าใช้งาน
              </Button>
              <div className="text-center w-full space-y-3">
                <Link href="/register" className="block w-full">
                  <Button variant="outline" className="w-full border-slate-200 text-primary hover:bg-slate-50">
                    <UserPlus className="w-4 h-4 mr-2" /> สมัครสมาชิกใหม่ (ฝ่ายบริหาร)
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
