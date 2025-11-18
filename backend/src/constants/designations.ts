/**
 * Designation to Level Mapping
 *
 * Maps job titles (designations) to organizational levels (L1-L5)
 * based on department/team
 *
 * Level Hierarchy:
 * L1 - Officers (C-Suite)
 * L2 - Managers
 * L3 - Leads
 * L4 - Seniors
 * L5 - Juniors/Associates
 */

import { Department, EmployeeLevel } from '../types/enums';

export type Designation = string;

interface DesignationMapping {
  [key: string]: EmployeeLevel;
}

/**
 * Designation mappings for each department
 */
export const DESIGNATIONS: Record<Department, DesignationMapping> = {
  // EXECUTIVE DEPARTMENT
  EXECUTIVE: {
    // L1 - Officers
    'Chief Executive Officer': 'L1',
    'CEO': 'L1',

    // L2 - Managers
    'Executive Director': 'L2',
    'Director of Operations': 'L2',
    'Executive Manager': 'L2',

    // L3 - Leads
    'Executive Team Lead': 'L3',
    'Operations Lead': 'L3',

    // L4 - Seniors
    'Senior Executive Analyst': 'L4',
    'Senior Operations Specialist': 'L4',

    // L5 - Juniors
    'Executive Associate': 'L5',
    'Executive Assistant': 'L5',
    'Junior Executive Analyst': 'L5',
  },

  // TECHNOLOGY DEPARTMENT
  TECHNOLOGY: {
    // L1 - Officers
    'Chief Technology Officer': 'L1',
    'CTO': 'L1',
    'Chief Information Officer': 'L1',
    'CIO': 'L1',
    'Chief Information Security Officer': 'L1',
    'CISO': 'L1',
    'Chief Innovation Officer': 'L1',

    // L2 - Managers
    'Engineering Manager': 'L2',
    'Technical Manager': 'L2',
    'Development Manager': 'L2',
    'Product Manager': 'L2',
    'IT Manager': 'L2',

    // L3 - Leads
    'Tech Lead': 'L3',
    'Lead Engineer': 'L3',
    'Team Lead': 'L3',
    'Engineering Lead': 'L3',
    'Software Engineering Lead': 'L3',

    // L4 - Seniors
    'Senior Software Engineer': 'L4',
    'Senior Engineer': 'L4',
    'Senior Developer': 'L4',
    'Senior Full Stack Engineer': 'L4',
    'Senior Backend Engineer': 'L4',
    'Senior Frontend Engineer': 'L4',
    'Senior DevOps Engineer': 'L4',

    // L5 - Juniors
    'Software Engineer': 'L5',
    'Engineer': 'L5',
    'Developer': 'L5',
    'Junior Engineer': 'L5',
    'Junior Developer': 'L5',
    'Associate Engineer': 'L5',
    'Full Stack Engineer': 'L5',
    'Backend Engineer': 'L5',
    'Frontend Engineer': 'L5',
    'DevOps Engineer': 'L5',
  },

  // FINANCE DEPARTMENT
  FINANCE: {
    // L1 - Officers
    'Chief Financial Officer': 'L1',
    'CFO': 'L1',
    'Chief Accounting Officer': 'L1',
    'Chief Customer Officer': 'L1',

    // L2 - Managers
    'Finance Manager': 'L2',
    'Accounting Manager': 'L2',
    'Financial Planning Manager': 'L2',
    'Controller': 'L2',

    // L3 - Leads
    'Senior Financial Analyst': 'L3',
    'Finance Team Lead': 'L3',
    'Accounting Lead': 'L3',
    'Financial Planning Lead': 'L3',

    // L4 - Seniors
    'Senior Accountant': 'L4',
    'Senior Financial Analyst': 'L4',
    'Senior Auditor': 'L4',
    'Senior Tax Specialist': 'L4',

    // L5 - Juniors
    'Accountant': 'L5',
    'Financial Analyst': 'L5',
    'Junior Accountant': 'L5',
    'Junior Financial Analyst': 'L5',
    'Associate Accountant': 'L5',
    'Auditor': 'L5',
    'Tax Specialist': 'L5',
  },

  // BUSINESS DEPARTMENT
  BUSINESS: {
    // L1 - Officers
    'Chief Business Officer': 'L1',
    'CBO': 'L1',
    'Chief Communications Officer': 'L1',
    'CCO': 'L1',
    'Chief Brand Officer': 'L1',
    'Chief Business Development Officer': 'L1',
    'CBDO': 'L1',
    'Chief Marketing Officer': 'L1',
    'CMO': 'L1',

    // L2 - Managers
    'Business Manager': 'L2',
    'Business Development Manager': 'L2',
    'Marketing Manager': 'L2',
    'Brand Manager': 'L2',
    'Communications Manager': 'L2',
    'Sales Manager': 'L2',

    // L3 - Leads
    'Business Team Lead': 'L3',
    'Business Development Lead': 'L3',
    'Marketing Lead': 'L3',
    'Sales Lead': 'L3',
    'Brand Lead': 'L3',

    // L4 - Seniors
    'Senior Business Executive': 'L4',
    'Senior Business Analyst': 'L4',
    'Senior Marketing Executive': 'L4',
    'Senior Sales Executive': 'L4',
    'Senior Brand Strategist': 'L4',

    // L5 - Juniors
    'Business Executive': 'L5',
    'Business Analyst': 'L5',
    'Marketing Executive': 'L5',
    'Sales Executive': 'L5',
    'Junior Business Analyst': 'L5',
    'Associate Business Executive': 'L5',
    'Marketing Associate': 'L5',
  },
};

/**
 * Get level from designation and department
 */
export function getLevelFromDesignation(
  designation: string,
  department: Department
): EmployeeLevel {
  const normalizedDesignation = designation.trim();

  // Try exact match first
  const level = DESIGNATIONS[department][normalizedDesignation];
  if (level) {
    return level;
  }

  // Try case-insensitive match
  const lowerDesignation = normalizedDesignation.toLowerCase();
  const departmentDesignations = DESIGNATIONS[department];

  for (const [key, value] of Object.entries(departmentDesignations)) {
    if (key.toLowerCase() === lowerDesignation) {
      return value;
    }
  }

  // Default to L5 if no match found
  return 'L5';
}

/**
 * Get all designations for a specific department
 */
export function getDesignationsByDepartment(department: Department): string[] {
  return Object.keys(DESIGNATIONS[department]);
}

/**
 * Get all designations for a specific level in a department
 */
export function getDesignationsByLevel(
  department: Department,
  level: EmployeeLevel
): string[] {
  const departmentDesignations = DESIGNATIONS[department];
  return Object.entries(departmentDesignations)
    .filter(([_, designationLevel]) => designationLevel === level)
    .map(([designation]) => designation);
}

/**
 * Validate if a designation exists for a department
 */
export function isValidDesignation(
  designation: string,
  department: Department
): boolean {
  const level = getLevelFromDesignation(designation, department);
  return level !== 'L5' || DESIGNATIONS[department][designation] === 'L5';
}
