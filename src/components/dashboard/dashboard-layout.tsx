
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Search,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { name: "พนักงาน", href: "/employees", icon: Users },
  { name: "โครงการ", href: "/projects", icon: Briefcase },
  { name: "ลงเวลาทำงาน", href: "/timesheets", icon: Clock },
  { name: "รายงาน", href: "/reports", icon: FileBarChart },
  { name: "ตั้งค่า", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-primary text-primary-foreground transition-all duration-300 ease-in-out flex flex-col z-30 shadow-xl",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg rotate-3">
            BD
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">Blue Dragon</span>
              <span className="text-[10px] opacity-70 uppercase tracking-widest">Management</span>
            </div>
          )}
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
            className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm">ออกจากระบบ</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
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
            <div className="relative w-64 max-w-sm hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ค้นหา..."
                className="pl-8 bg-muted/50 border-none focus-visible:ring-accent"
              />
            </div>
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
                    <p className="text-sm font-bold text-primary">ผู้ดูแลระบบ</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Blue Dragon</p>
                  </div>
                  <Avatar className="w-9 h-9 border-2 border-accent">
                    <AvatarImage src="https://picsum.photos/seed/admin/40/40" />
                    <AvatarFallback className="bg-primary text-white">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>โปรไฟล์</DropdownMenuItem>
                <DropdownMenuItem>ตั้งค่าบริษัท</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">ออกจากระบบ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
