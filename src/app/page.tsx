
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sarabun">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-primary tracking-tighter animate-pulse">BLUE DRAGON</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-2">กำลังเตรียมความพร้อมของระบบ...</p>
        </div>
      </div>
    </div>
  );
}
