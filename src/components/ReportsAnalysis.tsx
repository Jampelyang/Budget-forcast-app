import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Allocation, Transaction } from '../types';
import { CATEGORIES, DEPARTMENTS, formatCurrency } from '../constants';

interface ReportsAnalysisProps {
  allocations: Allocation[];
  transactions: Transaction[];
}

const COLORS = ['#141414', '#4a4a4a', '#8e8e8e', '#c2c2c2', '#e5e5e5', '#f5f5f5'];

export function ReportsAnalysis({ allocations, transactions }: ReportsAnalysisProps) {
  const departmentalData = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      const spent = transactions
        .filter(t => {
          const cat = CATEGORIES.find(c => c.id === t.categoryId);
          return cat?.department === dept && cat.type === 'Expenditure';
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const income = transactions
        .filter(t => {
          const cat = CATEGORIES.find(c => c.id === t.categoryId);
          return cat?.department === dept && cat.type === 'Income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return { name: dept, Spent: spent, Income: income };
    });
  }, [transactions]);

  const quarterlyData = useMemo(() => {
    const quarters = [1, 2, 3, 4];
    return quarters.map(q => {
      const allocated = allocations
        .filter(a => a.quarter === q)
        .reduce((sum, a) => sum + a.amount, 0);
      
      // For simplicity, we're assuming transactions are mapped to quarters based on date
      // In a real app, we'd use date-fns to get the quarter
      const spent = transactions
        .filter(t => {
          const date = new Date(t.date);
          const tQuarter = Math.floor(date.getMonth() / 3) + 1;
          const cat = CATEGORIES.find(c => c.id === t.categoryId);
          return tQuarter === q && cat?.type === 'Expenditure';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: `Q${q}`,
        Allocated: allocated,
        Spent: spent,
        Variance: allocated - spent
      };
    });
  }, [allocations, transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#141414]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quarterly Performance</CardTitle>
            <CardDescription className="font-serif italic">Allocated vs Actual Spending</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#14141405' }} />
                <Legend />
                <Bar dataKey="Allocated" fill="#141414" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#14141460" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#141414]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Income vs Expenditure by Dept</CardTitle>
            <CardDescription className="font-serif italic">Operational efficiency by department</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#14141410" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{ fill: '#14141405' }} />
                <Legend />
                <Bar dataKey="Income" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Spent" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#141414]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quarterly Budget Report</CardTitle>
          <CardDescription className="font-serif italic">Detailed financial breakdown for FY 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-[#141414]/5">
              <TableRow>
                <TableHead className="font-bold">Period</TableHead>
                <TableHead className="font-bold text-right">Allocated</TableHead>
                <TableHead className="font-bold text-right">Spent</TableHead>
                <TableHead className="font-bold text-right">Variance</TableHead>
                <TableHead className="font-bold text-right">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarterlyData.map((row) => {
                const utilization = row.Allocated > 0 ? (row.Spent / row.Allocated) * 100 : 0;
                return (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name} 2024</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.Allocated)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.Spent)}</TableCell>
                    <TableCell className={`text-right font-mono ${row.Variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(row.Variance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-medium">{utilization.toFixed(1)}%</span>
                        <div className="w-16 h-1.5 bg-[#141414]/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${utilization > 90 ? 'bg-red-500' : 'bg-[#141414]'}`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
