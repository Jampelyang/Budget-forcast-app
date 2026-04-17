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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Allocation, Transaction, BudgetCategory, DepartmentInfo } from '../types';
import { formatCurrency } from '../constants';
import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, BarChart3, Download } from 'lucide-react';
import Papa from 'papaparse';
import { format } from 'date-fns';

interface ReportsAnalysisProps {
  allocations: Allocation[];
  transactions: Transaction[];
  categories: BudgetCategory[];
  departments: DepartmentInfo[];
}

const COLORS = ['#141414', '#4a4a4a', '#8e8e8e', '#c2c2c2', '#e5e5e5', '#f5f5f5'];

export function ReportsAnalysis({ allocations, transactions, categories, departments }: ReportsAnalysisProps) {
  const departmentalData = useMemo(() => {
    return departments.map(deptInfo => {
      const dept = deptInfo.name;
      const spent = transactions
        .filter(t => {
          const cat = categories.find(c => c.id === t.categoryId);
          return cat?.department === dept && cat.type === 'Expenditure';
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const income = transactions
        .filter(t => {
          const cat = categories.find(c => c.id === t.categoryId);
          return cat?.department === dept && cat.type === 'Income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return { name: dept, Spent: spent, Income: income };
    });
  }, [transactions, categories, departments]);

  const annualData = useMemo(() => {
    const years = [2024];
    return years.map(year => {
      const allocated = allocations
        .filter(a => a.year === year)
        .reduce((sum, a) => sum + a.amount, 0);
      
      const spent = transactions
        .filter(t => {
          const date = new Date(t.date);
          const tYear = date.getFullYear();
          const cat = categories.find(c => c.id === t.categoryId);
          return tYear === year && cat?.type === 'Expenditure';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const income = transactions
        .filter(t => {
          const date = new Date(t.date);
          const tYear = date.getFullYear();
          const cat = categories.find(c => c.id === t.categoryId);
          return tYear === year && cat?.type === 'Income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: `${year}`,
        Allocated: allocated,
        Spent: spent,
        Income: income,
        Variance: allocated - spent
      };
    });
  }, [allocations, transactions, categories]);

  const quarterlyData = useMemo(() => {
    const quarters = [1, 2, 3, 4];
    return quarters.map(q => {
      const spent = transactions
        .filter(t => {
          const date = new Date(t.date);
          const tQuarter = Math.floor(date.getMonth() / 3) + 1;
          const cat = categories.find(c => c.id === t.categoryId);
          return tQuarter === q && cat?.type === 'Expenditure';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const income = transactions
        .filter(t => {
          const date = new Date(t.date);
          const tQuarter = Math.floor(date.getMonth() / 3) + 1;
          const cat = categories.find(c => c.id === t.categoryId);
          return tQuarter === q && cat?.type === 'Income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: `Q${q}`,
        Spent: spent,
        Income: income,
        Net: income - spent
      };
    });
  }, [transactions, categories]);

  const ratios = useMemo(() => {
    const data = annualData[0] || { Allocated: 0, Spent: 0, Income: 0 };
    
    return [
      { 
        name: 'Budget Utilization', 
        value: data.Allocated > 0 ? (data.Spent / data.Allocated) * 100 : 0,
        suffix: '%',
        description: 'Percentage of allocated budget spent',
        status: data.Spent > data.Allocated ? 'critical' : 'normal'
      },
      { 
        name: 'Expense-to-Income', 
        value: data.Income > 0 ? (data.Spent / data.Income) * 100 : 0,
        suffix: '%',
        description: 'Operational costs relative to generated income',
        status: (data.Spent / data.Income) > 0.8 ? 'warning' : 'normal'
      },
      { 
        name: 'Income Coverage', 
        value: data.Spent > 0 ? data.Income / data.Spent : 0,
        suffix: 'x',
        description: 'How many times income covers expenses',
        status: (data.Income / data.Spent) < 1.2 ? 'warning' : 'normal'
      },
      { 
        name: 'Variance Margin', 
        value: data.Allocated > 0 ? ((data.Allocated - data.Spent) / data.Allocated) * 100 : 0,
        suffix: '%',
        description: 'Safety margin remaining in budget',
        status: ((data.Allocated - data.Spent) / data.Allocated) < 0.05 ? 'warning' : 'normal'
      }
    ];
  }, [annualData]);

  const exportToCSV = (type: 'departmental' | 'quarterly' | 'ratios') => {
    let data: any[] = [];
    let filename = '';

    if (type === 'departmental') {
      data = departmentalData.map(d => ({
        Department: d.name,
        Income: d.Income,
        Expenditure: d.Spent,
        Net: d.Income - d.Spent
      }));
      filename = `departmental_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (type === 'quarterly') {
      data = quarterlyData.map(q => ({
        Quarter: q.name,
        Income: q.Income,
        Expenditure: q.Spent,
        Net: q.Net
      }));
      filename = `quarterly_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (type === 'ratios') {
      data = ratios.map(r => ({
        Indicator: r.name,
        Value: `${r.value.toFixed(2)}${r.suffix}`,
        Description: r.description
      }));
      filename = `ratio_analysis_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="departmental" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-[#141414]/5 border border-[#141414]/10 p-1">
            <TabsTrigger value="departmental" className="gap-2 data-[state=active]:bg-[#141414] data-[state=active]:text-white">
              <BarChart3 size={14} />
              Departmental
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="gap-2 data-[state=active]:bg-[#141414] data-[state=active]:text-white">
              <TrendingUp size={14} />
              Quarterly
            </TabsTrigger>
            <TabsTrigger value="ratios" className="gap-2 data-[state=active]:bg-[#141414] data-[state=active]:text-white">
              <Activity size={14} />
              Ratio Analysis
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <TabsContent value="departmental" className="m-0">
              <Button variant="outline" size="sm" className="gap-2 border-[#141414]/10" onClick={() => exportToCSV('departmental')}>
                <Download size={14} />
                Export CSV
              </Button>
            </TabsContent>
            <TabsContent value="quarterly" className="m-0">
              <Button variant="outline" size="sm" className="gap-2 border-[#141414]/10" onClick={() => exportToCSV('quarterly')}>
                <Download size={14} />
                Export CSV
              </Button>
            </TabsContent>
            <TabsContent value="ratios" className="m-0">
              <Button variant="outline" size="sm" className="gap-2 border-[#141414]/10" onClick={() => exportToCSV('ratios')}>
                <Download size={14} />
                Export CSV
              </Button>
            </TabsContent>
          </div>
        </div>

        <TabsContent value="departmental" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <Card className="border-[#141414]/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Departmental Distribution</CardTitle>
                <CardDescription className="font-serif italic">Total spending share by department</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="Spent"
                    >
                      {departmentalData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#141414]/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Departmental Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-[#141414]/5">
                  <TableRow>
                    <TableHead className="font-bold">Department</TableHead>
                    <TableHead className="font-bold text-right">Income</TableHead>
                    <TableHead className="font-bold text-right">Expenditure</TableHead>
                    <TableHead className="font-bold text-right">Net Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentalData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">{formatCurrency(row.Income)}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">{formatCurrency(row.Spent)}</TableCell>
                      <TableCell className={`text-right font-mono font-bold ${row.Income - row.Spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(row.Income - row.Spent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarterly" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-[#141414]/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quarterly Trends</CardTitle>
                <CardDescription className="font-serif italic">Income and Expenditure flow</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Spent" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-[#141414]/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Net Quarterly Position</CardTitle>
                <CardDescription className="font-serif italic">Surplus or Deficit per quarter</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="Net" radius={[4, 4, 0, 0]}>
                      {quarterlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.Net >= 0 ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#141414]/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quarterly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-[#141414]/5">
                  <TableRow>
                    <TableHead className="font-bold">Quarter</TableHead>
                    <TableHead className="font-bold text-right">Income</TableHead>
                    <TableHead className="font-bold text-right">Expenditure</TableHead>
                    <TableHead className="font-bold text-right">Net Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quarterlyData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(row.Income)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(row.Spent)}</TableCell>
                      <TableCell className={`text-right font-mono font-bold ${row.Net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(row.Net)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratios" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ratios.map((ratio) => (
              <Card key={ratio.name} className="border-[#141414]/10 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">{ratio.name}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      ratio.status === 'critical' ? 'bg-red-500' : 
                      ratio.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{ratio.value.toFixed(1)}</span>
                    <span className="text-sm font-medium text-[#141414]/60">{ratio.suffix}</span>
                  </div>
                  <p className="text-[10px] text-[#141414]/60 mt-2 italic font-serif leading-tight">
                    {ratio.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-[#141414]/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Financial Health Indicators</CardTitle>
              <CardDescription className="font-serif italic">Comparative analysis of key performance ratios</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratios} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#141414" radius={[4, 4, 0, 0]}>
                    {ratios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.status === 'critical' ? '#ef4444' : 
                        entry.status === 'warning' ? '#f59e0b' : '#141414'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
