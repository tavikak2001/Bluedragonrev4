
'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับเข้าสู่ระบบ Blue Dragon",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ข้อผิดพลาด",
        description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center font-bold text-white shadow-xl rotate-3 mx-auto mb-4">
            BD
          </div>
          <h1 className="text-3xl font-bold text-primary">Blue Dragon</h1>
          <p className="text-muted-foreground">Management System</p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-center">
              กรอกข้อมูลเพื่อเข้าใช้งานระบบบริหารจัดการ
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
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
                  required 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-accent h-12 text-lg shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    เข้าสู่ระบบ
                  </>
                )}
              </Button>
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
