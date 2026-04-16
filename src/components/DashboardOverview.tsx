import { useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  AlertCircle,
  PiggyBank
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isSameMonth, parseISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Allocation, Transaction } from '../types';
import { CATEGORIES, DEPARTMENTS, CURRENCY_SYMBOL, formatCurrency } from '../constants';

interface DashboardOverviewProps {
  allocations: Allocation[];
  transactions: Transaction[];
}

export function DashboardOverview({ allocations, transactions }: DashboardOverviewProps) {
  const stats = useMemo(() => {
    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    const totalSpent = transactions
      .filter(t => CATEGORIES.find(c => c.id === t.categoryId)?.type === 'Expenditure')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter(t => CATEGORIES.find(c => c.id === t.categoryId)?.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const variance = totalAllocated - totalSpent;
    const burnRate = totalSpent / 3; // Mocking 3 months for now

    return {
      totalAllocated,
      totalSpent,
      totalIncome,
      variance,
      burnRate,
      efficiency: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
    };
  }, [allocations, transactions]);

  const chartData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map(month => {
      const monthStr = format(month, 'MMM yyyy');
      const monthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), month));
      
      const spent = monthTransactions
        .filter(t => CATEGORIES.find(c => c.id === t.categoryId)?.type === 'Expenditure')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const income = monthTransactions
        .filter(t => CATEGORIES.find(c => c.id === t.categoryId)?.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

      // Simple forecast: 5% growth on average
      const forecast = spent * 1.05;

      return {
        name: monthStr,
        Spent: spent,
        Income: income,
        Forecast: forecast
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Budget" 
          value={stats.totalAllocated} 
          icon={<Wallet className="text-blue-600" />}
          description="Total Q1 Allocation"
        />
        <KpiCard 
          title="Total Spent" 
          value={stats.totalSpent} 
          icon={<TrendingUp className="text-red-600" />}
          trend={stats.efficiency > 80 ? 'up' : 'down'}
          trendValue={`${stats.efficiency.toFixed(1)}% of budget`}
          description="Cumulative Expenditure"
        />
        <KpiCard 
          title="Total Income" 
          value={stats.totalIncome} 
          icon={<PiggyBank className="text-green-600" />}
          description="Interest & Fees"
        />
        <KpiCard 
          title="Budget Variance" 
          value={stats.variance} 
          icon={<AlertCircle className={stats.variance < 0 ? 'text-red-600' : 'text-green-600'} />}
          description="Remaining Balance"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[#141414]/10 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-bold">Budget Forecast vs Actual</CardTitle>
                <CardDescription className="font-serif italic">6-month trend analysis and projections</CardDescription>
              </div>
              <div className="text-[10px] bg-[#141414]/5 p-2 rounded border border-[#141414]/10 max-w-[200px]">
                <span className="font-bold block mb-1">Forecast Logic:</span>
                Uses a 5% projected growth rate on current spending trends to estimate future requirements.
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#14141460' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#14141460' }}
                  tickFormatter={(value) => `${CURRENCY_SYMBOL}${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="Spent" 
                  stroke="#141414" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSpent)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="Forecast" 
                  stroke="#141414" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.4}
                  dot={false}
                />
                <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#141414]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Departmental Burn</CardTitle>
            <CardDescription className="font-serif italic">Spending by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {DEPARTMENTS.map(dept => {
                const deptSpent = transactions
                  .filter(t => {
                    const cat = CATEGORIES.find(c => c.id === t.categoryId);
                    return cat?.department === dept && cat.type === 'Expenditure';
                  })
                  .reduce((sum, t) => sum + t.amount, 0);
                
                const deptAllocated = allocations
                  .filter(a => CATEGORIES.find(c => c.id === a.categoryId)?.department === dept)
                  .reduce((sum, a) => sum + a.amount, 0);
                
                const percentage = deptAllocated > 0 ? (deptSpent / deptAllocated) * 100 : 0;

                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept}</span>
                      <span className="text-[#141414]/60">{formatCurrency(deptSpent)}</span>
                    </div>
                    <div className="h-2 w-full bg-[#141414]/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-[#141414]'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, trend, trendValue, description }: any) {
  return (
    <Card className="border-[#141414]/10 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#141414]/5 rounded-lg">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
              {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trendValue}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-[#141414]/60 font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{formatCurrency(value)}</h3>
          <p className="text-xs text-[#141414]/40 mt-1 font-serif italic">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
