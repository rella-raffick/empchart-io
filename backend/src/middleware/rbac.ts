/**
 * Role-Based Access Control Middleware
 * Restricts routes based on user roles
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../models/User';

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: {
          message: 'Insufficient permissions. You do not have access to this resource.',
        },
      });
    }
  };
}

export const requireAdmin = requireRole(['admin']);
export const requireAdminOrCEO = requireRole(['admin', 'ceo']);
export const requireManagement = requireRole(['admin', 'ceo', 'L1', 'L2']);

export default requireRole;
