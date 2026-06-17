
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-accent rounded-2xl rotate-3 shadow-lg"></div>
          <p className="text-primary font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
