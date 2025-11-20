/**
 * Department Service Layer
 *
 * Purpose: Handle department business logic
 *
 * Responsibilities:
 * - Business logic and validation for departments
 * - Transform data for API responses
 * - Call DAO layer for database operations
 */

import departmentDao from "../dao/departmentDao";
import { Department as DepartmentEnum } from "../types/enums";

class DepartmentService {
  /**
   * Get all departments
   */
  async getAllDepartments() {
    const departments = await departmentDao.findAll();
    return departments.map((dept) => ({
      id: dept.id,
      code: dept.code,
      name: dept.name,
    }));
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: number) {
    const department = await departmentDao.findById(id);
    if (!department) {
      return null;
    }
    return {
      id: department.id,
      code: department.code,
      name: department.name,
    };
  }

  /**
   * Get department by code
   */
  async getDepartmentByCode(code: DepartmentEnum) {
    const department = await departmentDao.findByCode(code);
    if (!department) {
      return null;
    }
    return {
      id: department.id,
      code: department.code,
      name: department.name,
    };
  }

  /**
   * Create a new department
   */
  async createDepartment(data: { code: DepartmentEnum; name: string }) {
    // Check if department code already exists
    const exists = await departmentDao.codeExists(data.code);
    if (exists) {
      throw new Error(`Department with code ${data.code} already exists`);
    }

    const department = await departmentDao.create(data);
    return {
      id: department.id,
      code: department.code,
      name: department.name,
    };
  }

  /**
   * Update a department
   */
  async updateDepartment(
    id: number,
    data: { code?: DepartmentEnum; name?: string }
  ) {
    const department = await departmentDao.findById(id);
    if (!department) {
      throw new Error("Department not found");
    }

    // If updating code, check if new code already exists
    if (data.code && data.code !== department.code) {
      const exists = await departmentDao.codeExists(data.code);
      if (exists) {
        throw new Error(`Department with code ${data.code} already exists`);
      }
    }

    const updated = await departmentDao.update(id, data);
    if (!updated) {
      throw new Error("Failed to update department");
    }

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
    };
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: number) {
    const department = await departmentDao.findById(id);
    if (!department) {
      throw new Error("Department not found");
    }

    // TODO: Check if department has designations or employees
    // before allowing deletion

    const deleted = await departmentDao.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete department");
    }

    return { success: true };
  }
}

export default new DepartmentService();
