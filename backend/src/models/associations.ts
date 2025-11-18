import Employee from "./Employee";
import Designation from "./Designation";
import Department from "./Department";
import User from "./User";

/**
 * Define all model associations
 * This file must be imported before any database operations
 */

// Department <-> Designation (One-to-Many)
Department.hasMany(Designation, {
  foreignKey: "departmentId",
  as: "designations",
  onDelete: "RESTRICT", // Prevent deletion if designations exist
});

Designation.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

// Designation <-> Employee (One-to-Many)
Designation.hasMany(Employee, {
  foreignKey: "designationId",
  as: "employees",
  onDelete: "RESTRICT", // Prevent deletion if employees exist
});

Employee.belongsTo(Designation, {
  foreignKey: "designationId",
  as: "designation",
});

// Employee <-> Employee (Self-referencing One-to-Many for Manager)
Employee.hasMany(Employee, {
  foreignKey: "managerId",
  as: "directReports",
  onDelete: "SET NULL", // Set to null if manager is deleted
});

Employee.belongsTo(Employee, {
  foreignKey: "managerId",
  as: "manager",
});

// Employee <-> User (One-to-One)
Employee.hasOne(User, {
  foreignKey: "employeeId",
  as: "user",
  onDelete: "CASCADE", // Delete user if employee is deleted
});

User.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

// Export for use in other files
export { Employee, Designation, Department, User };

console.log("✓ Model associations configured");
