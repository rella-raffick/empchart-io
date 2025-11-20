/**
 * Level hierarchy and validation utilities
 * Mirrors backend logic from backend/src/utils/levelValidation.ts
 */

export type EmployeeLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type UserRole = 'admin' | 'ceo' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/**
 * Level hierarchy map
 * L1 = Officers (Top Level) - Number 1 (highest)
 * L2 = Managers
 * L3 = Leads
 * L4 = Seniors
 * L5 = Juniors - Number 5 (lowest)
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
 * Validate if a manager can manage an employee based on levels
 * Rule: Manager's level must be lower number (higher in hierarchy) than employee
 */
export function canManage(managerLevel: EmployeeLevel, employeeLevel: EmployeeLevel): boolean {
  return LEVEL_HIERARCHY[managerLevel] < LEVEL_HIERARCHY[employeeLevel];
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
