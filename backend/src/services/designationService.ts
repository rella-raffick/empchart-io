/**
 * Designation Service Layer
 *
 * Purpose: Handle designation business logic
 *
 * Responsibilities:
 * - Business logic and validation for designations
 * - Transform data for API responses
 * - Call DAO layer for database operations
 */

import designationDao from "../dao/designationDao";
import departmentDao from "../dao/departmentDao";
import { EmployeeLevel, Department as DepartmentEnum } from "../types/enums";

class DesignationService {
  /**
   * Get all designations
   */
  async getAllDesignations() {
    const designations = await designationDao.findAll();
    return designations.map((designation) => ({
      id: designation.id,
      title: designation.title,
      level: designation.level,
      departmentId: designation.departmentId,
      department: designation.department
        ? {
            id: designation.department.id,
            code: designation.department.code,
            name: designation.department.name,
          }
        : null,
    }));
  }

  /**
   * Get all designations grouped by department
   */
  async getDesignationsGroupedByDepartment() {
    const grouped = await designationDao.findAllGroupedByDepartment();

    const result: Record<DepartmentEnum, any[]> = {
      EXECUTIVE: [],
      TECHNOLOGY: [],
      FINANCE: [],
      BUSINESS: [],
    };

    Object.entries(grouped).forEach(([deptCode, designations]) => {
      result[deptCode as DepartmentEnum] = designations.map((d) => ({
        id: d.id,
        title: d.title,
        level: d.level,
      }));
    });

    return result;
  }

  /**
   * Get designations by department code
   */
  async getDesignationsByDepartment(departmentCode: DepartmentEnum) {
    const designations = await designationDao.findByDepartmentCode(
      departmentCode
    );

    return designations.map((d) => ({
      id: d.id,
      title: d.title,
      level: d.level,
    }));
  }

  /**
   * Get designations by level
   */
  async getDesignationsByLevel(level: EmployeeLevel) {
    const designations = await designationDao.findByLevel(level);

    return designations.map((d) => ({
      id: d.id,
      title: d.title,
      level: d.level,
      departmentId: d.departmentId,
      department: d.department
        ? {
            id: d.department.id,
            code: d.department.code,
            name: d.department.name,
          }
        : null,
    }));
  }

  /**
   * Get designation by ID
   */
  async getDesignationById(id: number) {
    const designation = await designationDao.findById(id);
    if (!designation) {
      return null;
    }

    return {
      id: designation.id,
      title: designation.title,
      level: designation.level,
      departmentId: designation.departmentId,
      department: designation.department
        ? {
            id: designation.department.id,
            code: designation.department.code,
            name: designation.department.name,
          }
        : null,
    };
  }

  /**
   * Find designation by title and department code
   */
  async findByTitleAndDepartment(
    title: string,
    departmentCode: DepartmentEnum
  ) {
    const designation = await designationDao.findByTitleAndDepartmentCode(
      title,
      departmentCode
    );

    if (!designation) {
      return null;
    }

    return {
      id: designation.id,
      title: designation.title,
      level: designation.level,
      departmentId: designation.departmentId,
      department: designation.department
        ? {
            id: designation.department.id,
            code: designation.department.code,
            name: designation.department.name,
          }
        : null,
    };
  }

  /**
   * Create a new designation
   */
  async createDesignation(data: {
    title: string;
    departmentId: number;
    level: EmployeeLevel;
  }) {
    // Validate department exists
    const department = await departmentDao.findById(data.departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    // Check if designation already exists
    const exists = await designationDao.exists(data.title, data.departmentId);
    if (exists) {
      throw new Error(
        `Designation "${data.title}" already exists in department ${department.name}`
      );
    }

    const designation = await designationDao.create(data);

    return {
      id: designation.id,
      title: designation.title,
      level: designation.level,
      departmentId: designation.departmentId,
    };
  }

  /**
   * Update a designation
   */
  async updateDesignation(
    id: number,
    data: {
      title?: string;
      departmentId?: number;
      level?: EmployeeLevel;
    }
  ) {
    const designation = await designationDao.findById(id);
    if (!designation) {
      throw new Error("Designation not found");
    }

    // Validate department if being updated
    if (data.departmentId && data.departmentId !== designation.departmentId) {
      const department = await departmentDao.findById(data.departmentId);
      if (!department) {
        throw new Error("Department not found");
      }
    }

    // Check for duplicates if title or department is changing
    if (data.title || data.departmentId) {
      const newTitle = data.title || designation.title;
      const newDeptId = data.departmentId || designation.departmentId;

      if (newTitle !== designation.title || newDeptId !== designation.departmentId) {
        const exists = await designationDao.exists(newTitle, newDeptId);
        if (exists) {
          throw new Error(
            `Designation "${newTitle}" already exists in this department`
          );
        }
      }
    }

    const updated = await designationDao.update(id, data);
    if (!updated) {
      throw new Error("Failed to update designation");
    }

    return {
      id: updated.id,
      title: updated.title,
      level: updated.level,
      departmentId: updated.departmentId,
    };
  }

  /**
   * Delete a designation
   */
  async deleteDesignation(id: number) {
    const designation = await designationDao.findById(id);
    if (!designation) {
      throw new Error("Designation not found");
    }

    // TODO: Check if designation is being used by employees
    // before allowing deletion

    const deleted = await designationDao.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete designation");
    }

    return { success: true };
  }
}

export default new DesignationService();
