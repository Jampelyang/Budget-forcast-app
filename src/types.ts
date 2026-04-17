export type Department = string;

export interface DepartmentInfo {
  id: string;
  name: string;
}

export type CategoryType = 'Income' | 'Expenditure';

export interface BudgetCategory {
  id: string;
  name: string;
  type: CategoryType;
  department: Department;
}

export interface Allocation {
  id: string;
  categoryId: string;
  year: number;
  amount: number;
}

export interface Transaction {
  id: string;
  categoryId: string;
  date: string;
  amount: number;
  description: string;
  user: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
}

export interface ForecastData {
  period: string;
  actual: number;
  forecast: number;
  allocation: number;
}

export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  registrationNumber: string;
}
