/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  History, 
  PlusCircle, 
  Download, 
  TrendingUp, 
  Building2,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfQuarter, endOfQuarter, isWithinInterval, parseISO, subMonths } from 'date-fns';
import Papa from 'papaparse';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { 
  CATEGORIES, 
  INITIAL_ALLOCATIONS, 
  INITIAL_TRANSACTIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_COMPANY_PROFILE
} from './constants';
import { 
  Allocation, 
  Transaction, 
  AuditLog, 
  CategoryType, 
  Department,
  ForecastData,
  BudgetCategory,
  DepartmentInfo,
  CompanyProfile
} from './types';

// Components
import { DashboardOverview } from './components/DashboardOverview';
import { AllocationManager } from './components/AllocationManager';
import { TransactionManager } from './components/TransactionManager';
import { AuditTrail } from './components/AuditTrail';
import { ReportsAnalysis } from './components/ReportsAnalysis';
import { CategoryManager } from './components/CategoryManager';
import { DepartmentManager } from './components/DepartmentManager';
import { CompanySettings } from './components/CompanySettings';

export default function App() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>(INITIAL_DEPARTMENTS);
  const [categories, setCategories] = useState<BudgetCategory[]>(CATEGORIES);
  const [allocations, setAllocations] = useState<Allocation[]>(INITIAL_ALLOCATIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(INITIAL_COMPANY_PROFILE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add audit log helper
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details,
      user: 'jampel91@gmail.com',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = transactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return {
        Date: t.date,
        Category: category?.name || 'Unknown',
        Type: category?.type || 'Unknown',
        Department: category?.department || 'Unknown',
        Amount: t.amount,
        Description: t.description,
        User: t.user
      };
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `budget_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('Export', 'Exported transactions to CSV');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#141414] font-sans">
      {/* Mobile/Tablet Top Header */}
      <header className="lg:hidden bg-white border-b border-[#141414]/10 h-16 sticky top-0 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] rounded flex items-center justify-center">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-sm tracking-tight truncate max-w-[150px]">{companyProfile.name}</h1>
        </div>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-[#141414]/5 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile/Tablet Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-16 bg-white border-b border-[#141414]/10 z-40 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)]"
          >
            <nav className="p-4 space-y-1">
              {[
                { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
                { id: 'departments', icon: <Building2 size={18} />, label: 'Departments' },
                { id: 'categories', icon: <FileText size={18} />, label: 'Categories' },
                { id: 'allocations', icon: <CalendarDays size={18} />, label: 'Allocations' },
                { id: 'transactions', icon: <PlusCircle size={18} />, label: 'Transactions' },
                { id: 'reports', icon: <PieChart size={18} />, label: 'Reports' },
                { id: 'audit', icon: <History size={18} />, label: 'Audit Trail' },
                { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                    activeTab === item.id 
                      ? 'bg-[#141414] text-white shadow-md' 
                      : 'text-[#141414]/60 hover:bg-[#141414]/5 hover:text-[#141414]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-[#141414]/5 mt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 border-transparent hover:bg-[#141414] hover:text-white transition-all h-12"
                  onClick={() => {
                    exportToCSV();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Download size={16} />
                  Export CSV
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar / Navigation */}
      <div className="flex">
        <aside className="w-64 bg-white border-r border-[#141414]/10 h-screen sticky top-0 hidden lg:flex flex-col">
          <div className="p-6 border-bottom border-[#141414]/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#141414] rounded flex items-center justify-center">
                <TrendingUp className="text-white w-5 h-5" />
              </div>
              <h1 className="font-bold text-lg tracking-tight truncate">{companyProfile.name}</h1>
            </div>
            <p className="text-xs text-[#141414]/50 uppercase tracking-widest font-semibold">Budget Forecaster</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
            />
            <NavButton 
              active={activeTab === 'departments'} 
              onClick={() => setActiveTab('departments')}
              icon={<Building2 size={18} />}
              label="Departments"
            />
            <NavButton 
              active={activeTab === 'categories'} 
              onClick={() => setActiveTab('categories')}
              icon={<FileText size={18} />}
              label="Categories"
            />
            <NavButton 
              active={activeTab === 'allocations'} 
              onClick={() => setActiveTab('allocations')}
              icon={<CalendarDays size={18} />}
              label="Allocations"
            />
            <NavButton 
              active={activeTab === 'transactions'} 
              onClick={() => setActiveTab('transactions')}
              icon={<PlusCircle size={18} />}
              label="Transactions"
            />
            <NavButton 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')}
              icon={<PieChart size={18} />}
              label="Reports"
            />
            <NavButton 
              active={activeTab === 'audit'} 
              onClick={() => setActiveTab('audit')}
              icon={<History size={18} />}
              label="Audit Trail"
            />
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<Settings size={18} />}
              label="Settings"
            />
          </nav>

          <div className="p-4 border-t border-[#141414]/10">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-[#141414]/20 hover:bg-[#141414] hover:text-white transition-all"
              onClick={exportToCSV}
            >
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <header className="mb-6 lg:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-[#141414]/60 italic font-serif text-sm lg:text-base">
                {format(new Date(), 'EEEE, MMMM do yyyy')}
              </p>
            </div>
            <div className="flex gap-2 lg:gap-3">
              <Badge variant="outline" className="px-2 lg:px-3 py-1 border-[#141414]/20 text-xs lg:text-sm">
                FY 2024
              </Badge>
              <Badge variant="outline" className="px-2 lg:px-3 py-1 border-[#141414]/20 bg-green-50 text-green-700 border-green-200 text-xs lg:text-sm">
                Active
              </Badge>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardOverview 
                  allocations={allocations} 
                  transactions={transactions} 
                  categories={categories}
                  departments={departments}
                  profile={companyProfile}
                />
              )}
              {activeTab === 'departments' && (
                <DepartmentManager 
                  departments={departments}
                  setDepartments={setDepartments}
                  addAuditLog={addAuditLog}
                />
              )}
              {activeTab === 'categories' && (
                <CategoryManager 
                  categories={categories}
                  setCategories={setCategories}
                  departments={departments}
                  addAuditLog={addAuditLog}
                />
              )}
              {activeTab === 'allocations' && (
                <AllocationManager 
                  allocations={allocations} 
                  setAllocations={setAllocations}
                  categories={categories}
                  addAuditLog={addAuditLog}
                />
              )}
              {activeTab === 'transactions' && (
                <TransactionManager 
                  transactions={transactions} 
                  setTransactions={setTransactions}
                  categories={categories}
                  addAuditLog={addAuditLog}
                />
              )}
              {activeTab === 'reports' && (
                <ReportsAnalysis 
                  allocations={allocations} 
                  transactions={transactions} 
                  categories={categories}
                  departments={departments}
                />
              )}
              {activeTab === 'audit' && (
                <AuditTrail logs={auditLogs} />
              )}
              {activeTab === 'settings' && (
                <CompanySettings 
                  profile={companyProfile}
                  setProfile={setCompanyProfile}
                  addAuditLog={addAuditLog}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
        active 
          ? 'bg-[#141414] text-white shadow-lg' 
          : 'text-[#141414]/60 hover:bg-[#141414]/5 hover:text-[#141414]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
