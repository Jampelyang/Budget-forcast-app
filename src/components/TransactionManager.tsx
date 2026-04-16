import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpCircle, ArrowDownCircle, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
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
import { Badge } from '@/components/ui/badge';
import { Transaction, BudgetCategory } from '../types';
import { CATEGORIES, CURRENCY_SYMBOL, formatCurrency } from '../constants';

interface TransactionManagerProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addAuditLog: (action: string, details: string) => void;
}

export function TransactionManager({ transactions, setTransactions, addAuditLog }: TransactionManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    description: ''
  });

  const filteredTransactions = transactions
    .filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || 
                 CATEGORIES.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = () => {
    if (newTransaction.categoryId && newTransaction.amount) {
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        categoryId: newTransaction.categoryId,
        date: newTransaction.date || format(new Date(), 'yyyy-MM-dd'),
        amount: Number(newTransaction.amount),
        description: newTransaction.description || '',
        user: 'jampel91@gmail.com'
      };
      setTransactions(prev => [transaction, ...prev]);
      const cat = CATEGORIES.find(c => c.id === transaction.categoryId);
      addAuditLog('New Transaction', `${cat?.type}: ${formatCurrency(transaction.amount)} for ${cat?.name}`);
      setIsAddOpen(false);
      setNewTransaction({ date: format(new Date(), 'yyyy-MM-dd'), amount: 0, description: '' });
    }
  };

  const handleDelete = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    addAuditLog('Delete Transaction', `Removed ${transaction?.description} (${formatCurrency(transaction?.amount || 0)})`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" size={18} />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10 border-[#141414]/10 focus-visible:ring-[#141414]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#141414] hover:bg-[#141414]/90 gap-2 w-full md:w-auto">
              <Plus size={16} />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Transaction</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select onValueChange={(v) => setNewTransaction(prev => ({ ...prev, categoryId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          {cat.type === 'Income' ? <ArrowUpCircle size={14} className="text-green-600" /> : <ArrowDownCircle size={14} className="text-red-600" />}
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="date" 
                    value={newTransaction.date} 
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount ({CURRENCY_SYMBOL})</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  placeholder="e.g. Monthly rent payment"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button className="bg-[#141414]" onClick={handleAdd}>Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-[#141414]/10 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#141414]/5">
            <TableRow>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="font-bold text-right">Amount</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#141414]/40 italic">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((t) => {
                const category = CATEGORIES.find(c => c.id === t.categoryId);
                return (
                  <TableRow key={t.id} className="hover:bg-[#141414]/5 transition-colors">
                    <TableCell className="text-sm text-[#141414]/60">
                      {format(new Date(t.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{category?.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#141414]/40">{category?.department}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-bold ${category?.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                        {category?.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(t.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
