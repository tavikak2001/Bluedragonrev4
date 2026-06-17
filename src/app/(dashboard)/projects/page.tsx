"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const initialProjects = [
  { id: "PRJ001", name: "ไซส์งานสุขุมวิท 24", client: "บริษัท แสนสิริ จำกัด", location: "สุขุมวิท 24 กรุงเทพฯ", start: "01/01/2024", end: "31/12/2024", status: "In Progress" },
  { id: "PRJ002", name: "อาคารใบหยก (ระบบไฟฟ้า)", client: "โรงแรมใบหยก สกาย", location: "ประตูน้ำ กรุงเทพฯ", start: "15/02/2024", end: "15/08/2024", status: "Planning" },
  { id: "PRJ003", name: "สะพานพระราม 9", client: "กรมทางหลวง", location: "พระราม 9 กรุงเทพฯ", start: "10/01/2023", end: "10/06/2024", status: "On Hold" },
  { id: "PRJ004", name: "โรงพยาบาลศิริราช", client: "คณะแพทยศาสตร์", location: "วังหลัง กรุงเทพฯ", start: "01/03/2024", end: "01/03/2025", status: "In Progress" },
];

const statusMap: Record<string, { label: string, color: string }> = {
  "Planning": { label: "กำลังวางแผน", color: "bg-blue-50 text-blue-700" },
  "In Progress": { label: "ดำเนินการอยู่", color: "bg-green-50 text-green-700" },
  "Completed": { label: "เสร็จสิ้นแล้ว", color: "bg-slate-50 text-slate-700" },
  "On Hold": { label: "ระงับชั่วคราว", color: "bg-amber-50 text-amber-700" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter(prj => 
    prj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prj.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prj.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">ข้อมูลโครงการ</h1>
          <p className="text-muted-foreground">จัดการรายละเอียดโครงการ ไซส์งาน และลูกค้า</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> เพิ่มโครงการใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>แบบฟอร์มเพิ่มโครงการ</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="id">รหัสโครงการ</Label>
                <Input id="id" placeholder="ตัวอย่าง PRJ005" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="status">สถานะ</Label>
                <Input id="status" placeholder="เลือกสถานะ" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">ชื่อโครงการ</Label>
                <Input id="name" placeholder="ชื่อโครงการหรือไซส์งาน" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="client">ชื่อลูกค้า / บริษัท</Label>
                <Input id="client" placeholder="ชื่อลูกค้าหรือหน่วยงานจ้างงาน" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="location">สถานที่ปฏิบัติงาน</Label>
                <Input id="location" placeholder="ที่อยู่หรือพิกัดสถานที่ทำงาน" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start">วันที่เริ่ม</Label>
                <Input id="start" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">วันที่สิ้นสุด</Label>
                <Input id="end" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">ยกเลิก</Button>
              <Button className="bg-accent">บันทึกโครงการ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between bg-slate-50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหาชื่อโครงการ หรือลูกค้า..."
              className="pl-8 bg-white border-slate-200 focus-visible:ring-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-slate-200">
              <Filter className="w-4 h-4" /> กรองข้อมูล
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[120px] font-bold">รหัสโครงการ</TableHead>
              <TableHead className="font-bold">โครงการ / ลูกค้า</TableHead>
              <TableHead className="font-bold">สถานที่</TableHead>
              <TableHead className="font-bold">ระยะเวลา</TableHead>
              <TableHead className="font-bold">สถานะ</TableHead>
              <TableHead className="text-right font-bold">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((prj) => (
              <TableRow key={prj.id} className="group hover:bg-secondary/20">
                <TableCell className="font-mono text-xs font-semibold">{prj.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-primary">{prj.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-accent" /> {prj.client}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" /> {prj.location}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {prj.start} - {prj.end}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={`border-none px-3 font-medium ${statusMap[prj.status]?.color || ""}`}
                  >
                    {statusMap[prj.status]?.label || prj.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Edit2 className="w-4 h-4" /> แก้ไขโครงการ
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" /> ลบโครงการ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredProjects.length === 0 && (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-muted-foreground">ไม่พบข้อมูลโครงการที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
