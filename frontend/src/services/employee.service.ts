import { apiRequest } from '../utils/api.utils';
import type { Employee, OrgChartNode, UpdateEmployeeManager, EmployeePath } from '../types/employee.types';

export const employeeService = {
  async getAll(token: string): Promise<Employee[]> {
    return apiRequest<Employee[]>('/api/employees', {
      method: 'GET',
      token,
    });
  },

  async getHierarchy(token: string): Promise<OrgChartNode> {
    return apiRequest<OrgChartNode>('/api/employees/hierarchy', {
      method: 'GET',
      token,
    });
  },

  async updateManager(
    employeeId: number,
    data: UpdateEmployeeManager,
    token: string
  ): Promise<Employee> {
    const result = await apiRequest<Employee>(`/api/employees/${employeeId}/manager`, {
      method: 'PATCH',
      body: JSON.stringify({ managerId: data.managerId }),
      token,
    });
    
    return result;
  },

  async getById(employeeId: number, token: string): Promise<Employee> {
    return apiRequest<Employee>(`/api/employees/${employeeId}`, {
      method: 'GET',
      token,
    });
  },

  async getEmployeePath(employeeId: number, token: string): Promise<EmployeePath[]> {
    return apiRequest<EmployeePath[]>(`/api/employees/${employeeId}/path`, {
      method: 'GET',
      token,
    });
  },

  async getEmployeeSubtree(employeeId: number, token: string): Promise<OrgChartNode> {
    return apiRequest<OrgChartNode>(`/api/employees/${employeeId}/hierarchy`, {
      method: 'GET',
      token,
    });
  },

  async getEmployeesByDepartment(department: string, token: string): Promise<Employee[]> {
    return apiRequest<Employee[]>(`/api/employees/filter/department?department=${department}`, {
      method: 'GET',
      token,
    });
  },
};
