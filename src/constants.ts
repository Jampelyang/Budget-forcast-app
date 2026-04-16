import { BudgetCategory, Department } from './types';

export const DEPARTMENTS: Department[] = ['Operations', 'Lending', 'Risk', 'IT', 'HR', 'Finance'];

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

export const CURRENCY_SYMBOL = '$';

export const formatCurrency = (value: number) => {
  return `${CURRENCY_SYMBOL}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const INITIAL_ALLOCATIONS = [
  { id: 'a1', categoryId: 'inc-1', year: 2024, quarter: 1, amount: 500000 },
  { id: 'a2', categoryId: 'inc-2', year: 2024, quarter: 1, amount: 50000 },
  { id: 'a3', categoryId: 'exp-1', year: 2024, quarter: 1, amount: 200000 },
  { id: 'a4', categoryId: 'exp-2', year: 2024, quarter: 1, amount: 30000 },
];

export const INITIAL_TRANSACTIONS = [
  { id: 't1', categoryId: 'inc-1', date: '2024-01-15', amount: 150000, description: 'Monthly interest collection', user: 'jampel91@gmail.com' },
  { id: 't2', categoryId: 'exp-1', date: '2024-01-31', amount: 195000, description: 'January Salaries', user: 'jampel91@gmail.com' },
  { id: 't3', categoryId: 'exp-2', date: '2024-02-01', amount: 30000, description: 'Office Rent Q1', user: 'jampel91@gmail.com' },
];
