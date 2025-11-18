/**
 * Auth Routes - Endpoint Mapping
 *
 * Purpose: Map authentication HTTP endpoints to controller methods
 *
 * Responsibilities:
 * - Define auth API endpoints
 * - Attach schemas for validation
 * - Route to appropriate controller methods
 */

import { FastifyInstance } from 'fastify';
import authController from '../controllers/authController';
import authMiddleware from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  // Register a new user
  // POST /api/auth/register
  // Stricter rate limit: 3 registration attempts per 1 minute (for testing)
  fastify.post('/register', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute',
      },
    },
    handler: authController.register.bind(authController),
  });

  // Login user
  // POST /api/auth/login
  // Stricter rate limit: 5 login attempts per 1 minute (for testing - prevent brute force)
  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
    handler: authController.login.bind(authController),
  });

  // Get current authenticated user
  // GET /api/auth/me
  // Requires JWT token
  fastify.get('/me', {
    preHandler: authMiddleware,
    handler: authController.getCurrentUser.bind(authController),
  });
}

export default authRoutes;
