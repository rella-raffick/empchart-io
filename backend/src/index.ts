import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import sequelize from './config/database';
import './models/associations'; // Import model associations BEFORE routes
import authRoutes from './routes/authRoutes';
import designationRoutes from './routes/designationRoutes';
import employeeRoutes from './routes/employeeRoutes';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true,
    });

    // Register Rate Limiter (Global - DDoS Protection)
    await fastify.register(rateLimit, {
      max: 20, // Maximum 20 requests (lowered for testing)
      timeWindow: '1 minute', // Per 1 minute (easier to test)
      cache: 10000, // Cache size
      // allowList: [], // No whitelist - apply to all IPs including localhost
      skipOnError: false, // Do not skip rate limiting on errors
      continueExceeding: true,
      enableDraftSpec: true,
      addHeadersOnExceeding: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true
      },
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true
      }
    });

    // Test database connection
    await sequelize.authenticate();
    fastify.log.info('Database connection established successfully');

    // Sync models (use force: false to prevent table drops in dev)
    // For schema changes, use the seed script with force: true
    if (process.env.NODE_ENV === 'development') {
      // Don't use alter: true - it doesn't work well with ENUMs
      // Use seed script (npm run db:seed) for fresh schema
      fastify.log.info('Database models loaded (use npm run db:seed for schema changes)');
    }

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register API routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(designationRoutes, { prefix: '/api/designations' });
    await fastify.register(employeeRoutes, { prefix: '/api/employees' });

    // Start server
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server is running on http://${HOST}:${PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();
