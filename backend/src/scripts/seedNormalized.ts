/**
 * Seed Script for Normalized Database Schema
 *
 * Seeds in order:
 * 1. Departments
 * 2. Designations (based on constants/designations.ts)
 * 3. Employees (from PDF org chart)
 * 4. Users (linked to employees)
 */

import sequelize from "../config/database";
import "../models/associations"; // Import associations
import Department from "../models/Department";
import Designation from "../models/Designation";
import Employee from "../models/Employee";
import User from "../models/User";
import { hashPassword } from "../utils/password";
import { DESIGNATIONS } from "../constants/designations";
import { Department as DepartmentEnum } from "../types/enums";

async function seedDatabase() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Database connection established");

    // Sync database without force to create tables if they don't exist
    console.log("\nChecking database schema...");
    await sequelize.sync({ alter: false });
    console.log("Database schema checked");

    // Check if database already has data
    try {
      const employeeCount = await Employee.count();
      if (employeeCount > 0) {
        console.log(`\nWARNING: Database already contains ${employeeCount} employees.`);
        console.log("Skipping seed to prevent data loss.");
        console.log("To force re-seed, manually drop tables first.\n");
        process.exit(0);
      }
    } catch (error) {
      // Table might not exist, proceed with force sync
      console.log("No existing data found, proceeding with fresh seed...");
    }

    console.log("\nSyncing database models (force: true)...");
    await sequelize.sync({ force: true }); // WARNING: Drops all tables
    console.log("Database synced");

    // ========== STEP 1: Seed Departments ==========
    console.log("\n========== Seeding Departments ==========\n");

    const departments = [
      { code: "EXECUTIVE" as const, name: "Executive" },
      { code: "TECHNOLOGY" as const, name: "Technology" },
      { code: "FINANCE" as const, name: "Finance" },
      { code: "BUSINESS" as const, name: "Business" },
    ];

    const departmentMap: { [key: string]: number } = {};

    for (const dept of departments) {
      const created = await Department.create(dept);
      departmentMap[dept.code] = created.id;
      console.log(`Department created: ${dept.name} (ID: ${created.id})`);
    }

    // ========== STEP 2: Seed Designations ==========
    console.log("\n========== Seeding Designations ==========\n");

    const designationMap: { [key: string]: number } = {};
    let designationCount = 0;

    for (const [deptCode, designationsObj] of Object.entries(DESIGNATIONS)) {
      const departmentId = departmentMap[deptCode];

      for (const [title, level] of Object.entries(designationsObj)) {
        const created = await Designation.create({
          title,
          departmentId,
          level,
        });

        // Store with key "DEPARTMENT:TITLE" for lookup
        const key = `${deptCode}:${title}`;
        designationMap[key] = created.id;
        designationCount++;

        if (designationCount <= 10) {
          console.log(
            `Designation: ${title} (${deptCode}, ${level}) - ID: ${created.id}`
          );
        }
      }
    }
    console.log(`Total designations created: ${designationCount}`);

    console.log("\n========== Seeding Employees ==========\n");

    const getDesignationId = (dept: string, title: string): number => {
      const key = `${dept}:${title}`;
      const id = designationMap[key];
      if (!id) {
        throw new Error(`Designation not found: ${dept}:${title}`);
      }
      return id;
    };

    const employeesData = [
      {
        name: "Mark Hill",
        department: "EXECUTIVE" as DepartmentEnum,
        designation: "Chief Executive Officer",
        managerId: null,
        phone: "+1-555-0001",
      },

      // L1 - C-Suite Officers (report to CEO)
      {
        name: "Joe Linux",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Chief Technology Officer",
        managerName: "Mark Hill",
        phone: "+1-555-0002",
      },
      {
        name: "Linda May",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Chief Business Officer",
        managerName: "Mark Hill",
        phone: "+1-555-0003",
      },
      {
        name: "John Green",
        department: "FINANCE" as DepartmentEnum,
        designation: "Chief Financial Officer",
        managerName: "Mark Hill",
        phone: "+1-555-0004",
      },

      {
        name: "Sarah Connor",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Engineering Manager",
        managerName: "Joe Linux",
        phone: "+1-555-0005",
      },
      {
        name: "Raj Kiran",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Engineering Manager",
        managerName: "Joe Linux",
        phone: "+1-555-0017",
      },

      {
        name: "Kirk Douglas",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Development Manager",
        managerName: "Linda May",
        phone: "+1-555-0006",
      },

      {
        name: "Robert Chen",
        department: "FINANCE" as DepartmentEnum,
        designation: "Finance Manager",
        managerName: "John Green",
        phone: "+1-555-0007",
      },

      {
        name: "Emily Rodriguez",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Lead Engineer",
        managerName: "Sarah Connor",
        phone: "+1-555-0008",
      },
      {
        name: "Rella Raffick",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Lead Engineer",
        managerName: "Raj Kiran",
        phone: "+1-555-0018",
      },
      {
        name: "Avinash",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Lead Engineer",
        managerName: "Sarah Connor",
        phone: "+1-555-0019",
      },

      {
        name: "Jennifer Lee",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Team Lead",
        managerName: "Kirk Douglas",
        phone: "+1-555-0009",
      },

      {
        name: "Daniel Park",
        department: "FINANCE" as DepartmentEnum,
        designation: "Finance Team Lead",
        managerName: "Robert Chen",
        phone: "+1-555-0010",
      },

      {
        name: "Christopher Brown",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior Software Engineer",
        managerName: "Emily Rodriguez",
        phone: "+1-555-0011",
      },

      {
        name: "Rachel Walker",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Senior Business Analyst",
        managerName: "Jennifer Lee",
        phone: "+1-555-0012",
      },

      {
        name: "Michelle King",
        department: "FINANCE" as DepartmentEnum,
        designation: "Senior Financial Analyst",
        managerName: "Daniel Park",
        phone: "+1-555-0013",
      },

      {
        name: "Olivia Green",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Christopher Brown",
        phone: "+1-555-0014",
      },

      {
        name: "Harper Collins",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Analyst",
        managerName: "Rachel Walker",
        phone: "+1-555-0015",
      },

      {
        name: "Grace Reed",
        department: "FINANCE" as DepartmentEnum,
        designation: "Financial Analyst",
        managerName: "Michelle King",
        phone: "+1-555-0016",
      },
    ];

    const employeeMap: { [name: string]: number } = {};

    for (const empData of employeesData) {
      const designationId = getDesignationId(
        empData.department,
        empData.designation
      );

      // Generate DiceBear avatar URL using employee name as seed (with happy mood)
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(empData.name)}&mouth=smile`;

      const employee = await Employee.create({
        name: empData.name,
        designationId,
        managerId: null,
        phone: empData.phone,
        profileImage: avatarUrl,
        status: "active",
      });

      employeeMap[empData.name] = employee.id;
      console.log(
        `Employee created: ${empData.name} (${empData.designation}) - ID: ${employee.id}`
      );
    }

    // Second pass: Update manager relationships
    console.log("\n--- Setting up manager relationships ---\n");
    for (const empData of employeesData) {
      if (empData.managerName) {
        const employeeId = employeeMap[empData.name];
        const managerId = employeeMap[empData.managerName];

        if (!managerId) {
          throw new Error(`Manager not found: ${empData.managerName}`);
        }

        await Employee.update({ managerId }, { where: { id: employeeId } });

        console.log(`${empData.name} reports to ${empData.managerName}`);
      }
    }

    // ========== STEP 4: Seed Users ==========
    console.log("\n========== Seeding Users ==========\n");

    const COMMON_PASSWORD = "EmpChartIO@123";
    const passwordHash = await hashPassword(COMMON_PASSWORD);

    // System Admin (no employee link)
    await User.create({
      employeeId: null,
      email: "admin@empchartio.com",
      passwordHash,
      role: "admin",
      department: "EXECUTIVE",
      isActive: true,
    });
    console.log("User: admin@empchartio.com (admin) - No employee link");

    // Create users for key employees showing hierarchy
    const userEmployeeMapping = [
      // L1 - Executive Level
      {
        name: "Mark Hill",
        email: "mark.hill@empchartio.com",
        role: "ceo" as const,
        department: "EXECUTIVE" as DepartmentEnum,
      },
      {
        name: "Joe Linux",
        email: "joe.linux@empchartio.com",
        role: "L1" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Linda May",
        email: "linda.may@empchartio.com",
        role: "L1" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "John Green",
        email: "john.green@empchartio.com",
        role: "L1" as const,
        department: "FINANCE" as DepartmentEnum,
      },

      // L2 - Management Level
      {
        name: "Sarah Connor",
        email: "sarah.connor@empchartio.com",
        role: "L2" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Raj Kiran",
        email: "raj.kiran@empchartio.com",
        role: "L2" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Kirk Douglas",
        email: "kirk.douglas@empchartio.com",
        role: "L2" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Robert Chen",
        email: "robert.chen@empchartio.com",
        role: "L2" as const,
        department: "FINANCE" as DepartmentEnum,
      },

      // L3 - Lead Level
      {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@empchartio.com",
        role: "L3" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Rella Raffick",
        email: "rella.raffick@empchartio.com",
        role: "L3" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Avinash",
        email: "avinash@empchartio.com",
        role: "L3" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Jennifer Lee",
        email: "jennifer.lee@empchartio.com",
        role: "L3" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Daniel Park",
        email: "daniel.park@empchartio.com",
        role: "L3" as const,
        department: "FINANCE" as DepartmentEnum,
      },

      // L4 - Senior Level
      {
        name: "Christopher Brown",
        email: "christopher.brown@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Rachel Walker",
        email: "rachel.walker@empchartio.com",
        role: "L4" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Michelle King",
        email: "michelle.king@empchartio.com",
        role: "L4" as const,
        department: "FINANCE" as DepartmentEnum,
      },

      // L5 - Junior Level
      {
        name: "Olivia Green",
        email: "olivia.green@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Harper Collins",
        email: "harper.collins@empchartio.com",
        role: "L5" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Grace Reed",
        email: "grace.reed@empchartio.com",
        role: "L5" as const,
        department: "FINANCE" as DepartmentEnum,
      },
    ];

    for (const userData of userEmployeeMapping) {
      const employeeId = employeeMap[userData.name];

      if (!employeeId) {
        throw new Error(`Employee not found: ${userData.name}`);
      }

      await User.create({
        employeeId,
        email: userData.email,
        passwordHash,
        role: userData.role,
        department: userData.department,
        isActive: true,
      });

      console.log(
        `User: ${userData.email} (${userData.role}) - Employee: ${userData.name} (ID: ${employeeId})`
      );
    }

    // ========== Summary ==========
    console.log("\n========================================");
    console.log("Database seeded successfully!");
    console.log("========================================");
    console.log("Summary:");
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Designations: ${designationCount}`);
    console.log(`- Employees: ${employeesData.length}`);
    console.log(`- Users: ${userEmployeeMapping.length + 1} (including admin)`);
    console.log("- Common Password: EmpChartIO@123");
    console.log("========================================");
    console.log("\nKey Features:");
    console.log("- Normalized schema (3NF)");
    console.log("- Departments & Designations as reference tables");
    console.log("- No redundant data (level derived from designation)");
    console.log("- Users linked to Employees via FK");
    console.log("- Proper referential integrity enforced");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("ERROR seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
