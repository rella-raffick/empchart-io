/**
 * Auth DAO Layer - Database Access Object
 *
 * Purpose: User database operations using Sequelize ORM
 *
 * Responsibilities:
 * - User CRUD operations
 * - Find user by email
 * - Update last login
 *
 * Does NOT:
 * - Hash passwords (use password utility)
 * - Generate tokens (use JWT utility)
 * - Validate credentials (business logic in service)
 */

import { Transaction } from 'sequelize';
import User, { UserCreationAttributes } from '../models/User';
import Employee from '../models/Employee';
import Designation from '../models/Designation';
import Department from '../models/Department';

export class AuthDao {
  /**
   * Create a new user
   */
  async createUser(userData: UserCreationAttributes, options: { transaction?: Transaction } = {}): Promise<User> {
    return await User.create(userData, {
      transaction: options.transaction,
    });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by ID with employee details
   */
  async findUserById(id: number): Promise<User | null> {
    return await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Employee,
          as: 'employee',
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
    });
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: number): Promise<void> {
    await User.update(
      { lastLogin: new Date() },
      { where: { id: userId } }
    );
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await User.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Get all users (for admin purposes)
   */
  async getAllUsers(): Promise<User[]> {
    return await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
    await User.update(
      { isActive },
      { where: { id: userId } }
    );
  }
}

export default new AuthDao();
