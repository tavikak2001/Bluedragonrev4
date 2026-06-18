
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const logoData = PlaceHolderImages.find(img => img.id === 'company-logo');

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
        description: "เข้าสู่ระบบสำเร็จ",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let message = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      
      if (error.code === 'auth/invalid-credential') {
        message = "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง";
      } else if (error.code === 'auth/user-not-found') {
        message = "ไม่พบบัญชีผู้ใช้นี้";
      } else if (error.code === 'auth/wrong-password') {
        message = "รหัสผ่านไม่ถูกต้อง";
      } else if (error.code === 'auth/api-key-not-valid') {
        message = "API Key ของ Firebase ไม่ถูกต้อง โปรดตรวจสอบการตั้งค่า";
      }
      
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
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6 overflow-hidden border-4 border-accent">
            {logoData && (
              <Image 
                src={logoData.imageUrl} 
                alt="Logo" 
                width={96} 
                height={96} 
                className="object-cover"
                data-ai-hint={logoData.imageHint}
              />
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-primary">BLUE DRAGON</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Perfect Team Co., Ltd.</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-primary text-white text-center py-8">
            <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-slate-300">ระบุอีเมลและรหัสผ่านเพื่อจัดการระบบ</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-8">
              {errorMsg && (
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>เข้าสู่ระบบผิดพลาด</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">อีเมล</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
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
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-12 shadow-lg text-lg font-bold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                เข้าสู่ระบบ
              </Button>
              <div className="text-center w-full space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">ยังไม่มีบัญชี?</span></div>
                </div>
                <Link href="/register" className="block w-full">
                  <Button variant="outline" className="w-full border-slate-200 text-primary hover:bg-slate-50">
                    <UserPlus className="w-4 h-4 mr-2" /> สมัครสมาชิกใหม่
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-tighter">
          &copy; {new Date().getFullYear()} Blue Dragon Perfect Team Co., Ltd. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
