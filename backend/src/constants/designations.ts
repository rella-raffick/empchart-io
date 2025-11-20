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
 * Designation mappings for each department (simplified)
 */
export const DESIGNATIONS: Record<Department, DesignationMapping> = {
  // EXECUTIVE DEPARTMENT
  EXECUTIVE: {
    // L1 - Officers
    'Chief Executive Officer': 'L1',

    // L2 - Managers
    'Executive Manager': 'L2',

    // L3 - Leads
    'Executive Team Lead': 'L3',

    // L4 - Seniors
    'Senior Executive Analyst': 'L4',

    // L5 - Juniors
    'Executive Associate': 'L5',
  },

  // TECHNOLOGY DEPARTMENT
  TECHNOLOGY: {
    // L1 - Officers
    'Chief Technology Officer': 'L1',

    // L2 - Managers
    'Engineering Manager': 'L2',

    // L3 - Leads
    'Lead Engineer': 'L3',

    // L4 - Seniors
    'Senior Software Engineer': 'L4',

    // L5 - Juniors
    'Software Engineer': 'L5',
  },

  // FINANCE DEPARTMENT
  FINANCE: {
    // L1 - Officers
    'Chief Financial Officer': 'L1',

    // L2 - Managers
    'Finance Manager': 'L2',

    // L3 - Leads
    'Finance Team Lead': 'L3',

    // L4 - Seniors
    'Senior Financial Analyst': 'L4',

    // L5 - Juniors
    'Financial Analyst': 'L5',
  },

  // BUSINESS DEPARTMENT
  BUSINESS: {
    // L1 - Officers
    'Chief Business Officer': 'L1',

    // L2 - Managers
    'Business Development Manager': 'L2',

    // L3 - Leads
    'Business Team Lead': 'L3',

    // L4 - Seniors
    'Senior Business Analyst': 'L4',

    // L5 - Juniors
    'Business Analyst': 'L5',
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
