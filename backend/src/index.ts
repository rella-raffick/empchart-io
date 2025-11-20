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
    await fastify.register(cors, {
      origin: true,
    });

    await fastify.register(rateLimit, {
      max: 20,
      timeWindow: '1 minute',
      cache: 10000,
      skipOnError: false,
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

    await sequelize.authenticate();
    fastify.log.info('Database connection established successfully');

    if (process.env.NODE_ENV === 'development') {
      fastify.log.info('Database models loaded (use npm run db:seed for schema changes)');
    }

    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(designationRoutes, { prefix: '/api/designations' });
    await fastify.register(employeeRoutes, { prefix: '/api/employees' });

    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server is running on http://${HOST}:${PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();
