import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
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
import { Allocation, BudgetCategory } from '../types';
import { CATEGORIES, DEPARTMENTS, CURRENCY_SYMBOL, formatCurrency } from '../constants';

interface AllocationManagerProps {
  allocations: Allocation[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  addAuditLog: (action: string, details: string) => void;
}

export function AllocationManager({ allocations, setAllocations, addAuditLog }: AllocationManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAllocation, setNewAllocation] = useState<Partial<Allocation>>({
    year: 2024,
    quarter: 1,
    amount: 0
  });

  const handleAdd = () => {
    if (newAllocation.categoryId && newAllocation.amount) {
      const allocation: Allocation = {
        id: Math.random().toString(36).substr(2, 9),
        categoryId: newAllocation.categoryId,
        year: newAllocation.year || 2024,
        quarter: (newAllocation.quarter as 1 | 2 | 3 | 4) || 1,
        amount: Number(newAllocation.amount)
      };
      setAllocations(prev => [...prev, allocation]);
      addAuditLog('Create Allocation', `Added ${formatCurrency(allocation.amount)} for ${CATEGORIES.find(c => c.id === allocation.categoryId)?.name}`);
      setIsAddOpen(false);
      setNewAllocation({ year: 2024, quarter: 1, amount: 0 });
    }
  };

  const handleDelete = (id: string) => {
    const allocation = allocations.find(a => a.id === id);
    setAllocations(prev => prev.filter(a => a.id !== id));
    addAuditLog('Delete Allocation', `Removed allocation for ${CATEGORIES.find(c => c.id === allocation?.categoryId)?.name}`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#141414]/10 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Budget Allocations</CardTitle>
            <CardDescription className="font-serif italic">Set and manage quarterly budget limits</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#141414] hover:bg-[#141414]/90 gap-2">
                <Plus size={16} />
                New Allocation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Budget Allocation</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select onValueChange={(v) => setNewAllocation(prev => ({ ...prev, categoryId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name} ({cat.department})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <Input 
                      type="number" 
                      value={newAllocation.year} 
                      onChange={(e) => setNewAllocation(prev => ({ ...prev, year: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quarter</label>
                    <Select onValueChange={(v) => setNewAllocation(prev => ({ ...prev, quarter: Number(v) as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Q1" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1</SelectItem>
                        <SelectItem value="2">Q2</SelectItem>
                        <SelectItem value="3">Q3</SelectItem>
                        <SelectItem value="4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount ({CURRENCY_SYMBOL})</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newAllocation.amount || ''}
                    onChange={(e) => setNewAllocation(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button className="bg-[#141414]" onClick={handleAdd}>Save Allocation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#141414]/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#141414]/5">
                <TableRow>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Department</TableHead>
                  <TableHead className="font-bold">Period</TableHead>
                  <TableHead className="font-bold text-right">Amount</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[#141414]/40 italic">
                      No allocations set for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  allocations.map((allocation) => {
                    const category = CATEGORIES.find(c => c.id === allocation.categoryId);
                    return (
                      <TableRow key={allocation.id} className="hover:bg-[#141414]/5 transition-colors">
                        <TableCell className="font-medium">{category?.name}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 bg-[#141414]/5 rounded border border-[#141414]/10">
                            {category?.department}
                          </span>
                        </TableCell>
                        <TableCell>Q{allocation.quarter} {allocation.year}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(allocation.amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(allocation.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
