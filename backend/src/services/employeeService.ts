import Designation from "../models/Designation";
import Department from "../models/Department";
import NodeCache from "node-cache";
import { OrgChartNode, EmployeePath } from "../types/orgChart";
import employeeDao from "../dao/employeeDao";

// Cache for 5 minutes
const hierarchyCache = new NodeCache({ stdTTL: 300 });

class EmployeeService {
  /**
   * Clear hierarchy cache (call after any employee update)
   */
  private clearHierarchyCache(): void {
    hierarchyCache.del("full_hierarchy");
    hierarchyCache.del("ceo_id");
  }

  /**
   * Transform Employee to OrgChartNode format
   */
  private transformForOrgChart(employee: any): OrgChartNode {
    return {
      id: employee.id,
      name: employee.name,
      title: employee.designation?.title || "Unknown",
      level: employee.designation?.level || "L5",
      department: employee.designation?.department?.code || "UNKNOWN",
      departmentName: employee.designation?.department?.name || "Unknown",
      phone: employee.phone,
      profileImage: employee.profileImage,
      status: employee.status,
      managerId: employee.managerId,
      managerName: employee.manager?.name,
      directReportCount:
        (employee.directReports && employee.directReports.length) || 0,
      children:
        (employee.directReports &&
          employee.directReports.map((dr: any) =>
            this.transformForOrgChart(dr)
          )) ||
        [],
    };
  }

  /**
   * Get all employees with their designations and departments
   */
  async getAllEmployees(): Promise<any[]> {
    return await employeeDao.findAll();
  }

  /**
   * Get employee by ID with full details
   */
  async getEmployeeById(id: number): Promise<any | null> {
    return await employeeDao.findById(id);
  }

