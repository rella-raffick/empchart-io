/**
 * RBAC Decorator for Controllers
 *
 * Purpose: Protect controller methods with role-based access control
 *
 * Usage:
 * import { ROLES } from '../constants/roles';
 *
 * class EmployeeController {
 *   @RequireRole([ROLES.ADMIN, ROLES.CEO])
 *   async deleteEmployee(request, reply) {
 *     // Only admin and ceo can access
 *   }
 *
 *   @RequireRole([ROLES.ADMIN, ROLES.CEO, ROLES.L1, ROLES.L2])
 *   async updateManager(request, reply) {
 *     // Only these roles can access
 *   }
 * }
 *
 * Note: Requires authMiddleware to run first to attach user to request
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../models/User';

/**
 * Method decorator for role-based access control
 *
 * @param allowedRoles - Array of roles that can access this method
 * @returns Method decorator
 */
export function RequireRole(allowedRoles: UserRole[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      // Check if user is attached to request (by authMiddleware)
      const user = (request as any).user;

      if (!user) {
        return reply.code(401).send({
          success: false,
          error: { message: 'Authentication required' },
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return reply.code(403).send({
          success: false,
          error: {
            message: 'Forbidden: Insufficient permissions',
            requiredRoles: allowedRoles,
            userRole: user.role,
          },
        });
      }

      // Role authorized, call original method
      return originalMethod.apply(this, [request, reply]);
    };

    return descriptor;
  };
}

/**
 * Class decorator to apply role requirement to all methods
 *
 * Usage:
 * @RequireRoleForAll(['admin'])
 * class AdminController {
 *   // All methods require admin role
 * }
 */
export function RequireRoleForAll(allowedRoles: UserRole[]) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const prototype = constructor.prototype;
    const methodNames = Object.getOwnPropertyNames(prototype);

    methodNames.forEach((methodName) => {
      if (methodName === 'constructor') return;

      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
      if (descriptor && typeof descriptor.value === 'function') {
        const originalMethod = descriptor.value;

        descriptor.value = async function (
          request: FastifyRequest,
          reply: FastifyReply
        ) {
          const user = (request as any).user;

          if (!user) {
            return reply.code(401).send({
              success: false,
              error: { message: 'Authentication required' },
            });
          }

          if (!allowedRoles.includes(user.role)) {
            return reply.code(403).send({
              success: false,
              error: {
                message: 'Forbidden: Insufficient permissions',
                requiredRoles: allowedRoles,
                userRole: user.role,
              },
            });
          }

          return originalMethod.apply(this, [request, reply]);
        };

        Object.defineProperty(prototype, methodName, descriptor);
      }
    });

    return constructor;
  };
}

/**
 * Combined Auth + Role decorator
 * Checks authentication AND role in one decorator
 *
 * Usage:
 * @RequireAuth(['admin', 'ceo'])
 * async deleteEmployee(request, reply) { }
 */
export function RequireAuth(allowedRoles: UserRole[]) {
  return RequireRole(allowedRoles);
}
