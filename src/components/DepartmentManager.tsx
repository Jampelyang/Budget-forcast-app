import React, { useState } from 'react';
import { Plus, Trash2, Building2, Edit2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { DepartmentInfo } from '../types';

interface DepartmentManagerProps {
  departments: DepartmentInfo[];
  setDepartments: React.Dispatch<React.SetStateAction<DepartmentInfo[]>>;
  addAuditLog: (action: string, details: string) => void;
}

export function DepartmentManager({ departments, setDepartments, addAuditLog }: DepartmentManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState<Partial<DepartmentInfo>>({});

  const handleAdd = () => {
    if (currentDept.name) {
      const department: DepartmentInfo = {
        id: Math.random().toString(36).substr(2, 9),
        name: currentDept.name
      };
      setDepartments(prev => [...prev, department]);
      addAuditLog('Create Department', `Added department: ${department.name}`);
      setIsAddOpen(false);
      setCurrentDept({});
    }
  };

  const handleEdit = () => {
    if (currentDept.id && currentDept.name) {
      setDepartments(prev => prev.map(d => d.id === currentDept.id ? (currentDept as DepartmentInfo) : d));
      addAuditLog('Edit Department', `Updated department: ${currentDept.name}`);
      setIsEditOpen(false);
      setCurrentDept({});
    }
  };

  const handleDelete = (id: string) => {
    const dept = departments.find(d => d.id === id);
    setDepartments(prev => prev.filter(d => d.id !== id));
    addAuditLog('Delete Department', `Removed department: ${dept?.name}`);
  };

  const openEdit = (dept: DepartmentInfo) => {
    setCurrentDept(dept);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#141414]/10 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Departments</CardTitle>
            <CardDescription className="font-serif italic">Manage organizational departments</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#141414] hover:bg-[#141414]/90 gap-2">
                <Plus size={16} />
                New Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Department</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department Name</label>
                  <Input 
                    placeholder="e.g. Marketing"
                    value={currentDept.name || ''}
                    onChange={(e) => setCurrentDept(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button className="bg-[#141414]" onClick={handleAdd}>Save Department</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#141414]/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#141414]/5">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id} className="hover:bg-[#141414]/5 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-[#141414]/40" />
                        {dept.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#141414]/5" onClick={() => openEdit(dept)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(dept.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department Name</label>
              <Input 
                placeholder="e.g. Marketing"
                value={currentDept.name || ''}
                onChange={(e) => setCurrentDept(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="bg-[#141414]" onClick={handleEdit}>Update Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
