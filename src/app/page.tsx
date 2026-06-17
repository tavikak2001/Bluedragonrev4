
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-accent rounded-2xl rotate-3 shadow-lg"></div>
        <p className="text-primary font-medium">กำลังโหลดระบบ...</p>
      </div>
    </div>
  );
}
