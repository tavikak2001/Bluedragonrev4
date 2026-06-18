
'use client';

import React, { useState, useMemo } from "react";
import { 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserPlus,
  Loader2,
  CalendarDays,
  ShieldCheck,
  UserMinus,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { addDays, format, parseISO, isValid } from 'date-fns';
import { th } from 'date-fns/locale';

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
    startDate: new Date().toISOString().split('T')[0],
    status: "Active"
  });

  const employeesRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "employees");
  }, [db]);

  const { data: employees, loading } = useCollection(employeesRef);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    const term = searchTerm.toLowerCase();
    return employees.filter(emp => 
      (emp.firstName + " " + (emp.lastName || "")).toLowerCase().includes(term) || 
      emp.employeeId?.toLowerCase().includes(term) ||
      emp.nickname?.toLowerCase().includes(term)
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
      startDate: new Date().toISOString().split('T')[0],
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
      startDate: employee.startDate || new Date().toISOString().split('T')[0],
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

    setDoc(docRef, payload, { merge: true })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: payload,
        }));
      });

    toast({ 
      title: editingEmployee ? "อัปเดตข้อมูลแล้ว" : "เพิ่มพนักงานใหม่แล้ว", 
      description: `ข้อมูลพนักงานได้รับการบันทึกเรียบร้อยแล้ว` 
    });
    
    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleResign = (employee: any) => {
    if (!db || !confirm(`ยืนยันการบันทึก "พ้นสภาพ" ของพนักงาน: ${employee.firstName} ${employee.lastName}?`)) return;
    
    const docRef = doc(db, "employees", employee.id);
    const payload = { status: "Inactive", updatedAt: serverTimestamp() };
    
    setDoc(docRef, payload, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: payload
        }));
      });
    
    toast({ title: "บันทึกการลาออกสำเร็จ", description: "พนักงานพ้นสภาพจากการปฏิบัติงานแล้ว" });
  };

  const handleDelete = (employee: any) => {
    if (!db || !confirm(`ยืนยันการลบข้อมูลพนักงานถาวร: ${employee.firstName} ${employee.lastName}?`)) return;
    
    const docRef = doc(db, "employees", employee.id);
    deleteDoc(docRef)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        }));
      });
    
    toast({ title: "ลบสำเร็จ", description: "ลบข้อมูลออกจากระบบแล้ว" });
  };

  const get119Day = (dateStr: string) => {
    if (!dateStr) return null;
    const date = parseISO(dateStr);
    if (!isValid(date)) return null;
    return addDays(date, 119);
  };

  return (
    <div className="animate-in fade-in duration-500 font-sarabun">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">ข้อมูลพนักงาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลพนักงาน ตรวจสอบสถานะ และบันทึกการลาออก</p>
        </div>
        <Button 
          onClick={handleOpenAddDialog}
          className="bg-accent hover:bg-accent/90 flex items-center gap-2 shadow-lg h-11 px-6"
        >
          <UserPlus className="w-5 h-5" /> เพิ่มพนักงานใหม่
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {editingEmployee ? "แก้ไขข้อมูลพนักงาน" : "ลงทะเบียนพนักงานใหม่"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEmployee}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="font-bold">รหัสพนักงาน <span className="text-red-500">*</span></Label>
                <Input 
                  id="employeeId" 
                  required 
                  disabled={!!editingEmployee}
                  value={formData.employeeId} 
                  onChange={e => setFormData({...formData, employeeId: e.target.value})} 
                  placeholder="EMP001" 
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">สถานะ</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-accent"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">ทำงานปกติ (Active)</option>
                  <option value="On Leave">ลางาน (On Leave)</option>
                  <option value="Inactive">พ้นสภาพ/ลาออก (Inactive)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">วันที่เริ่มทำงาน <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  required 
                  value={formData.startDate} 
                  onChange={e => setFormData({...formData, startDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">ชื่อ</Label>
                <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="ชื่อจริง" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">นามสกุล</Label>
                <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="นามสกุล" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">ชื่อเล่น</Label>
                <Input value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} placeholder="ชื่อเล่น" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">เบอร์โทรศัพท์</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08X-XXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">ตำแหน่ง</Label>
                <Input required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="เช่น โฟร์แมน" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">แผนก</Label>
                <Input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="ฝ่ายก่อสร้าง" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">ค่าแรงรายวัน</Label>
                <Input type="number" required value={formData.dailyWage} onChange={e => setFormData({...formData, dailyWage: Number(e.target.value)})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">ค่า OT/ชั่วโมง</Label>
                <Input type="number" value={formData.otRatePerHour} onChange={e => setFormData({...formData, otRatePerHour: Number(e.target.value)})} placeholder="0.00" />
              </div>
              
              {formData.startDate && formData.status === "Active" && (
                <div className="md:col-span-3 p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-accent">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-bold">วันครบประเมินผลงาน (119 วัน)</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {get119Day(formData.startDate) ? format(get119Day(formData.startDate)!, "d MMMM yyyy", { locale: th }) : "-"}
                  </span>
                </div>
              )}
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" type="button" className="h-11 px-8" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button className="bg-accent h-11 px-8" type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกข้อมูล"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหารหัส, ชื่อ, หรือชื่อเล่น..."
              className="pl-10 bg-white border-slate-200 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            พนักงาน Active: <span className="text-green-600 font-bold">{employees?.filter(e => e.status === 'Active').length || 0}</span> / ทั้งหมด {employees?.length || 0} รายชื่อ
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="text-muted-foreground font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[100px] font-bold text-primary text-xs">รหัสพนักงาน</TableHead>
                  <TableHead className="font-bold text-primary">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="font-bold text-primary">ตำแหน่ง</TableHead>
                  <TableHead className="font-bold text-primary">ครบ 119 วัน</TableHead>
                  <TableHead className="font-bold text-primary">สถานะ</TableHead>
                  <TableHead className="text-right font-bold text-primary">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => {
                  const day119 = get119Day(emp.startDate);
                  const isInactive = emp.status === 'Inactive';
                  return (
                    <TableRow key={emp.id} className={`group hover:bg-slate-50/80 border-b border-slate-50 ${isInactive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                      <TableCell className="font-mono text-[10px] font-bold text-slate-400">{emp.employeeId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border-2 border-white shadow-sm shrink-0">
                            <AvatarFallback className={`${isInactive ? 'bg-slate-300' : 'bg-primary'} text-white text-xs font-bold`}>
                              {emp.firstName?.charAt(0)}{emp.nickname?.charAt(0) || emp.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={`text-sm font-bold ${isInactive ? 'text-slate-500 line-through' : 'text-primary'}`}>{emp.firstName} {emp.lastName}</p>
                            <p className="text-[10px] text-muted-foreground">ชื่อเล่น: {emp.nickname || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold text-slate-700">{emp.position}</p>
                        <p className="text-[10px] text-muted-foreground">{emp.department || "-"}</p>
                      </TableCell>
                      <TableCell>
                        {!isInactive && day119 ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {format(day119, "dd/MM/yyyy")}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            emp.status === 'Active' 
                              ? 'bg-green-50 text-green-700 border-none' 
                              : emp.status === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border-none'
                              : 'bg-red-50 text-red-700 border-none'
                          }
                        >
                          {emp.status === 'Active' ? 'ทำงานปกติ' : emp.status === 'On Leave' ? 'ลางาน' : 'พ้นสภาพ/ลาออก'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 p-1">
                            <DropdownMenuItem className="gap-2 cursor-pointer py-2" onClick={() => handleOpenEditDialog(emp)}>
                              <Edit2 className="w-4 h-4 text-blue-500" /> แก้ไขข้อมูล
                            </DropdownMenuItem>
                            {!isInactive && (
                              <DropdownMenuItem className="gap-2 cursor-pointer py-2 text-red-600 font-bold" onClick={() => handleResign(emp)}>
                                <UserMinus className="w-4 h-4" /> บันทึกพ้นสภาพ
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive cursor-pointer py-2" onClick={() => handleDelete(emp)}>
                              <Trash2 className="w-4 h-4" /> ลบถาวร
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
