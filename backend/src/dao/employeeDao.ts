/**
 * DAO Layer - Database Access Object
 *
 * Purpose: Direct interaction with database using Sequelize ORM
 *
 * Responsibilities:
 * - CRUD operations
 * - Database queries with filters
 * - Return Sequelize models
 *
 * Does NOT:
 * - Handle business logic
 * - Perform validations
 * - Transform data for API responses
 */

import { Op, Transaction } from 'sequelize';
import Employee, { EmployeeAttributes, EmployeeCreationAttributes } from '../models/Employee';
import Designation from '../models/Designation';
import Department from '../models/Department';
import { EmployeeLevel } from '../types/enums';

export class EmployeeDao {
  /**
   * Find all employees with optional filters
   * Includes designation and department via JOINs
   */
  async findAll(filters?: {
    departmentId?: number;
    level?: string;
    managerId?: number | null;
  }): Promise<Employee[]> {
    const where: any = {};

    // Build where clause for filters
    if (filters?.managerId !== undefined) {
      where.managerId = filters.managerId;
    }

    const include: any[] = [
      {
        model: Designation,
        as: 'designation',
        include: [
          {
            model: Department,
            as: 'department',
          },
        ],
      },
      {
        model: Employee,
        as: 'manager',
        required: false,
        include: [
          {
            model: Designation,
            as: 'designation',
            include: [
              {
                model: Department,
                as: 'department',
              },
            ],
          },
        ],
      },
    ];

    // Filter by department or level via JOIN
    if (filters?.departmentId || filters?.level) {
      const designationWhere: any = {};
      if (filters?.level) {
        designationWhere.level = filters.level;
      }
      if (filters?.departmentId) {
        designationWhere.departmentId = filters.departmentId;
      }

      // Update the designation include with where clause
      include[0].where = designationWhere;
    }

    return await Employee.findAll({
      where,
      include,
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Find employee by ID with all relationships
   */
  async findById(id: number, transaction?: Transaction): Promise<Employee | null> {
    return await Employee.findByPk(id, {
      include: [
        {
          model: Designation,
          as: 'designation',
          include: [
            {
              model: Department,
              as: 'department',
            },
          ],
        },
        {
          model: Employee,
          as: 'manager',
          required: false,
          include: [
            {
              model: Designation,
              as: 'designation',
              include: [
                {
                  model: Department,
                  as: 'department',
                },
              ],
            },
          ],
        },
        {
          model: Employee,
          as: 'directReports',
          include: [
            {
              model: Designation,
              as: 'designation',
              include: [
                {
                  model: Department,
                  as: 'department',
                },
              ],
            },
          ],
        },
      ],
      transaction,
    });
  }

  /**
   * Create a new employee
   */
  async create(data: EmployeeCreationAttributes, transaction?: Transaction): Promise<Employee> {
    const employee = await Employee.create(data, { transaction });
    // Fetch with relationships
    return (await this.findById(employee.id, transaction))!;
  }

  /**
   * Update employee
   */
  async update(id: number, data: Partial<EmployeeAttributes>): Promise<Employee> {
    await Employee.update(data, {
      where: { id },
    });
    return (await this.findById(id))!;
  }

  /**
   * Update employee's manager (key operation for drag & drop)
   */
  async updateManager(id: number, managerId: number | null): Promise<Employee> {
    await Employee.update(
      { managerId },
      { where: { id } }
    );
    return (await this.findById(id))!;
  }

  /**
   * Delete employee
   */
  async delete(id: number): Promise<number> {
    return await Employee.destroy({
      where: { id },
    });
  }

  /**
   * Get all ancestor employee IDs (for circular reference detection)
   * Walks up the management chain
   */
  async getAncestors(employeeId: number): Promise<number[]> {
    const ancestors: number[] = [];
    let currentId: number | null = employeeId;
    let depth = 0;
    const MAX_DEPTH = 20; // Prevent infinite loops

    while (currentId !== null && depth < MAX_DEPTH) {
      const employee: Employee | null = await Employee.findByPk(currentId, {
        attributes: ['id', 'managerId'],
      });

      if (!employee || !employee.managerId) {
        break;
      }

      ancestors.push(employee.managerId);
      currentId = employee.managerId;
      depth++;
    }

    return ancestors;
  }

  /**
   * Get direct reports for an employee
   */
  async getDirectReports(managerId: number): Promise<Employee[]> {
    return await Employee.findAll({
      where: { managerId },
      include: [
        {
          model: Designation,
          as: 'designation',
          include: [
            {
              model: Department,
              as: 'department',
            },
          ],
        },
      ],
    });
  }

  /**
   * Get organization tree (all employees with hierarchy)
   * Useful for building org chart
   */
  async getOrgTree(): Promise<Employee[]> {
    return await this.findAll();
  }

  /**
   * Find potential managers by allowed levels
   * Can optionally filter by department
   */
  async findManagersByLevels(
    departmentId: number,
    levels: EmployeeLevel[],
    transaction?: Transaction
  ): Promise<Employee[]> {
    if (!levels.length) {
      return [];
    }

    return await Employee.findAll({
      include: [
        {
          model: Designation,
          as: 'designation',
          where: {
            departmentId,
            level: levels,
          },
          include: [
            {
              model: Department,
              as: 'department',
            },
          ],
        },
      ],
      order: [
        ['hireDate', 'ASC'],
        ['createdAt', 'ASC'],
      ],
      transaction,
    });
  }

  /**
   * Find the CEO (fallback manager when no higher level exists)
   */
  async findCEO(transaction?: Transaction): Promise<Employee | null> {
    return await Employee.findOne({
      include: [
        {
          model: Designation,
          as: 'designation',
          where: {
            title: 'Chief Executive Officer',
          },
          include: [
            {
              model: Department,
              as: 'department',
              where: { code: 'EXECUTIVE' },
            },
          ],
        },
      ],
      order: [
        ['hireDate', 'ASC'],
        ['createdAt', 'ASC'],
      ],
      transaction,
    });
  }

  /**
   * Search employees by name (case-insensitive)
   */
  async searchByName(searchTerm: string): Promise<Employee[]> {
    return await Employee.findAll({
      where: {
        name: {
          [Op.iLike]: `%${searchTerm}%`,
        },
      },
      include: [
        {
          model: Designation,
          as: 'designation',
          include: [
            {
              model: Department,
              as: 'department',
            },
          ],
        },
        {
          model: Employee,
          as: 'manager',
          required: false,
          include: [
            {
              model: Designation,
              as: 'designation',
              include: [
                {
                  model: Department,
                  as: 'department',
                },
              ],
            },
          ],
        },
        {
          model: Employee,
          as: 'directReports',
          include: [
            {
              model: Designation,
              as: 'designation',
              include: [
                {
                  model: Department,
                  as: 'department',
                },
              ],
            },
          ],
        },
      ],
      order: [['name', 'ASC']],
    });
  }
}

export default new EmployeeDao();
