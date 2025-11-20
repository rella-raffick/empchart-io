import { EmployeeLevel } from '../types/enums';
import { UserRole } from '../models/User';

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
 * Convert UserRole to EmployeeLevel
 * admin and ceo are treated as L1 for permission purposes
 */
export function roleToLevel(role: UserRole): EmployeeLevel {
  if (role === 'admin' || role === 'ceo') {
    return 'L1';
  }
  return role as EmployeeLevel;
}

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
 * L1 and L2 can manage anyone below them
 * Other levels can only manage their subordinates
 */
export function canDragAndDrop(userLevel: EmployeeLevel, employeeLevel: EmployeeLevel): boolean {
  if (userLevel === 'L1' || userLevel === 'L2') {
    if (userLevel === 'L1' && employeeLevel === 'L1') {
      return false;
    }
    return true;
  }

  return LEVEL_HIERARCHY[userLevel] < LEVEL_HIERARCHY[employeeLevel];
}

/**
 * Check if a user can reassign an employee to a specific manager
 * User must be able to drag the employee, new manager must be able to manage the employee,
 * and new manager must be at user's level or below
 */
export function canReassignToManager(
  userLevel: EmployeeLevel,
  employeeLevel: EmployeeLevel,
  newManagerLevel: EmployeeLevel
): boolean {
  if (!canDragAndDrop(userLevel, employeeLevel)) {
    return false;
  }

  if (LEVEL_HIERARCHY[newManagerLevel] >= LEVEL_HIERARCHY[employeeLevel]) {
    return false;
  }

  if (LEVEL_HIERARCHY[newManagerLevel] < LEVEL_HIERARCHY[userLevel]) {
    return false;
  }

  return true;
}
