
'use client';

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Clock,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  Bell,
  User as UserIcon,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { name: "พนักงาน", href: "/employees", icon: Users },
  { name: "โครงการ", href: "/projects", icon: Briefcase },
  { name: "ลงเวลาทำงาน", href: "/timesheets", icon: Clock },
  { name: "สรุปรายวัน", href: "/attendance-report", icon: ClipboardCheck },
  { name: "รายงาน/AI", href: "/reports", icon: FileBarChart },
  { name: "ตั้งค่า", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const userProfileRef = useMemoFirebase(() => (db && user) ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProfileRef);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "ออกจากระบบแล้ว",
        description: "ขอบคุณที่ใช้งานระบบ Blue Dragon",
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sarabun">
      <aside
        className={cn(
          "bg-primary text-primary-foreground transition-all duration-300 ease-in-out flex flex-col z-30 shadow-xl",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="flex flex-col leading-tight overflow-hidden text-white">
            <span className="font-bold text-lg tracking-tighter whitespace-nowrap">BLUE DRAGON</span>
            {isSidebarOpen && (
              <span className="text-[10px] opacity-70 uppercase tracking-widest">PERFECT TEAM</span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-white/10 text-white/70 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "scale-110")} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm font-medium">ออกจากระบบ</span>}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-primary hover:bg-secondary"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-bold text-primary hidden md:block">
              {navItems.find(item => item.href === pathname)?.name || "Blue Dragon"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 hover:bg-secondary flex items-center gap-3 h-auto">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-primary truncate max-w-[120px]">
                      {profile?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้งาน'}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">{profile?.position || 'แอดมิน'}</p>
                  </div>
                  <Avatar className="w-9 h-9 border-2 border-accent">
                    <AvatarFallback className="bg-primary text-white">
                      {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>บัญชีผู้ใช้งาน</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer w-full">
                    <UserIcon className="w-4 h-4" /> ข้อมูลส่วนตัว
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer w-full">
                    <Settings className="w-4 h-4" /> ตั้งค่าบริษัท
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive font-bold flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
