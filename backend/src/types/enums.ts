// Employee Levels
export type EmployeeLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

// User Roles
export type UserRole = 'admin' | 'ceo' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

// Departments
export type Department = 'EXECUTIVE' | 'TECHNOLOGY' | 'FINANCE' | 'BUSINESS';

// Role mapping: Department + Level = Role Title
export const ROLE_TITLES: Record<Department, Record<EmployeeLevel, string>> = {
  EXECUTIVE: {
    L1: 'Chief Executive Officer',
    L2: 'Executive Director',
    L3: 'Executive Manager',
    L4: 'Senior Executive Analyst',
    L5: 'Executive Associate',
  },
  TECHNOLOGY: {
    L1: 'Chief Technology Officer',
    L2: 'Engineering Manager',
    L3: 'Tech Lead',
    L4: 'Senior Software Engineer',
    L5: 'Software Engineer',
  },
  FINANCE: {
    L1: 'Chief Financial Officer',
    L2: 'Finance Manager',
    L3: 'Senior Financial Analyst',
    L4: 'Senior Accountant',
    L5: 'Accountant',
  },
  BUSINESS: {
    L1: 'Chief Business Officer',
    L2: 'Business Manager',
    L3: 'Business Team Lead',
    L4: 'Senior Business Executive',
    L5: 'Business Executive',
  },
};

// Helper function to get role title
export function getRoleTitle(department: Department, level: EmployeeLevel): string {
  return ROLE_TITLES[department][level];
}

// Department display names
export const DEPARTMENT_NAMES: Record<Department, string> = {
  EXECUTIVE: 'Executive',
  TECHNOLOGY: 'Technology',
  FINANCE: 'Finance',
  BUSINESS: 'Business',
};

// Level descriptions
export const LEVEL_NAMES: Record<EmployeeLevel, string> = {
  L1: 'Officer',
  L2: 'Manager',
  L3: 'Lead',
  L4: 'Senior',
  L5: 'Associate',
};
