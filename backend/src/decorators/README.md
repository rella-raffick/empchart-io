# Decorators

## RBAC Decorators for Controllers

### Installation

Enable decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### @RequireRole - Method Decorator

Protect individual controller methods with role-based access control.

**Example:**

```typescript
import { RequireRole } from '../decorators/requireRole';
import { ROLES } from '../constants/roles';

class EmployeeController {
  // Only admin and ceo can delete
  @RequireRole([ROLES.ADMIN, ROLES.CEO])
  async deleteEmployee(request: FastifyRequest, reply: FastifyReply) {
    // Implementation
  }

  // Only these roles can update manager
  @RequireRole([ROLES.ADMIN, ROLES.CEO, ROLES.L1, ROLES.L2])
  async updateManager(request: FastifyRequest, reply: FastifyReply) {
    // Implementation
  }

  // No decorator = no role check (but still needs auth if authMiddleware is used)
  async getAllEmployees(request: FastifyRequest, reply: FastifyReply) {
    // Implementation
  }
}
```

### @RequireRoleForAll - Class Decorator

Apply role requirement to ALL methods in a class.

**Example:**

```typescript
import { RequireRoleForAll } from '../decorators/requireRole';
import { ROLES } from '../constants/roles';

// All methods in this controller require admin role
@RequireRoleForAll([ROLES.ADMIN])
class AdminController {
  async deleteUser(request, reply) { }
  async updateSettings(request, reply) { }
  async viewLogs(request, reply) { }
  // All require admin role
}
```

### @RequireAuth - Alias

Shorthand for `@RequireRole`.

**Example:**

```typescript
import { RequireAuth } from '../decorators/requireRole';
import { ROLES } from '../constants/roles';

class EmployeeController {
  @RequireAuth([ROLES.ADMIN, ROLES.CEO])
  async deleteEmployee(request, reply) { }
}
```

## Important Notes

### 1. Authentication Middleware Required

Decorators expect `user` object on request. You must use `authMiddleware` first:

```typescript
// In routes
fastify.register(async (fastify) => {
  // Apply auth middleware to all routes in this context
  fastify.addHook('preHandler', authMiddleware);

  // Now decorators will work
  fastify.delete('/employees/:id', employeeController.deleteEmployee.bind(employeeController));
});
```

### 2. Binding Context

Always bind controller methods when registering routes:

```typescript
// Correct
fastify.delete('/employees/:id', controller.deleteEmployee.bind(controller));

// Wrong - loses 'this' context
fastify.delete('/employees/:id', controller.deleteEmployee);
```

### 3. Response Format

**401 Unauthorized** (no user in request):
```json
{
  "success": false,
  "error": { "message": "Authentication required" }
}
```

**403 Forbidden** (wrong role):
```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Insufficient permissions",
    "requiredRoles": ["admin", "ceo"],
    "userRole": "L3"
  }
}
```

### 4. Multiple Decorators

You can combine multiple decorators:

```typescript
@RequireRole(['admin'])
@ValidateSchema(someSchema)  // If you create a validation decorator
async deleteEmployee(request, reply) { }
```

## Complete Example

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { RequireRole } from '../decorators/requireRole';
import { ROLES } from '../constants/roles';
import employeeService from '../services/employeeService';

class EmployeeController {
  // Public - all authenticated users
  async getAllEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const employees = await employeeService.getAllEmployees();
      return reply.code(200).send({ success: true, data: employees });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: { message: error.message } });
    }
  }

  // Only these roles can update managers
  @RequireRole([ROLES.ADMIN, ROLES.CEO, ROLES.L1, ROLES.L2])
  async updateManager(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = parseInt((request.params as any).id);
      const { managerId } = request.body as any;
      const employee = await employeeService.updateManager(id, managerId);
      return reply.code(200).send({ success: true, data: employee });
    } catch (error: any) {
      return reply.code(400).send({ success: false, error: { message: error.message } });
    }
  }

  // Only admin and ceo can delete
  @RequireRole([ROLES.ADMIN, ROLES.CEO])
  async deleteEmployee(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = parseInt((request.params as any).id);
      await employeeService.deleteEmployee(id);
      return reply.code(200).send({ success: true, message: 'Employee deleted' });
    } catch (error: any) {
      return reply.code(400).send({ success: false, error: { message: error.message } });
    }
  }
}

export default new EmployeeController();
```

## Route Registration with Auth

```typescript
import { FastifyInstance } from 'fastify';
import employeeController from '../controllers/employeeController';
import authMiddleware from '../middleware/auth';

async function employeeRoutes(fastify: FastifyInstance) {
  // Apply auth middleware to all routes
  fastify.addHook('preHandler', authMiddleware);

  // Routes - decorators handle role checking
  fastify.get('/employees', employeeController.getAllEmployees.bind(employeeController));
  fastify.patch('/employees/:id/manager', employeeController.updateManager.bind(employeeController));
  fastify.delete('/employees/:id', employeeController.deleteEmployee.bind(employeeController));
}

export default employeeRoutes;
```
