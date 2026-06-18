
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  const logoData = PlaceHolderImages.find(img => img.id === 'company-logo');

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
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce overflow-hidden border-4 border-accent">
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
        <div className="text-center">
          <h1 className="text-2xl font-black text-primary tracking-tighter">BLUE DRAGON</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest animate-pulse">กำลังเตรียมความพร้อมของระบบ...</p>
        </div>
      </div>
    </div>
  );
}
