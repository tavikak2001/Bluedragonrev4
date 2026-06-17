
"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Phone, 
  Filter,
  UserPlus
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialEmployees = [
  { id: "EMP001", name: "สมชาย ใจดี", nickname: "ชาย", position: "หัวหน้าหน้างาน", department: "ฝ่ายปฏิบัติการ", phone: "081-234-5678", wage: 800, status: "ทำงานปกติ" },
  { id: "EMP002", name: "วิไลวรรณ รักงาน", nickname: "วิ", position: "สถาปนิก", department: "ฝ่ายออกแบบ", phone: "082-345-6789", wage: 1200, status: "ทำงานปกติ" },
  { id: "EMP003", name: "เกรียงศักดิ์ สายดี", nickname: "ศักดิ์", position: "ช่างไฟฟ้า", department: "วิศวกรรม", phone: "083-456-7890", wage: 600, status: "ลางาน" },
  { id: "EMP004", name: "สมหญิง ขยันหมั่นเพียร", nickname: "หญิง", position: "เจ้าหน้าที่ความปลอดภัย", department: "ความปลอดภัย", phone: "084-567-8901", wage: 750, status: "ทำงานปกติ" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">ข้อมูลพนักงาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลพนักงาน และตรวจสอบสถานะการทำงาน</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 flex items-center gap-2 shadow-lg">
              <UserPlus className="w-4 h-4" /> เพิ่มพนักงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>แบบฟอร์มเพิ่มพนักงาน</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="id">รหัสพนักงาน</Label>
                <Input id="id" placeholder="ตัวอย่าง EMP005" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input id="name" placeholder="ชื่อ นามสกุล" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">ชื่อเล่น</Label>
                <Input id="nickname" placeholder="ชื่อเล่น" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input id="phone" placeholder="08X-XXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">ตำแหน่ง</Label>
                <Input id="position" placeholder="ชื่อตำแหน่งงาน" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">แผนก</Label>
                <Input id="dept" placeholder="ชื่อแผนก" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wage">ค่าแรงรายวัน (บาท)</Label>
                <Input id="wage" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ot">ค่า OT ต่อชั่วโมง (บาท)</Label>
                <Input id="ot" type="number" placeholder="0.00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">ยกเลิก</Button>
              <Button className="bg-accent">บันทึกข้อมูล</Button>
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
              placeholder="ค้นหาด้วยชื่อ หรือรหัส..."
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
              <TableHead className="w-[100px] font-bold">รหัส</TableHead>
              <TableHead className="font-bold">พนักงาน</TableHead>
              <TableHead className="font-bold">ตำแหน่ง/แผนก</TableHead>
              <TableHead className="font-bold">ค่าแรงรายวัน</TableHead>
              <TableHead className="font-bold">สถานะ</TableHead>
              <TableHead className="text-right font-bold">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id} className="group hover:bg-secondary/20">
                <TableCell className="font-mono text-xs font-semibold">{emp.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-200 group-hover:border-accent transition-colors">
                      <AvatarImage src={`https://picsum.photos/seed/${emp.id}/40/40`} />
                      <AvatarFallback>{emp.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-primary">{emp.name}</ ({emp.nickname})</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 text-accent" /> {emp.phone}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-medium">{emp.position}</p>
                  <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                </TableCell>
                <TableCell className="text-sm font-bold text-primary">฿{emp.wage.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant={emp.status === 'ทำงานปกติ' ? 'secondary' : 'outline'}
                    className={emp.status === 'ทำงานปกติ' ? 'bg-green-50 text-green-700 hover:bg-green-50 border-none px-3' : 'px-3'}
                  >
                    {emp.status}
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
                        <Edit2 className="w-4 h-4" /> แก้ไขข้อมูล
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" /> ลบพนักงาน
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredEmployees.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">ไม่พบข้อมูลพนักงานที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
