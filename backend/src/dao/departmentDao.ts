/**
 * Department Data Access Object (DAO)
 *
 * Purpose: Handle all database operations for departments
 *
 * Responsibilities:
 * - CRUD operations on departments table
 * - Query departments by various criteria
 * - No business logic - pure database access
 */

import Department from "../models/Department";
import { Department as DepartmentEnum } from "../types/enums";

class DepartmentDao {
  /**
   * Get all departments
   */
  async findAll(): Promise<Department[]> {
    return await Department.findAll({
      attributes: ["id", "code", "name"],
      order: [["code", "ASC"]],
    });
  }

  /**
   * Find department by ID
   */
  async findById(id: number): Promise<Department | null> {
    return await Department.findByPk(id);
  }

  /**
   * Find department by code
   */
  async findByCode(code: DepartmentEnum): Promise<Department | null> {
    return await Department.findOne({
      where: { code },
    });
  }

  /**
   * Create a new department
   */
  async create(data: {
    code: DepartmentEnum;
    name: string;
  }): Promise<Department> {
    return await Department.create(data);
  }

  /**
   * Update a department
   */
  async update(
    id: number,
    data: { code?: DepartmentEnum; name?: string }
  ): Promise<Department | null> {
    const department = await Department.findByPk(id);
    if (!department) {
      return null;
    }
    return await department.update(data);
  }

  /**
   * Delete a department
   */
  async delete(id: number): Promise<boolean> {
    const department = await Department.findByPk(id);
    if (!department) {
      return false;
    }
    await department.destroy();
    return true;
  }

  /**
   * Check if department code exists
   */
  async codeExists(code: DepartmentEnum): Promise<boolean> {
    const count = await Department.count({
      where: { code },
    });
    return count > 0;
  }
}

export default new DepartmentDao();
