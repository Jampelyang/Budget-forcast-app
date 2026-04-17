import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { BudgetCategory, CategoryType, Department, DepartmentInfo } from '../types';

interface CategoryManagerProps {
  categories: BudgetCategory[];
  setCategories: React.Dispatch<React.SetStateAction<BudgetCategory[]>>;
  departments: DepartmentInfo[];
  addAuditLog: (action: string, details: string) => void;
}

export function CategoryManager({ categories, setCategories, departments, addAuditLog }: CategoryManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<BudgetCategory>>({
    type: 'Expenditure',
    department: departments[0]?.name || 'Operations'
  });

  const handleAdd = () => {
    if (newCategory.name && newCategory.type && newCategory.department) {
      const category: BudgetCategory = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCategory.name,
        type: newCategory.type as CategoryType,
        department: newCategory.department as Department
      };
      setCategories(prev => [...prev, category]);
      addAuditLog('Create Category', `Added category: ${category.name} (${category.type})`);
      setIsAddOpen(false);
      setNewCategory({ type: 'Expenditure', department: departments[0]?.name || 'Operations' });
    }
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    addAuditLog('Delete Category', `Removed category: ${category?.name}`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#141414]/10 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Budget Categories</CardTitle>
            <CardDescription className="font-serif italic">Define income and expenditure categories</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#141414] hover:bg-[#141414]/90 gap-2">
                <Plus size={16} />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Budget Category</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Name</label>
                  <Input 
                    placeholder="e.g. Office Supplies"
                    value={newCategory.name || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select onValueChange={(v) => setNewCategory(prev => ({ ...prev, type: v as CategoryType }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Expenditure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expenditure">Expenditure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <Select onValueChange={(v) => setNewCategory(prev => ({ ...prev, department: v as Department }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Operations" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button className="bg-[#141414]" onClick={handleAdd}>Save Category</Button>
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
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold">Department</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-[#141414]/5 transition-colors">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded border ${
                        category.type === 'Income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {category.type}
                      </span>
                    </TableCell>
                    <TableCell>{category.department}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(category.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
