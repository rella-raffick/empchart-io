import Designation from "../models/Designation";
import Department from "../models/Department";
import { OrgChartNode, EmployeePath } from "../types/orgChart";
import employeeDao from "../dao/employeeDao";

class EmployeeService {
  /**
   * Get all employees with their designations and departments
   */
  async getAllEmployees(): Promise<any[]> {
    const employees = await employeeDao.findAll();
    return employees;
  }

  /**
   * Get employee by ID with full details
   */
  async getEmployeeById(id: number): Promise<any | null> {
    return await employeeDao.findById(id);
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

        if (!manager.designation) {
          throw new Error("Manager designation not found");
        }

        if (!employee.designation) {
          throw new Error("Employee designation not found");
        }

        const managerLevel = manager.designation.level;
        const employeeLevel = employee.designation.level;
        
        const levelHierarchy: Record<string, number> = {
          L1: 1, L2: 2, L3: 3, L4: 4, L5: 5
        };
        
        if (levelHierarchy[managerLevel] >= levelHierarchy[employeeLevel]) {
          throw new Error(
            `Manager must be higher level than employee. Employee is ${employeeLevel}, manager is ${managerLevel}`
          );
        }

        const ancestors = await employeeDao.getAncestors(data.managerId);
        if (ancestors.includes(id)) {
          throw new Error("Circular reporting relationship detected");
        }
      }
    }

    const updatedEmployee = await employeeDao.update(id, data);

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
    // Find CEO (employee with no manager)
    const ceo = await this.getCEO();

    if (!ceo) {
      return null;
    }

    // Recursively build hierarchy
    const hierarchy = await this.buildHierarchy(ceo.id);
    const transformed = this.transformForOrgChart(hierarchy);

    return transformed;
  }

  /**
   * Get subtree hierarchy for a specific employee
   */
  async getSubtreeHierarchy(employeeId: number): Promise<OrgChartNode> {
    const employee = await this.buildHierarchy(employeeId);
    const transformed = this.transformForOrgChart(employee);

    return transformed;
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

    const directReports = await employeeDao.getDirectReports(employeeId);

    const directReportsWithHierarchy = await Promise.all(
      directReports.map((report: any) => this.buildHierarchy(report.id))
    );

    (employee as any).directReports = directReportsWithHierarchy;

    return employee;
  }

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
        departmentName: currentEmployee.designation?.department?.name || "Unknown",
        profileImage: currentEmployee.profileImage,
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
    managerId: number | null,
    currentUser?: any
  ): Promise<any> {
    const employee = await employeeDao.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (!employee.designation || !employee.designation.department) {
      throw new Error("Employee designation or department not found");
    }

    if (employee.managerId === null && managerId !== null) {
      throw new Error("Cannot assign a manager to CEO");
    }

    if (managerId !== null) {
      if (typeof managerId !== "number" || Number.isNaN(managerId)) {
        throw new Error("Invalid manager id");
      }

      const newManager = await employeeDao.findById(managerId);

      if (!newManager) {
        throw new Error("Manager not found");
      }

      if (!newManager.designation || !newManager.designation.department) {
        throw new Error("Manager designation or department not found");
      }

      const managerLevel = newManager.designation.level;
      const employeeLevel = employee.designation.level;

      const levelHierarchy: Record<string, number> = {
        L1: 1, L2: 2, L3: 3, L4: 4, L5: 5
      };

      if (levelHierarchy[managerLevel] >= levelHierarchy[employeeLevel]) {
        throw new Error(
          `Manager must be higher level than employee. Employee is ${employeeLevel}, manager is ${managerLevel}`
        );
      }

      if (managerId === employeeId) {
        throw new Error("Employee cannot be their own manager");
      }

      const ancestors = await employeeDao.getAncestors(managerId);
      if (ancestors.includes(employeeId)) {
        throw new Error("This would create a circular reporting structure");
      }

      // Check if current user has permission to perform this reassignment
      if (currentUser && currentUser.role) {
        const { canReassignToManager, roleToLevel } = await import('../utils/levelValidation');
        const userLevel = roleToLevel(currentUser.role);

        const canReassign = canReassignToManager(
          userLevel,
          employeeLevel as any,
          managerLevel as any
        );

        if (!canReassign) {
          throw new Error(
            `You do not have permission to reassign ${employeeLevel} employees to ${managerLevel} managers. ` +
            `As ${currentUser.role}, you can only reassign to managers at your level or higher.`
          );
        }
      }
    }

    const updatedEmployee = await employeeDao.updateManager(employeeId, managerId);

    return updatedEmployee;
  }
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
