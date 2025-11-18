/**
 * Designation Routes
 *
 * Purpose: Provide designation data for registration dropdowns
 */

import { FastifyInstance } from 'fastify';
import designationController from '../controllers/designationController';

export async function designationRoutes(fastify: FastifyInstance) {
  // Get all teams (for team dropdown)
  // Rate limit: 10 requests per 1 minute
  fastify.get('/teams', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    handler: designationController.getAllTeams.bind(designationController),
  });

  // Get designations for a specific team (for designation dropdown)
  // Rate limit: 10 requests per 1 minute
  fastify.get('/:team', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    handler: designationController.getDesignationsByTeam.bind(designationController),
  });

  // Get all designations grouped by team
  // Rate limit: 5 requests per 1 minute (more expensive query)
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
