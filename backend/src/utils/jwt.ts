/**
 * JWT Utilities
 *
 * Generate and verify JWT tokens
 */

import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

/**
 * Generate JWT token
 */
export function generateToken(userId: number, email: string, role: UserRole): string {
  const payload: JwtPayload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
