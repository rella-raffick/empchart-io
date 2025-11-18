import { FastifyRequest, FastifyReply } from "fastify";
import employeeService from "../services/employeeService";

class EmployeeController {
  /**
   * Get all employees
   */
  async getAllEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const employees = await employeeService.getAllEmployees();
      return reply.send({
        success: true,
        data: employees,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const employeeId = parseInt(request.params.id);
      const employee = await employeeService.getEmployeeById(employeeId);

      if (!employee) {
        return reply.status(404).send({
          success: false,
          error: "Employee not found",
        });
      }

      return reply.send({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get organization hierarchy (full tree from CEO)
   */
  async getHierarchy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const hierarchy = await employeeService.getOrganizationHierarchy();

      if (!hierarchy) {
        return reply.status(404).send({
          success: false,
          error: "No organization hierarchy found (no CEO)",
        });
      }

      return reply.send({
        success: true,
        data: hierarchy,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get subtree hierarchy for a specific employee
   */
  async getSubtree(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const employeeId = parseInt(request.params.id);
      const subtree = await employeeService.getSubtreeHierarchy(employeeId);

      return reply.send({
        success: true,
        data: subtree,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get employee path (breadcrumb from employee to CEO)
   */
  async getEmployeePath(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const employeeId = parseInt(request.params.id);
      const path = await employeeService.getEmployeePath(employeeId);

      return reply.send({
        success: true,
        data: path,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update an employee
   */
  async updateEmployee(
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        name?: string;
        designationId?: number;
        managerId?: number | null;
        phone?: string;
        hireDate?: string;
        profileImage?: string;
        status?: "active" | "inactive";
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const employeeId = parseInt(request.params.id);
      const employee = await employeeService.updateEmployee(employeeId, {
        ...request.body,
        hireDate: request.body.hireDate
          ? new Date(request.body.hireDate)
          : undefined,
      });

      return reply.send({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update employee's manager (for drag & drop)
   */
  async updateManager(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { managerId: number | null };
    }>,
    reply: FastifyReply
  ) {
    try {
      const employeeId = parseInt(request.params.id);
      const { managerId } = request.body;

      const employee = await employeeService.updateManager(
        employeeId,
        managerId
      );

      return reply.send({
        success: true,
        data: employee,
        message: "Manager updated successfully",
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const employeeId = parseInt(request.params.id);
      await employeeService.deleteEmployee(employeeId);

      return reply.send({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get employees by department
   */
  async getByDepartment(
    request: FastifyRequest<{ Querystring: { department: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { department } = request.query;
      const employees = await employeeService.getEmployeesByDepartment(
        department
      );

      return reply.send({
        success: true,
        data: employees,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get employees by level
   */
  async getByLevel(
    request: FastifyRequest<{ Querystring: { level: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { level } = request.query;
      const employees = await employeeService.getEmployeesByLevel(level);

      return reply.send({
        success: true,
        data: employees,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Search employees
   */
  async searchEmployees(
    request: FastifyRequest<{ Querystring: { search: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { search } = request.query;
      const employees = await employeeService.searchEmployees(search);

      return reply.send({
        success: true,
        data: employees,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get direct reports
   */
  async getDirectReports(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const employeeId = parseInt(request.params.id);
      const reports = await employeeService.getDirectReports(employeeId);

      return reply.send({
        success: true,
        data: reports,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get employee statistics
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await employeeService.getEmployeeStats();

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new EmployeeController();
