import { EmployeeLevel } from '../types/enums';

/**
 * Level hierarchy map
 * L1 = Officers (Top Level)
 * L2 = Managers
 * L3 = Leads
 * L4 = Seniors
 * L5 = Juniors
 */
export const LEVEL_HIERARCHY: Record<EmployeeLevel, number> = {
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
};

/**
 * Level descriptions
 */
export const LEVEL_DESCRIPTIONS: Record<EmployeeLevel, string> = {
  L1: 'Officers (C-Suite)',
  L2: 'Managers',
  L3: 'Leads',
  L4: 'Seniors',
  L5: 'Juniors',
};

/**
 * Validate if a manager can manage an employee based on levels
 * Rule: Manager's level must be lower number (higher in hierarchy) than employee
 */
export function canManage(managerLevel: EmployeeLevel, employeeLevel: EmployeeLevel): boolean {
  return LEVEL_HIERARCHY[managerLevel] < LEVEL_HIERARCHY[employeeLevel];
}

/**
 * Get valid manager levels for an employee
 */
export function getValidManagerLevels(employeeLevel: EmployeeLevel): EmployeeLevel[] {
  const employeeRank = LEVEL_HIERARCHY[employeeLevel];
  return (Object.keys(LEVEL_HIERARCHY) as EmployeeLevel[]).filter(
    (level) => LEVEL_HIERARCHY[level] < employeeRank
  );
}

/**
 * Get level from designation pattern
 */
export function getLevelFromDesignation(designation: string): EmployeeLevel | null {
  const lower = designation.toLowerCase();

  // Officers (L1) - C-Suite titles
  if (lower.includes('ceo') || lower.includes('cto') || lower.includes('cfo') ||
      lower.includes('coo') || lower.includes('chief') || lower.includes('officer')) {
    return 'L1';
  }

  // Managers (L2)
  if (lower.includes('manager') || lower.includes('director') || lower.includes('head of')) {
    return 'L2';
  }

  // Leads (L3)
  if (lower.includes('lead') || lower.includes('team lead') || lower.includes('tech lead')) {
    return 'L3';
  }

  // Seniors (L4)
  if (lower.includes('senior') || lower.includes('sr.') || lower.includes('sr ')) {
    return 'L4';
  }

  // Juniors (L5) - Default for entry level
  if (lower.includes('junior') || lower.includes('jr.') || lower.includes('jr ') ||
      lower.includes('associate') || lower.includes('trainee')) {
    return 'L5';
  }

  // Default to L5 if no pattern matches
  return 'L5';
}

/**
 * Validate level consistency in hierarchy
 * Ensures employee's level is greater than manager's level
 */
export function validateLevelHierarchy(
  employeeLevel: EmployeeLevel,
  managerLevel: EmployeeLevel
): { valid: boolean; error?: string } {
  if (!canManage(managerLevel, employeeLevel)) {
    const validLevels = getValidManagerLevels(employeeLevel).join(', ');
    return {
      valid: false,
      error: `${LEVEL_DESCRIPTIONS[managerLevel]} cannot manage ${LEVEL_DESCRIPTIONS[employeeLevel]}. Valid manager levels: ${validLevels}`,
    };
  }

  return { valid: true };
}

/**
 * Get all levels that a user can manage
 * A user can only manage employees with higher level numbers (lower in hierarchy)
 * 
 * @param userLevel - The level of the current user
 * @returns Array of levels that can be managed
 * 
 * @example
 * getManagedLevels('L1') // ['L2', 'L3', 'L4', 'L5']
 * getManagedLevels('L2') // ['L3', 'L4', 'L5']
 * getManagedLevels('L3') // ['L4', 'L5']
 * getManagedLevels('L4') // ['L5']
 * getManagedLevels('L5') // []
 */
export function getManagedLevels(userLevel: EmployeeLevel): EmployeeLevel[] {
  const userLevelNum = LEVEL_HIERARCHY[userLevel];
  const levels: EmployeeLevel[] = [];

  for (const [level, num] of Object.entries(LEVEL_HIERARCHY)) {
    if (num > userLevelNum) {
      levels.push(level as EmployeeLevel);
    }
  }

  return levels;
}

/**
 * Check if a user has permission to perform drag & drop for an employee
 * Rules:
 * - Same level cannot drag & drop each other (e.g., L1 CTO cannot drag L1 CEO)
 * - Must be able to manage the employee (lower level number = higher rank)
 * 
 * @param userLevel - The level of the current user performing the action
 * @param employeeLevel - The level of the employee being moved
 * @returns true if user can drag & drop this employee
 * 
 * @example
 * canDragAndDrop('L1', 'L1') // false - Same level cannot manage each other
 * canDragAndDrop('L1', 'L2') // true - L1 can manage L2
 * canDragAndDrop('L3', 'L4') // true - L3 can manage L4
 * canDragAndDrop('L3', 'L2') // false - L3 cannot manage L2 (higher rank)
 * canDragAndDrop('L3', 'L5') // true - L3 can manage L5
 */
export function canDragAndDrop(userLevel: EmployeeLevel, employeeLevel: EmployeeLevel): boolean {
  // Same level cannot drag & drop each other
  if (userLevel === employeeLevel) {
    return false;
  }
  
  // Must be able to manage the employee (user level must be lower number)
  return canManage(userLevel, employeeLevel);
}
