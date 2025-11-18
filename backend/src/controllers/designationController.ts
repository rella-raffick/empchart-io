/**
 * Designation Controller
 *
 * Purpose: Provide designation data for dropdowns
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { Department } from '../types/enums';
import { DESIGNATIONS, getDesignationsByDepartment } from '../constants/designations';

export class DesignationController {
  /**
   * Get all designations for a specific team/department
   * GET /api/designations/:team
   */
  async getDesignationsByTeam(
    request: FastifyRequest<{ Params: { team: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { team } = request.params;

      // Validate team
      const validTeams: Department[] = ['EXECUTIVE', 'TECHNOLOGY', 'FINANCE', 'BUSINESS'];
      if (!validTeams.includes(team as Department)) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Invalid team. Must be one of: EXECUTIVE, TECHNOLOGY, FINANCE, BUSINESS' },
        });
      }

      const designations = getDesignationsByDepartment(team as Department);

      return reply.status(200).send({
        success: true,
        data: {
          team,
          designations,
        },
      });
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
      const teams = [
        { value: 'EXECUTIVE', label: 'Executive' },
        { value: 'TECHNOLOGY', label: 'Technology' },
        { value: 'FINANCE', label: 'Finance' },
        { value: 'BUSINESS', label: 'Business' },
      ];

      return reply.status(200).send({
        success: true,
        data: teams,
      });
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
      const grouped = {
        EXECUTIVE: getDesignationsByDepartment('EXECUTIVE'),
        TECHNOLOGY: getDesignationsByDepartment('TECHNOLOGY'),
        FINANCE: getDesignationsByDepartment('FINANCE'),
        BUSINESS: getDesignationsByDepartment('BUSINESS'),
      };

      return reply.status(200).send({
        success: true,
        data: grouped,
      });
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
