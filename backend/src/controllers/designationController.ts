import { FastifyRequest, FastifyReply } from 'fastify';
import { Department } from '../types/enums';
import designationService from '../services/designationService';
import departmentService from '../services/departmentService';
import cacheManager from '../utils/cacheManager';

const CACHE_NAME = "designations";
const CACHE_TTL = 86400;
cacheManager.getCache(CACHE_NAME, CACHE_TTL);

function sendWithCache(
  reply: FastifyReply,
  data: any,
  cacheHit: boolean
) {
  return reply
    .header('X-Cache', cacheHit ? 'HIT' : 'MISS')
    .send({
      success: true,
      data,
    });
}

export class DesignationController {
  async getDesignationsByTeam(
    request: FastifyRequest<{ Params: { team: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { team } = request.params;

      const validTeams: Department[] = ['EXECUTIVE', 'TECHNOLOGY', 'FINANCE', 'BUSINESS'];
      if (!validTeams.includes(team as Department)) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Invalid team. Must be one of: EXECUTIVE, TECHNOLOGY, FINANCE, BUSINESS' },
        });
      }

      // Get designations from cache or database
      const result = await cacheManager.getOrSet(
        CACHE_NAME,
        `team_${team}`,
        async () => {
          const designations = await designationService.getDesignationsByDepartment(team as Department);
          return {
            team,
            designations,
          };
        }
      );

      return sendWithCache(reply, result.data, result.cacheHit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch designations';
      return reply.status(500).send({
        success: false,
        error: { message: errorMessage },
      });
    }
  }

  /**
   * Get all teams/departments
   * GET /api/designations/teams
   */
  async getAllTeams(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get departments from cache or database
      const result = await cacheManager.getOrSet(
        CACHE_NAME,
        "all_teams",
        () => departmentService.getAllDepartments()
      );

      return sendWithCache(reply, result.data, result.cacheHit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
      return reply.status(500).send({
        success: false,
        error: { message: errorMessage },
      });
    }
  }

  /**
   * Get all designations grouped by team
   * GET /api/designations
   */
  async getAllDesignations(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get designations from cache or database
      const result = await cacheManager.getOrSet(
        CACHE_NAME,
        "all_grouped",
        () => designationService.getDesignationsGroupedByDepartment()
      );

      return sendWithCache(reply, result.data, result.cacheHit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch designations';
      return reply.status(500).send({
        success: false,
        error: { message: errorMessage },
      });
    }
  }
}

export default new DesignationController();
