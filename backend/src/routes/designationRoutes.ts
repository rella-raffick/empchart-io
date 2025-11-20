/**
 * Designation Routes
 */

import { FastifyInstance } from 'fastify';
import designationController from '../controllers/designationController';

export async function designationRoutes(fastify: FastifyInstance) {
  fastify.get('/teams', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    handler: designationController.getAllTeams.bind(designationController),
  });

  fastify.get('/:team', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    handler: designationController.getDesignationsByTeam.bind(designationController),
  });

  fastify.get('/', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
    handler: designationController.getAllDesignations.bind(designationController),
  });
}

export default designationRoutes;
