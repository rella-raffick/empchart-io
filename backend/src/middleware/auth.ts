/**
 * Authentication Middleware
 *
 * Purpose: Protect routes by verifying JWT tokens
 *
 * Usage:
 * - Attach to routes that require authentication
 * - Extract token from Authorization header (Bearer <token>)
 * - Verify token and attach user info to request
 *
 * Example:
 * fastify.get('/protected', { preHandler: authMiddleware }, handler)
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, JwtPayload } from '../utils/jwt';

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Authorization header missing' },
      });
    }

    // Check if token is in Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid authorization format. Use: Bearer <token>' },
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
}

export default authMiddleware;
