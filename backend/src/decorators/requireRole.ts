/**
 * RBAC Decorator for Controllers
 * Protects controller methods with role-based access control
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../models/User';

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

    return descriptor;
  };
}

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

export function RequireAuth(allowedRoles: UserRole[]) {
  return RequireRole(allowedRoles);
}
