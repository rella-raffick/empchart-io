/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, JwtPayload } from '../utils/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
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
    const decoded = verifyToken(token);
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
}

export default authMiddleware;
