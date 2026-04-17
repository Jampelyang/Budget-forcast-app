import { BudgetCategory, Department, Allocation, DepartmentInfo, CompanyProfile } from './types';

export const INITIAL_DEPARTMENTS: DepartmentInfo[] = [
  { id: 'd1', name: 'Operations' },
  { id: 'd2', name: 'Lending' },
  { id: 'd3', name: 'Risk' },
  { id: 'd4', name: 'IT' },
  { id: 'd5', name: 'HR' },
  { id: 'd6', name: 'Finance' },
];

export const CATEGORIES: BudgetCategory[] = [
  { id: 'inc-1', name: 'Interest Income', type: 'Income', department: 'Lending' },
  { id: 'inc-2', name: 'Processing Fees', type: 'Income', department: 'Lending' },
  { id: 'inc-3', name: 'Investment Income', type: 'Income', department: 'Finance' },
  { id: 'exp-1', name: 'Staff Salaries', type: 'Expenditure', department: 'HR' },
  { id: 'exp-2', name: 'Office Rent', type: 'Expenditure', department: 'Operations' },
  { id: 'exp-3', name: 'IT Infrastructure', type: 'Expenditure', department: 'IT' },
  { id: 'exp-4', name: 'Marketing', type: 'Expenditure', department: 'Operations' },
  { id: 'exp-5', name: 'Loan Loss Provision', type: 'Expenditure', department: 'Risk' },
  { id: 'exp-6', name: 'Audit Fees', type: 'Expenditure', department: 'Finance' },
];

export const CURRENCY_SYMBOL = '';

export const formatCurrency = (value: number) => {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const INITIAL_ALLOCATIONS: Allocation[] = [
  { id: 'a1', categoryId: 'inc-1', year: 2024, amount: 2000000 },
  { id: 'a2', categoryId: 'inc-2', year: 2024, amount: 200000 },
  { id: 'a3', categoryId: 'exp-1', year: 2024, amount: 800000 },
  { id: 'a4', categoryId: 'exp-2', year: 2024, amount: 120000 },
];

export const INITIAL_TRANSACTIONS = [
  { id: 't1', categoryId: 'inc-1', date: '2024-01-15', amount: 150000, description: 'Monthly interest collection', user: 'jampel91@gmail.com' },
  { id: 't2', categoryId: 'exp-1', date: '2024-01-31', amount: 195000, description: 'January Salaries', user: 'jampel91@gmail.com' },
  { id: 't3', categoryId: 'exp-2', date: '2024-02-01', amount: 30000, description: 'Office Rent Q1', user: 'jampel91@gmail.com' },
];

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  name: 'MicroFinance Institution Co.',
  address: '123 Financial District, Capital City',
  email: 'info@microfinance.com',
  phone: '+1 (555) 000-1234',
  website: 'www.microfinance.com',
  registrationNumber: 'MF-2024-001'
};
