/**
 * Designation Data Access Object (DAO)
 *
 * Purpose: Handle all database operations for designations
 *
 * Responsibilities:
 * - CRUD operations on designations table
 * - Query designations by department, level, etc.
 * - No business logic - pure database access
 */

import Designation from "../models/Designation";
import Department from "../models/Department";
import { EmployeeLevel, Department as DepartmentEnum } from "../types/enums";

class DesignationDao {
  /**
   * Get all designations with their departments
   */
  async findAll(): Promise<Designation[]> {
    return await Designation.findAll({
      include: [
        {
          model: Department,
          as: "department",
        },
      ],
      order: [
        ["level", "ASC"],
        ["title", "ASC"],
      ],
    });
  }

  /**
   * Find designation by ID
   */
  async findById(id: number): Promise<Designation | null> {
    return await Designation.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
        },
      ],
    });
  }

  /**
   * Find designations by department ID
   */
  async findByDepartmentId(departmentId: number): Promise<Designation[]> {
    return await Designation.findAll({
      where: { departmentId },
      include: [
        {
          model: Department,
          as: "department",
        },
      ],
      order: [
        ["level", "ASC"],
        ["title", "ASC"],
      ],
    });
  }

  /**
   * Find designations by department code
   */
  async findByDepartmentCode(code: DepartmentEnum): Promise<Designation[]> {
    return await Designation.findAll({
      attributes: ["id", "title", "level"],
      include: [
        {
          model: Department,
          as: "department",
          attributes: [],
          where: { code },
        },
      ],
      order: [
        ["level", "ASC"],
        ["title", "ASC"],
      ],
    });
  }

  /**
   * Find designations by level
   */
  async findByLevel(level: EmployeeLevel): Promise<Designation[]> {
    return await Designation.findAll({
      where: { level },
      include: [
        {
          model: Department,
          as: "department",
        },
      ],
      order: [["title", "ASC"]],
    });
  }

  /**
   * Find designation by title and department ID
   */
  async findByTitleAndDepartment(
    title: string,
    departmentId: number
  ): Promise<Designation | null> {
    return await Designation.findOne({
      where: {
        title,
        departmentId,
      },
      include: [
        {
          model: Department,
          as: "department",
        },
      ],
    });
  }

  /**
   * Find designation by title and department code
   */
  async findByTitleAndDepartmentCode(
    title: string,
    departmentCode: DepartmentEnum
  ): Promise<Designation | null> {
    return await Designation.findOne({
      where: { title },
      include: [
        {
          model: Department,
          as: "department",
          where: { code: departmentCode },
        },
      ],
    });
  }

  /**
   * Create a new designation
   */
  async create(data: {
    title: string;
    departmentId: number;
    level: EmployeeLevel;
  }): Promise<Designation> {
    return await Designation.create(data);
  }

  /**
   * Update a designation
   */
  async update(
    id: number,
    data: {
      title?: string;
      departmentId?: number;
      level?: EmployeeLevel;
    }
  ): Promise<Designation | null> {
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return null;
    }
    return await designation.update(data);
  }

  /**
   * Delete a designation
   */
  async delete(id: number): Promise<boolean> {
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return false;
    }
    await designation.destroy();
    return true;
  }

  /**
   * Check if designation exists by title and department
   */
  async exists(title: string, departmentId: number): Promise<boolean> {
    const count = await Designation.count({
      where: {
        title,
        departmentId,
      },
    });
    return count > 0;
  }

  /**
   * Get designations grouped by department
   */
  async findAllGroupedByDepartment(): Promise<
    Record<DepartmentEnum, Designation[]>
  > {
    const designations = await Designation.findAll({
      attributes: ["id", "title", "level", "departmentId"],
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["code"],
        },
      ],
      order: [
        ["level", "ASC"],
        ["title", "ASC"],
      ],
    });

    const grouped = {
      EXECUTIVE: [],
      TECHNOLOGY: [],
      FINANCE: [],
      BUSINESS: [],
    } as Record<DepartmentEnum, Designation[]>;

    designations.forEach((designation) => {
      if (designation.department) {
        const code = designation.department.code;
        if (!grouped[code]) {
          grouped[code] = [];
        }
        grouped[code].push(designation);
      }
    });

    return grouped;
  }
}

export default new DesignationDao();
