import { FastifyInstance } from "fastify";
import employeeController from "../controllers/employeeController";
import { authMiddleware } from "../middleware/auth";

/**
 * Employee Routes
 *
 * Base URL: /api/employees (configured in index.ts)
 * All routes require authentication via JWT token
 *
 * Route Registration Order:
 * 1. Static routes (no parameters) - must come first
 * 2. Collection routes (root path)
 * 3. Dynamic routes (with :id parameter) - must come last
 *
 * This order prevents route conflicts (e.g., /hierarchy being matched as /:id)
 */
export default async function employeeRoutes(fastify: FastifyInstance) {
  // ============================================================
  // STATIC ROUTES - No URL parameters
  // These MUST be registered before dynamic routes with :id
  // ============================================================

  /**
   * GET /api/employees/hierarchy
   * Get full organization hierarchy tree starting from CEO
   * Returns nested structure with all employees and their reports
   * Cached for 5 minutes for performance
   */
  fastify.get("/hierarchy", {
    preHandler: authMiddleware,
    handler: employeeController.getHierarchy.bind(employeeController),
  });

  /**
   * GET /api/employees/search?search=<term>
   * Search employees by name (case-insensitive)
   * Query params: search (string)
   * Returns array of matching employees with full details
   */
  fastify.get("/search", {
    preHandler: authMiddleware,
    handler: employeeController.searchEmployees.bind(employeeController),
  });

  /**
   * GET /api/employees/filter/department?department=<code>
   * Get all employees in a specific department
   * Query params: department (string) - department code (e.g., "ENG", "SALES")
   * Returns array of employees in that department
   */
  fastify.get("/filter/department", {
    preHandler: authMiddleware,
    handler: employeeController.getByDepartment.bind(employeeController),
  });

  /**
   * GET /api/employees/filter/level?level=<level>
   * Get all employees at a specific level
   * Query params: level (string) - employee level (e.g., "L1", "L2", "L3")
   * Returns array of employees at that level
   */
  fastify.get("/filter/level", {
    preHandler: authMiddleware,
    handler: employeeController.getByLevel.bind(employeeController),
  });

  /**
   * GET /api/employees/stats/overview
   * Get employee statistics and analytics
   * Returns counts by department, level, status, etc.
   */
  fastify.get("/stats/overview", {
    preHandler: authMiddleware,
    handler: employeeController.getStats.bind(employeeController),
  });

  // ============================================================
  // COLLECTION ROUTES - Root path operations
  // ============================================================

  /**
   * GET /api/employees
   * Get all employees with their designations, departments, managers, and direct reports
   * Returns complete list with all associations
   */
  fastify.get("/", {
    preHandler: authMiddleware,
    handler: employeeController.getAllEmployees.bind(employeeController),
  });

  // ============================================================
  // DYNAMIC ROUTES - Routes with :id parameter
  // These MUST be registered after static routes to avoid conflicts
  // ============================================================

  /**
   * GET /api/employees/:id/hierarchy
   * Get hierarchy subtree starting from specific employee
   * Params: id (number) - employee ID
   * Returns nested structure with employee and all their subordinates
   */
  fastify.get("/:id/hierarchy", {
    preHandler: authMiddleware,
    handler: employeeController.getSubtree.bind(employeeController),
  });

  /**
   * GET /api/employees/:id/path
   * Get breadcrumb path from employee to CEO
   * Params: id (number) - employee ID
   * Returns array of employees from CEO down to specified employee
   * Useful for showing organizational path/hierarchy
   */
  fastify.get("/:id/path", {
    preHandler: authMiddleware,
    handler: employeeController.getEmployeePath.bind(employeeController),
  });

  /**
   * GET /api/employees/:id/reports
   * Get direct reports for an employee
   * Params: id (number) - manager's employee ID
   * Returns array of employees who report directly to this manager
   */
  fastify.get("/:id/reports", {
    preHandler: authMiddleware,
    handler: employeeController.getDirectReports.bind(employeeController),
  });

  /**
   * PATCH /api/employees/:id/manager
   * Update employee's manager (for drag & drop in org chart)
   * Params: id (number) - employee ID
   * Body: { managerId: number | null }
   * Validates:
   * - Manager exists and is in same department
   * - No circular reporting (employee can't be in manager's chain)
   * - CEO's manager cannot be changed
   */
  fastify.patch("/:id/manager", {
    preHandler: authMiddleware,
    handler: employeeController.updateManager.bind(employeeController),
  });

  /**
   * GET /api/employees/:id
   * Get single employee by ID with full details
   * Params: id (number) - employee ID
   * Returns employee with designation, department, manager, and direct reports
   */
  fastify.get("/:id", {
    preHandler: authMiddleware,
    handler: employeeController.getEmployeeById.bind(employeeController),
  });

  /**
   * PATCH /api/employees/:id
   * Update employee information
   * Params: id (number) - employee ID
   * Body: {
   *   name?: string,
   *   designationId?: number,
   *   managerId?: number | null,
   *   phone?: string,
   *   hireDate?: string (ISO date),
   *   profileImage?: string (URL),
   *   status?: "active" | "inactive"
   * }
   * Validates:
   * - New designation compatible with current manager's department
   * - New manager is in same department
   * - No circular reporting relationships
   */
  fastify.patch("/:id", {
    preHandler: authMiddleware,
    handler: employeeController.updateEmployee.bind(employeeController),
  });

  /**
   * DELETE /api/employees/:id
   * Delete an employee
   * Params: id (number) - employee ID
   * Validates:
   * - Employee has no direct reports (must reassign first)
   * Returns success message on deletion
   */
  fastify.delete("/:id", {
    preHandler: authMiddleware,
    handler: employeeController.deleteEmployee.bind(employeeController),
  });
}
