
"use client";

import React, { useState, useMemo } from "react";
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
  Filter,
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

const statusMap: Record<string, { label: string, color: string }> = {
  "Planning": { label: "กำลังวางแผน", color: "bg-blue-50 text-blue-700" },
  "In Progress": { label: "ดำเนินการอยู่", color: "bg-green-50 text-green-700" },
  "Completed": { label: "เสร็จสิ้นแล้ว", color: "bg-slate-50 text-slate-700" },
  "On Hold": { label: "ระงับชั่วคราว", color: "bg-amber-50 text-amber-700" },
};

export default function ProjectsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const [formData, setFormData] = useState({
    projectId: "",
    projectName: "",
    clientName: "",
    location: "",
    startDate: "",
    endDate: "",
    status: "Planning"
  });

  const projectsRef = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);
  const { data: projects, loading } = useCollection(projectsRef);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(prj => 
      prj.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      prj.projectId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prj.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !formData.projectId) return;

    setIsSaving(true);
    const docId = editingProject ? editingProject.id : formData.projectId;
    const docRef = doc(db, "projects", docId);
    
    setDoc(docRef, {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true })
      .then(() => {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูลโครงการเรียบร้อยแล้ว" });
        setIsSaving(false);
        setEditingProject(null);
        setFormData({ projectId: "", projectName: "", clientName: "", location: "", startDate: "", endDate: "", status: "Planning" });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: formData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("ยืนยันการลบโครงการ?")) return;
    const docRef = doc(db, "projects", id);
    deleteDoc(docRef)
      .then(() => toast({ title: "สำเร็จ", description: "ลบโครงการเรียบร้อยแล้ว" }))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
      });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">ข้อมูลโครงการ</h1>
          <p className="text-muted-foreground">จัดการรายละเอียดโครงการ ไซส์งาน และลูกค้า</p>
        </div>
        <Dialog onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> เพิ่มโครงการใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? "แก้ไขโครงการ" : "เพิ่มโครงการใหม่"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveProject}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="id">รหัสโครงการ</Label>
                  <Input 
                    id="id" 
                    required 
                    disabled={!!editingProject}
                    value={formData.projectId} 
                    onChange={e => setFormData({...formData, projectId: e.target.value})} 
                    placeholder="PRJ001" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Planning">กำลังวางแผน</option>
                    <option value="In Progress">ดำเนินการอยู่</option>
                    <option value="On Hold">ระงับชั่วคราว</option>
                    <option value="Completed">เสร็จสิ้นแล้ว</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">ชื่อโครงการ</Label>
                  <Input 
                    id="name" 
                    required 
                    value={formData.projectName} 
                    onChange={e => setFormData({...formData, projectName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="client">ชื่อลูกค้า</Label>
                  <Input 
                    id="client" 
                    required 
                    value={formData.clientName} 
                    onChange={e => setFormData({...formData, clientName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="location">สถานที่</Label>
                  <Input 
                    id="location" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">วันที่เริ่ม</Label>
                  <Input id="start" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">วันที่สิ้นสุด</Label>
                  <Input id="end" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditingProject(null)}>ยกเลิก</Button>
                <Button className="bg-accent" type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกข้อมูล"}
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
              placeholder="ค้นหาโครงการ หรือลูกค้า..."
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground">กำลังโหลดข้อมูลโครงการ...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[120px] font-bold">รหัส</TableHead>
                <TableHead className="font-bold">โครงการ / ลูกค้า</TableHead>
                <TableHead className="font-bold">สถานที่</TableHead>
                <TableHead className="font-bold">สถานะ</TableHead>
                <TableHead className="text-right font-bold">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((prj) => (
                <TableRow key={prj.id} className="hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs">{prj.projectId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-primary">{prj.projectName}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-accent" /> {prj.clientName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" /> {prj.location}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-none px-3 font-medium ${statusMap[prj.status]?.color || ""}`}>
                      {statusMap[prj.status]?.label || prj.status}
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
                        <DropdownMenuItem className="gap-2" onClick={() => {
                          setEditingProject(prj);
                          setFormData({
                            projectId: prj.projectId,
                            projectName: prj.projectName,
                            clientName: prj.clientName,
                            location: prj.location,
                            startDate: prj.startDate,
                            endDate: prj.endDate,
                            status: prj.status
                          });
                        }}>
                          <Edit2 className="w-4 h-4" /> แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(prj.id)}>
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
      </div>
    </div>
  );
}
