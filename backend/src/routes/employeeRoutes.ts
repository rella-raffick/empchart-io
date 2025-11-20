import { FastifyInstance } from "fastify";
import employeeController from "../controllers/employeeController";
import { authMiddleware } from "../middleware/auth";

/**
 * Employee Routes
 * Base URL: /api/employees
 * All routes require authentication via JWT token
 */
export default async function employeeRoutes(fastify: FastifyInstance) {
  fastify.get("/hierarchy", {
    preHandler: authMiddleware,
    handler: employeeController.getHierarchy.bind(employeeController),
  });

  fastify.get("/search", {
    preHandler: authMiddleware,
    handler: employeeController.searchEmployees.bind(employeeController),
  });

  fastify.get("/filter/department", {
    preHandler: authMiddleware,
    handler: employeeController.getByDepartment.bind(employeeController),
  });

  fastify.get("/filter/level", {
    preHandler: authMiddleware,
    handler: employeeController.getByLevel.bind(employeeController),
  });

  fastify.get("/stats/overview", {
    preHandler: authMiddleware,
    handler: employeeController.getStats.bind(employeeController),
  });

  fastify.get("/", {
    preHandler: authMiddleware,
    handler: employeeController.getAllEmployees.bind(employeeController),
  });

  fastify.get("/:id/hierarchy", {
    preHandler: authMiddleware,
    handler: employeeController.getSubtree.bind(employeeController),
  });

  fastify.get("/:id/path", {
    preHandler: authMiddleware,
    handler: employeeController.getEmployeePath.bind(employeeController),
  });

  fastify.get("/:id/reports", {
    preHandler: authMiddleware,
    handler: employeeController.getDirectReports.bind(employeeController),
  });

  fastify.patch("/:id/manager", {
    preHandler: authMiddleware,
    handler: employeeController.updateManager.bind(employeeController),
  });

  fastify.get("/:id", {
    preHandler: authMiddleware,
    handler: employeeController.getEmployeeById.bind(employeeController),
  });

  fastify.patch("/:id", {
    preHandler: authMiddleware,
    handler: employeeController.updateEmployee.bind(employeeController),
  });

  fastify.delete("/:id", {
    preHandler: authMiddleware,
    handler: employeeController.deleteEmployee.bind(employeeController),
  });
}
