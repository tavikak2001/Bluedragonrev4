
"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialEmployees = [
  { id: "EMP001", name: "John Doe", nickname: "John", position: "Site Supervisor", department: "Operations", phone: "081-234-5678", wage: 800, status: "Active" },
  { id: "EMP002", name: "Jane Smith", nickname: "Jane", position: "Architect", department: "Design", phone: "082-345-6789", wage: 1200, status: "Active" },
  { id: "EMP003", name: "Robert Brown", nickname: "Rob", position: "Electrician", department: "Engineering", phone: "083-456-7890", wage: 600, status: "On Leave" },
  { id: "EMP004", name: "Sarah Wilson", nickname: "Sarah", position: "Safety Officer", department: "Safety", phone: "084-567-8901", wage: 750, status: "Active" },
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
          <h1 className="text-3xl font-bold text-primary tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage your organization's staff and workforce.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="id">Employee ID</Label>
                <Input id="id" placeholder="e.g., EMP005" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Johnathan Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input id="nickname" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="08X-XXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Job Title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Input id="dept" placeholder="Operations" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wage">Daily Wage</Label>
                <Input id="wage" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ot">Hourly OT Rate</Label>
                <Input id="ot" type="number" placeholder="0.00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button className="bg-accent">Save Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between bg-secondary/10">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or ID..."
              className="pl-8 bg-white border-muted focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Daily Wage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id} className="group">
                <TableCell className="font-mono text-xs font-semibold">{emp.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-muted group-hover:border-accent/30 transition-colors">
                      <AvatarImage src={`https://picsum.photos/seed/${emp.id}/40/40`} />
                      <AvatarFallback>{emp.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{emp.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {emp.phone}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{emp.position}</TableCell>
                <TableCell className="text-sm">{emp.department}</TableCell>
                <TableCell className="text-sm font-medium">฿{emp.wage.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant={emp.status === 'Active' ? 'secondary' : 'outline'}
                    className={emp.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : ''}
                  >
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Edit2 className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" /> Delete
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
            <p className="text-muted-foreground">No employees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