  /**
   * Update an employee
   */
  async updateEmployee(
    id: number,
    data: {
      name?: string;
      designationId?: number;
      managerId?: number | null;
      phone?: string;
      hireDate?: Date;
      profileImage?: string;
      status?: "active" | "inactive";
    }
  ): Promise<any> {
    const employee = await this.getEmployeeById(id);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Validate designation if being updated
    if (data.designationId && data.designationId !== employee.designationId) {
      const designation = await Designation.findByPk(data.designationId, {
        include: [{ model: Department, as: "department" }],
      });

      if (!designation) {
        throw new Error("Designation not found");
      }

      if (!designation.department) {
        throw new Error("Designation department not found");
      }

      // If employee has a manager, check department compatibility
      if (employee.managerId) {
        const manager = await employeeDao.findById(employee.managerId);

        if (manager && manager.designation && manager.designation.department) {
          if (
            designation.department.code !== manager.designation.department.code
          ) {
            throw new Error(
              `Cannot change to designation in different department while having a manager. New designation is in ${designation.department.code}, manager is in ${manager.designation.department.code}`
            );
          }
        }
      }
    }

    // Validate manager if being updated
    if (data.managerId !== undefined) {
      if (data.managerId !== null) {
        if (data.managerId === id) {
          throw new Error("Employee cannot be their own manager");
        }

        const manager = await employeeDao.findById(data.managerId);

        if (!manager) {
          throw new Error("Manager not found");
        }

        if (!manager.designation || !manager.designation.department) {
          throw new Error("Manager designation or department not found");
        }

        if (!employee.designation || !employee.designation.department) {
          throw new Error("Employee designation or department not found");
        }

        // Check if manager is in the same department
        if (
          employee.designation.department.code !==
          manager.designation.department.code
        ) {
          throw new Error(
            `Manager must be in the same department. Employee is in ${employee.designation.department.code}, manager is in ${manager.designation.department.code}`
          );
        }

        // Prevent circular reporting using DAO's ancestor detection
        const ancestors = await employeeDao.getAncestors(data.managerId);
        if (ancestors.includes(id)) {
          throw new Error("Circular reporting relationship detected");
        }
      }
    }

    const updatedEmployee = await employeeDao.update(id, data);

    // Clear cache
    this.clearHierarchyCache();

    return updatedEmployee;
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: number): Promise<void> {
    const employee = await employeeDao.findById(id);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Check if employee has direct reports
    const directReports = await employeeDao.getDirectReports(id);

    if (directReports.length > 0) {
      throw new Error(
        "Cannot delete employee with direct reports. Please reassign or remove direct reports first."
      );
    }

    await employeeDao.delete(id);

    // Clear cache
    this.clearHierarchyCache();
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(departmentCode: string): Promise<any[]> {
    // First get the department to find its ID
    const department = await Department.findOne({ where: { code: departmentCode } });
    if (!department) {
      return [];
    }
    return await employeeDao.findAll({ departmentId: department.id });
  }

  /**
   * Get employees by level
   */
  async getEmployeesByLevel(level: string): Promise<any[]> {
    return await employeeDao.findAll({ level });
  }

  /**
   * Search employees by name
   */
  async searchEmployees(searchTerm: string): Promise<any[]> {
    return await employeeDao.searchByName(searchTerm);
  }

  /**
   * Get direct reports for an employee
   */
  async getDirectReports(employeeId: number): Promise<any[]> {
    return await employeeDao.getDirectReports(employeeId);
  }

  /**
   * Get CEO (employee with no manager)
   */
  private async getCEO(): Promise<any | null> {
    return await employeeDao.findCEO();
  }

  /**
   * Get organization hierarchy starting from CEO
   */
  async getOrganizationHierarchy(): Promise<OrgChartNode | null> {
    // Check cache first
    const cached = hierarchyCache.get<OrgChartNode>("full_hierarchy");
    if (cached) {
      return cached;
    }

    // Find CEO (employee with no manager)
    const ceo = await this.getCEO();

    if (!ceo) {
      return null;
    }

    // Recursively build hierarchy
    const hierarchy = await this.buildHierarchy(ceo.id);
    const transformed = this.transformForOrgChart(hierarchy);

    // Cache the result
    hierarchyCache.set("full_hierarchy", transformed);

    return transformed;
  }

  /**
   * Get subtree hierarchy for a specific employee
   */
  async getSubtreeHierarchy(employeeId: number): Promise<OrgChartNode> {
    const employee = await this.buildHierarchy(employeeId);
    return this.transformForOrgChart(employee);
  }

  /**
   * Helper method to recursively build employee hierarchy
   */
  async buildHierarchy(employeeId: number): Promise<any> {
    if (typeof employeeId !== "number" || Number.isNaN(employeeId)) {
      throw new Error("Invalid employee id");
    }

    const employee = await employeeDao.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Get direct reports
    const directReports = await employeeDao.getDirectReports(employeeId);

    // Recursively build hierarchy for each direct report
    const directReportsWithHierarchy = await Promise.all(
      directReports.map((report: any) => this.buildHierarchy(report.id))
    );

    // Attach direct reports to employee
    (employee as any).directReports = directReportsWithHierarchy;

    return employee;
  }

  /**
   * Get path from employee to CEO (breadcrumb trail)
   */
  async getEmployeePath(employeeId: number): Promise<EmployeePath[]> {
    const path: EmployeePath[] = [];
    let currentEmployee = await employeeDao.findById(employeeId);

    if (!currentEmployee) {
      throw new Error("Employee not found");
    }

    // Build path from employee to CEO
    while (currentEmployee) {
      path.unshift({
        id: currentEmployee.id,
        name: currentEmployee.name,
        designation: currentEmployee.designation?.title || "Unknown",
        level: currentEmployee.designation?.level || "L5",
        department: currentEmployee.designation?.department?.code || "UNKNOWN",
      });

      if (currentEmployee.managerId === null) {
        break;
      }

      currentEmployee = await employeeDao.findById(currentEmployee.managerId);
    }

    return path;
  }

  /**
   * Update employee's manager (for drag & drop)
   */
  async updateManager(
    employeeId: number,
    managerId: number | null
  ): Promise<any> {
    const employee = await employeeDao.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Validation: Check if employee has designation and department
    if (!employee.designation || !employee.designation.department) {
      throw new Error("Employee designation or department not found");
    }

    // Can't change CEO's manager
    if (employee.managerId === null && managerId !== null) {
      throw new Error("Cannot assign a manager to CEO");
    }

    // If setting a manager (not removing)
    if (managerId !== null) {
      if (typeof managerId !== "number" || Number.isNaN(managerId)) {
        throw new Error("Invalid manager id");
      }

      const newManager = await employeeDao.findById(managerId);

      if (!newManager) {
        throw new Error("Manager not found");
      }

      // Validation: Check if manager has designation and department
      if (!newManager.designation || !newManager.designation.department) {
        throw new Error("Manager designation or department not found");
      }

      // Check if manager is in the same department
      const employeeDeptCode = employee.designation.department.code;
      const managerDeptCode = newManager.designation.department.code;

      if (employeeDeptCode !== managerDeptCode) {
        throw new Error(
          `Cannot assign manager from different department. Employee is in ${employeeDeptCode}, manager is in ${managerDeptCode}`
        );
      }

      // Prevent self-reporting
      if (managerId === employeeId) {
        throw new Error("Employee cannot be their own manager");
      }

      // Use DAO's getAncestors to check for circular reference in the hierarchy
      const ancestors = await employeeDao.getAncestors(managerId);
      if (ancestors.includes(employeeId)) {
        throw new Error("This would create a circular reporting structure");
      }
    }

    // Update the manager using DAO
    const updatedEmployee = await employeeDao.updateManager(employeeId, managerId);

    // Clear cache
    this.clearHierarchyCache();

    return updatedEmployee;
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(): Promise<{
    total: number;
    byDepartment: { [key: string]: number };
    byLevel: { [key: string]: number };
    active: number;
    inactive: number;
  }> {
    const employees = await this.getAllEmployees();

    const stats = {
      total: employees.length,
      byDepartment: {} as { [key: string]: number },
      byLevel: {} as { [key: string]: number },
      active: 0,
      inactive: 0,
    };

    employees.forEach((employee: any) => {
      // Count by department
      if (employee.designation && employee.designation.department) {
        const deptCode = employee.designation.department.code;
        stats.byDepartment[deptCode] = (stats.byDepartment[deptCode] || 0) + 1;
      }

      // Count by level
      if (employee.designation) {
        const level = employee.designation.level;
        stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
      }

      // Count by status
      if (employee.status === "active") {
        stats.active++;
      } else {
        stats.inactive++;
      }
    });

    return stats;
  }
}

export default new EmployeeService();
