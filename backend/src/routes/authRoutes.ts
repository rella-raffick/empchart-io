import { FastifyInstance } from 'fastify';
import authController from '../controllers/authController';
import authMiddleware from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute',
      },
    },
    handler: authController.register.bind(authController),
  });

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
    handler: authController.login.bind(authController),
  });

  fastify.get('/me', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
    preHandler: authMiddleware,
    handler: authController.getCurrentUser.bind(authController),
  });
}

export default authRoutes;
