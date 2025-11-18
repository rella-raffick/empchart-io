/**
 * Role-Based Access Control Middleware
 *
 * Purpose: Restrict routes based on user roles
 *
 * Roles: admin, ceo, L1, L2, L3, L4, L5
 *
 * Usage:
 * fastify.patch('/employees/:id', {
 *   preHandler: [authMiddleware, requireRole(['admin', 'ceo', 'L1'])]
 * }, handler)
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../models/User';

/**
 * Factory function to create RBAC middleware
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Fastify middleware handler
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: {
          message: 'Insufficient permissions. You do not have access to this resource.',
        },
      });
    }

    // User is authorized, continue to the route handler
  };
}

/**
 * Middleware to allow only admin users
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to allow admin and CEO users
 */
export const requireAdminOrCEO = requireRole(['admin', 'ceo']);

/**
 * Middleware to allow admin and high-level users (L1-L2)
 */
export const requireManagement = requireRole(['admin', 'ceo', 'L1', 'L2']);

export default requireRole;
