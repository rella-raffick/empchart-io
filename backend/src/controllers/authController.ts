/**
 * Auth Controller Layer - HTTP Request/Response Handling
 *
 * Purpose: Handle authentication HTTP layer
 *
 * Responsibilities:
 * - Parse request (body)
 * - Validate request format (using schemas)
 * - Call auth service
 * - Format API responses
 * - Set HTTP status codes (200, 400, 401, 500)
 * - Error handling
 *
 * Does NOT:
 * - Contain business logic
 * - Access database directly
 * - Hash passwords or generate tokens
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../services/authService';
import { Department } from '../types/enums';
import { UserRole } from '../models/User';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  department: Department;
  designation: string; // Job title from dropdown
  phone: string;
  profileImage: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      const { name, email, password, department, designation, phone, profileImage } = request.body;

      // Validate required fields
      if (!name || !email || !password || !department || !designation || !phone || !profileImage) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Name, email, password, department, designation, phone, and profile image are required',
          },
        });
      }

      // Call service to register user
      const result = await authService.register({
        name,
        email,
        password,
        department,
        designation,
        phone,
        profileImage,
      });

      return reply.status(201).send({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';

      // Check for specific errors
      if (errorMessage.includes('Email already registered')) {
        return reply.status(409).send({
          success: false,
          error: { message: errorMessage },
        });
      }

      if (errorMessage.includes('Invalid email') || errorMessage.includes('Password must be')) {
        return reply.status(400).send({
          success: false,
          error: { message: errorMessage },
        });
      }

      return reply.status(500).send({
        success: false,
        error: { message: errorMessage },
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password } = request.body;

      // Validate required fields
      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Email and password are required' },
        });
      }

      // Call service to login user
      const result = await authService.login({ email, password });

      return reply.status(200).send({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      // Check for specific errors
      if (errorMessage.includes('Invalid email or password')) {
        return reply.status(401).send({
          success: false,
          error: { message: errorMessage },
        });
      }

      if (errorMessage.includes('Account is disabled')) {
        return reply.status(403).send({
          success: false,
          error: { message: errorMessage },
        });
      }

      return reply.status(500).send({
        success: false,
        error: { message: errorMessage },
      });
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      // User should be attached by authMiddleware
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          error: { message: 'Authentication required' },
        });
      }

      // Get user details
      const user = await authService.getCurrentUser(request.user.userId);

      return reply.status(200).send({
        success: true,
        data: user,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';

      if (errorMessage.includes('User not found')) {
        return reply.status(404).send({
          success: false,
          error: { message: errorMessage },
        });
      }

      return reply.status(500).send({
        success: false,
        error: { message: errorMessage },
      });
    }
  }
}

export default new AuthController();
