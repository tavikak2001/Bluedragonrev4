
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
  Loader2
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function EmployeesPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !formData.employeeId) return;

    setIsAdding(true);
    const docRef = doc(db, "employees", formData.employeeId);
    
    setDoc(docRef, {
      ...formData,
      dailyWage: Number(formData.dailyWage),
      otRatePerHour: Number(formData.otRatePerHour),
    }, { merge: true })
      .then(() => {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูลพนักงานเรียบร้อยแล้ว" });
        setIsAdding(false);
        // Reset form would go here
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: formData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsAdding(false);
      });
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("ยืนยันการลบข้อมูลพนักงาน?")) return;
    
    const docRef = doc(db, "employees", id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "ลบสำเร็จ", description: "ลบข้อมูลพนักงานออกจากระบบแล้ว" });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="animate-in fade-in duration-500">
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
            <form onSubmit={handleAddEmployee}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">รหัสพนักงาน</Label>
                  <Input id="employeeId" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="EMP001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <Input id="firstName" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="ชื่อ" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input id="lastName" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="นามสกุล" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">ชื่อเล่น</Label>
                  <Input id="nickname" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} placeholder="ชื่อเล่น" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08X-XXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">ตำแหน่ง</Label>
                  <Input id="position" required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="ชื่อตำแหน่งงาน" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">แผนก</Label>
                  <Input id="dept" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="ชื่อแผนก" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wage">ค่าแรงรายวัน (บาท)</Label>
                  <Input id="wage" type="number" required value={formData.dailyWage} onChange={e => setFormData({...formData, dailyWage: Number(e.target.value)})} placeholder="0.00" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button">ยกเลิก</Button>
                <Button className="bg-accent" type="submit" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกข้อมูล"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> กรองข้อมูล
          </Button>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
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
                  <TableCell className="font-mono text-xs font-semibold">{emp.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-slate-200">
                        <AvatarImage src={emp.profileImageUrl || `https://picsum.photos/seed/${emp.id}/40/40`} />
                        <AvatarFallback>{emp.nickname?.charAt(0) || 'E'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-primary">{emp.firstName} {emp.lastName} ({emp.nickname})</p>
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
                  <TableCell className="text-sm font-bold text-primary">฿{Number(emp.dailyWage || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={emp.status === 'Active' ? 'secondary' : 'outline'}
                      className={emp.status === 'Active' ? 'bg-green-50 text-green-700 border-none' : ''}
                    >
                      {emp.status === 'Active' ? 'ทำงานปกติ' : 'อื่นๆ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Edit2 className="w-4 h-4" /> แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="w-4 h-4" /> ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {!loading && filteredEmployees.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">ไม่พบข้อมูลพนักงานที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
