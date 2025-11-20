import { apiRequest } from '../utils/api.utils';
import type { Designation, Department } from '../types/designation.types';

export const designationService = {
  async getByDepartment(department: string): Promise<Designation[]> {
    const response = await apiRequest<{ team: string; designations: Designation[] }>(
      `/api/designations/${department}`,
      {
        method: 'GET',
      }
    );
    return response.designations;
  },

  async getAllTeams(): Promise<Department[]> {
    const departments = await apiRequest<Department[]>(
      '/api/designations/teams',
      {
        method: 'GET',
      }
    );
    return departments;
  },

  async getAllDesignationsGrouped(): Promise<Record<string, Designation[]>> {
    const designations = await apiRequest<Record<string, Designation[]>>(
      '/api/designations',
      {
        method: 'GET',
      }
    );
    return designations;
  },
};
