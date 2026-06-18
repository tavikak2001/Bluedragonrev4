'use client';

import React, { useState, useMemo } from "react";
import { 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Phone, 
  Filter,
  UserPlus,
  Loader2,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function EmployeesPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    nickname: "",
    phone: "",
    position: "",
    department: "",
    dailyWage: 0,
    otRatePerHour: 0,
    status: "Active"
  });

  const employeesRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "employees");
  }, [db]);

  const { data: employees, loading } = useCollection(employeesRef);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(emp => 
      (emp.firstName + " " + emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const resetForm = () => {
    setFormData({
      employeeId: "",
      firstName: "",
      lastName: "",
      nickname: "",
      phone: "",
      position: "",
      department: "",
      dailyWage: 0,
      otRatePerHour: 0,
      status: "Active"
    });
    setEditingEmployee(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId || "",
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      nickname: employee.nickname || "",
      phone: employee.phone || "",
      position: employee.position || "",
      department: employee.department || "",
      dailyWage: employee.dailyWage || 0,
      otRatePerHour: employee.otRatePerHour || 0,
      status: employee.status || "Active"
    });
    setIsDialogOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !formData.employeeId) return;

    setIsSaving(true);
    const docRef = doc(db, "employees", formData.employeeId);
    const payload = {
      ...formData,
      dailyWage: Number(formData.dailyWage),
      otRatePerHour: Number(formData.otRatePerHour),
      updatedAt: serverTimestamp()
    };

    // ไม่ใช้ await เพื่อให้ UI ตอบสนองทันที
    setDoc(docRef, payload, { merge: true })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    // ปิด Dialog และแจ้งเตือนทันที
    toast({ 
      title: editingEmployee ? "อัปเดตสำเร็จ" : "บันทึกสำเร็จ", 
      description: `ข้อมูลพนักงาน ${formData.firstName} ได้รับการส่งข้อมูลแล้ว` 
    });
    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (employee: any) => {
    if (!db || !confirm(`ยืนยันการลบข้อมูลพนักงาน: ${employee.firstName} ${employee.lastName}?`)) return;
    
    const docRef = doc(db, "employees", employee.id);
    deleteDoc(docRef)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "ลบสำเร็จ", description: "ลบข้อมูลพนักงานออกจากระบบแล้ว" });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">ข้อมูลพนักงาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลพนักงาน และตรวจสอบสถานะการทำงาน</p>
        </div>
        <Button 
          onClick={handleOpenAddDialog}
          className="bg-accent hover:bg-accent/90 flex items-center gap-2 shadow-lg"
        >
          <UserPlus className="w-4 h-4" /> เพิ่มพนักงานใหม่
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {editingEmployee ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEmployee}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="font-semibold">รหัสพนักงาน</Label>
                <Input 
                  id="employeeId" 
                  required 
                  disabled={!!editingEmployee}
                  value={formData.employeeId} 
                  onChange={e => setFormData({...formData, employeeId: e.target.value})} 
                  placeholder="เช่น EMP001" 
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="font-semibold">สถานะการทำงาน</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">ทำงานปกติ (Active)</option>
                  <option value="On Leave">ลางาน (On Leave)</option>
                  <option value="Inactive">พ้นสภาพพนักงาน (Inactive)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-semibold">ชื่อ</Label>
                <Input id="firstName" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="ชื่อจริง" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-semibold">นามสกุล</Label>
                <Input id="lastName" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="นามสกุล" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname" className="font-semibold">ชื่อเล่น</Label>
                <Input id="nickname" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} placeholder="ชื่อเล่น" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">เบอร์โทรศัพท์</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08X-XXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="font-semibold">ตำแหน่ง</Label>
                <Input id="position" required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="เช่น โฟร์แมน, ช่างไฟ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept" className="font-semibold">แผนก</Label>
                <Input id="dept" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="เช่น ฝ่ายก่อสร้าง" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wage" className="font-semibold">ค่าแรงรายวัน (บาท)</Label>
                <Input id="wage" type="number" required value={formData.dailyWage} onChange={e => setFormData({...formData, dailyWage: Number(e.target.value)})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ot" className="font-semibold">ค่า OT ต่อชั่วโมง (บาท)</Label>
                <Input id="ot" type="number" value={formData.otRatePerHour} onChange={e => setFormData({...formData, otRatePerHour: Number(e.target.value)})} placeholder="0.00" />
              </div>
            </div>
            <DialogFooter className="gap-3 sm:gap-0">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button className="bg-accent" type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> กำลังดำเนินการ...
                  </>
                ) : "บันทึกข้อมูลพนักงาน"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between bg-slate-50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหาชื่อ, รหัส, หรือชื่อเล่น..."
              className="pl-8 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground font-medium">กำลังโหลดข้อมูลพนักงาน...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[100px] font-bold text-primary">รหัส</TableHead>
                <TableHead className="font-bold text-primary">พนักงาน</TableHead>
                <TableHead className="font-bold text-primary">ตำแหน่ง/แผนก</TableHead>
                <TableHead className="font-bold text-primary">ค่าแรงรายวัน</TableHead>
                <TableHead className="font-bold text-primary">สถานะ</TableHead>
                <TableHead className="text-right font-bold text-primary">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="group hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs font-bold text-slate-500">{emp.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarImage src={emp.profileImageUrl || `https://picsum.photos/seed/${emp.id}/40/40`} />
                        <AvatarFallback className="bg-primary text-white">{emp.nickname?.charAt(0) || 'E'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-primary">{emp.firstName} {emp.lastName} ({emp.nickname})</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3 text-accent" /> {emp.phone || '-'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-700">{emp.position}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.department || 'ไม่ระบุแผนก'}</p>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-primary">฿{Number(emp.dailyWage || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={emp.status === 'Active' ? 'secondary' : 'outline'}
                      className={
                        emp.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border-none' 
                          : emp.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700 border-none'
                          : 'bg-slate-50 text-slate-400 border-none'
                      }
                    >
                      {emp.status === 'Active' ? 'ทำงานปกติ' : emp.status === 'On Leave' ? 'ลางาน' : 'พ้นสภาพ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleOpenEditDialog(emp)}>
                          <Edit2 className="w-4 h-4 text-blue-500" /> แก้ไขข้อมูล
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={() => handleDelete(emp)}>
                          <Trash2 className="w-4 h-4" /> ลบพนักงาน
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}