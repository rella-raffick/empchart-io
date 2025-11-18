/**
 * Auth Service Layer - Business Logic
 *
 * Purpose: Handle authentication business rules
 *
 * Responsibilities:
 * - Register user (validate, hash password, create user)
 * - Login user (validate credentials, generate token)
 * - Refresh token
 * - Validate user input
 * - Call DAO for database operations
 * - Call JWT utility for token generation
 * - Call password utility for hashing/comparison
 *
 * Does NOT:
 * - Handle HTTP requests/responses
 * - Access database directly (use DAO)
 * - Set HTTP status codes
 */

import { Transaction } from 'sequelize';
import authDao from '../dao/authDao';
import employeeDao from '../dao/employeeDao';
import sequelize from '../config/database';
import Designation from '../models/Designation';
import DepartmentModel from '../models/Department';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, verifyToken } from '../utils/jwt';
import { Department as DepartmentCode, EmployeeLevel } from '../types/enums';
import { UserRole } from '../models/User';
import { getLevelFromDesignation } from '../constants/designations';
import { getValidManagerLevels, LEVEL_HIERARCHY } from '../utils/levelValidation';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  department: DepartmentCode;
  designation: string; // Job title from dropdown (e.g., "Senior Software Engineer")
  phone: string;
  profileImage: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: UserRole;
    department: DepartmentCode;
    isActive: boolean;
    employeeId: number | null;
  };
  employee?: {
    id: number;
    name: string;
    designationId: number;
    managerId: number | null;
    phone?: string | null;
    profileImage?: string | null;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, department, designation, phone, profileImage } = input;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!name || !name.trim()) {
      throw new Error('Name is required');
    }

    if (!phone || !phone.trim()) {
      throw new Error('Phone number is required');
    }

    if (!profileImage || !profileImage.trim()) {
      throw new Error('Profile image is required');
    }

    // Validate designation is provided
    if (!designation || !designation.trim()) {
      throw new Error('Designation is required');
    }

    // Check if email already exists
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await authDao.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const departmentRecord = await DepartmentModel.findOne({
      where: { code: department },
    });

    if (!departmentRecord) {
      throw new Error('Invalid department selected');
    }

    const designationRecord = await Designation.findOne({
      where: {
        title: designation.trim(),
        departmentId: departmentRecord.id,
      },
    });

    if (!designationRecord) {
      throw new Error('Designation not found for the selected department');
    }

    // Automatically map designation to level (L1-L5)
    // Example: "Senior Software Engineer" + "TECHNOLOGY" → "L4"
    const level =
      (designationRecord.level as EmployeeLevel | undefined) ??
      getLevelFromDesignation(designation, department);

    // Hash password
    const passwordHash = await hashPassword(password);

    const trimmedEmail = normalizedEmail;
    const trimmedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedProfileImage = profileImage.trim();

    const result = await sequelize.transaction(async (transaction) => {
      const managerId = await this.resolveManagerId(departmentRecord.id, level, transaction);

      const employee = await employeeDao.create(
        {
          name: trimmedName,
          designationId: designationRecord.id,
          managerId,
          phone: normalizedPhone,
          profileImage: normalizedProfileImage,
          status: 'active',
          hireDate: new Date(),
        },
        transaction
      );

      // Create user linked to employee
      const user = await authDao.createUser(
        {
          employeeId: employee.id,
          email: trimmedEmail,
          passwordHash,
          role: level, // Auto-assigned based on designation
          department,
          isActive: true,
        },
        { transaction }
      );

      return { user, employee };
    });

    // Generate JWT token
    const token = generateToken(result.user.id, result.user.email, result.user.role);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        department,
        isActive: result.user.isActive,
        employeeId: result.user.employeeId ?? null,
      },
      employee: {
        id: result.employee.id,
        name: result.employee.name,
        designationId: result.employee.designationId,
        managerId: result.employee.managerId,
        phone: result.employee.phone,
        profileImage: result.employee.profileImage,
      },
      token,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await authDao.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is disabled. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await authDao.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        employeeId: user.employeeId ?? null,
      },
      token,
    };
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: number) {
    const user = await authDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      employeeId: user.employeeId ?? null,
    };
  }

  /**
   * Verify token and return user
   */
  async verifyUserToken(token: string) {
    try {
      const payload = verifyToken(token);
      const user = await authDao.findUserById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is disabled');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId ?? null,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  private async resolveManagerId(
    departmentId: number,
    employeeLevel: EmployeeLevel,
    transaction?: Transaction
  ): Promise<number | null> {
    const candidateLevels = getValidManagerLevels(employeeLevel);

    if (candidateLevels.length) {
      const managers = await employeeDao.findManagersByLevels(departmentId, candidateLevels, transaction);

      if (managers.length) {
        const targetRank = LEVEL_HIERARCHY[employeeLevel] ?? Number.MAX_SAFE_INTEGER;
        const getRank = (candidate: any) => {
          const candidateLevel = candidate?.designation?.level as EmployeeLevel | undefined;
          return LEVEL_HIERARCHY[candidateLevel ?? employeeLevel] ?? targetRank;
        };

        managers.sort((a, b) => {
          const aRank = getRank(a);
          const bRank = getRank(b);
          const diffA = targetRank - aRank;
          const diffB = targetRank - bRank;

          if (diffA !== diffB) {
            return diffA - diffB; // Prefer closest higher level
          }

          const hireTimeA = a.hireDate ? new Date(a.hireDate).getTime() : Number.MAX_SAFE_INTEGER;
          const hireTimeB = b.hireDate ? new Date(b.hireDate).getTime() : Number.MAX_SAFE_INTEGER;

          if (hireTimeA !== hireTimeB) {
            return hireTimeA - hireTimeB;
          }

          const createdA = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
          const createdB = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
          return createdA - createdB;
        });

        return managers[0].id;
      }
    }

    const ceo = await employeeDao.findCEO(transaction);
    return ceo ? ceo.id : null;
  }
}

export default new AuthService();
