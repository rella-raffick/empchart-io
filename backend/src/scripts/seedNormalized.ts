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
    console.log("✓ Database connection established");

    console.log("\nSyncing database models...");
    await sequelize.sync({ force: true }); // WARNING: Drops all tables
    console.log("✓ Database synced");

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
      console.log(`✓ Department created: ${dept.name} (ID: ${created.id})`);
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
            `✓ Designation: ${title} (${deptCode}, ${level}) - ID: ${created.id}`
          );
        }
      }
    }
    console.log(`✓ Total designations created: ${designationCount}`);

    // ========== STEP 3: Seed Employees (from PDF org chart) ==========
    console.log("\n========== Seeding Employees ==========\n");

    // Helper function to get designation ID
    const getDesignationId = (dept: string, title: string): number => {
      const key = `${dept}:${title}`;
      const id = designationMap[key];
      if (!id) {
        throw new Error(`Designation not found: ${dept}:${title}`);
      }
      return id;
    };

    // Create employees based on PDF org chart
    const employeesData = [
      // L1 - CEO (top of hierarchy)
      {
        name: "Mark Hill",
        department: "EXECUTIVE" as DepartmentEnum,
        designation: "Chief Executive Officer",
        managerId: null,
        phone: "01 213 123 134",
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
        phone: "01 213 123 134",
      },

      // L2 - Technology Department (Reports to Joe Linux - CTO)
      {
        name: "Ron Blomquist",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Chief Information Security Officer",
        managerName: "Joe Linux",
        phone: "+1-555-0005",
      },
      {
        name: "Michael Rubin",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Chief Innovation Officer",
        managerName: "Joe Linux",
        phone: "+1-555-0006",
      },
      {
        name: "Sarah Connor",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Engineering Manager",
        managerName: "Joe Linux",
        phone: "+1-555-0007",
      },
      {
        name: "David Kim",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Engineering Manager",
        managerName: "Joe Linux",
        phone: "+1-555-0008",
      },

      // L2 - Business Department (Reports to Linda May - CBO)
      {
        name: "Alice Lopez",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Chief Communications Officer",
        managerName: "Linda May",
        phone: "+1-555-0009",
      },
      {
        name: "Mary Johnson",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Chief Brand Officer",
        managerName: "Linda May",
        phone: "+1-555-0010",
      },
      {
        name: "Kirk Douglas",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Chief Business Development Officer",
        managerName: "Linda May",
        phone: "+1-555-0011",
      },

      // L2 - Finance Department (Reports to John Green - CFO)
      {
        name: "Erica Reel",
        department: "FINANCE" as DepartmentEnum,
        designation: "Chief Customer Officer",
        managerName: "John Green",
        phone: "+1-555-0012",
      },
      {
        name: "Robert Chen",
        department: "FINANCE" as DepartmentEnum,
        designation: "Finance Manager",
        managerName: "John Green",
        phone: "+1-555-0013",
      },

      // L3 - Tech Leads (Reports to Sarah Connor - Eng Manager)
      {
        name: "Emily Rodriguez",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Lead Engineer",
        managerName: "Sarah Connor",
        phone: "+1-555-0014",
      },
      {
        name: "James Wilson",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Lead Engineer",
        managerName: "Sarah Connor",
        phone: "+1-555-0015",
      },

      // L3 - Tech Leads (Reports to David Kim - Eng Manager)
      {
        name: "Maria Garcia",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Lead Engineer",
        managerName: "David Kim",
        phone: "+1-555-0016",
      },
      {
        name: "Thomas Anderson",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Lead Engineer",
        managerName: "David Kim",
        phone: "+1-555-0017",
      },

      // L3 - Business Leads
      {
        name: "Jennifer Lee",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Team Lead",
        managerName: "Kirk Douglas",
        phone: "+1-555-0018",
      },

      // L3 - Finance Leads
      {
        name: "Daniel Park",
        department: "FINANCE" as DepartmentEnum,
        designation: "Finance Team Lead",
        managerName: "Robert Chen",
        phone: "+1-555-0019",
      },

      // L4 - Senior Engineers (Reports to Emily Rodriguez - Lead)
      {
        name: "Christopher Brown",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior Software Engineer",
        managerName: "Emily Rodriguez",
        phone: "+1-555-0020",
      },
      {
        name: "Jessica Taylor",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior Software Engineer",
        managerName: "Emily Rodriguez",
        phone: "+1-555-0021",
      },
      {
        name: "Matthew Davis",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior Software Engineer",
        managerName: "Emily Rodriguez",
        phone: "+1-555-0022",
      },

      // L4 - Senior Engineers (Reports to James Wilson - Lead)
      {
        name: "Ashley Martinez",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior Software Engineer",
        managerName: "James Wilson",
        phone: "+1-555-0023",
      },
      {
        name: "Andrew Johnson",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior Software Engineer",
        managerName: "James Wilson",
        phone: "+1-555-0024",
      },

      // L4 - Senior Engineers (Reports to Maria Garcia - Lead)
      {
        name: "Sophia White",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior Software Engineer",
        managerName: "Maria Garcia",
        phone: "+1-555-0025",
      },
      {
        name: "Joshua Harris",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior DevOps Engineer",
        managerName: "Maria Garcia",
        phone: "+1-555-0026",
      },

      // L4 - Senior Engineers (Reports to Thomas Anderson - Lead DevOps)
      {
        name: "Amanda Clark",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior DevOps Engineer",
        managerName: "Thomas Anderson",
        phone: "+1-555-0027",
      },
      {
        name: "Brandon Lewis",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Senior DevOps Engineer",
        managerName: "Thomas Anderson",
        phone: "+1-555-0028",
      },

      // L4 - Senior Business Staff
      {
        name: "Rachel Walker",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Senior Business Analyst",
        managerName: "Jennifer Lee",
        phone: "+1-555-0029",
      },
      {
        name: "Kevin Young",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Senior Business Analyst",
        managerName: "Jennifer Lee",
        phone: "+1-555-0030",
      },

      // L4 - Senior Finance Staff
      {
        name: "Michelle King",
        department: "FINANCE" as DepartmentEnum,
        designation: "Senior Financial Analyst",
        managerName: "Daniel Park",
        phone: "+1-555-0031",
      },
      {
        name: "Ryan Scott",
        department: "FINANCE" as DepartmentEnum,
        designation: "Senior Financial Analyst",
        managerName: "Daniel Park",
        phone: "+1-555-0032",
      },

      // L5 - Junior Engineers (Reports to Christopher Brown - Senior)
      {
        name: "Olivia Green",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Christopher Brown",
        phone: "+1-555-0033",
      },
      {
        name: "Ethan Adams",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Christopher Brown",
        phone: "+1-555-0034",
      },

      // L5 - Junior Engineers (Reports to Jessica Taylor - Senior)
      {
        name: "Isabella Baker",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Jessica Taylor",
        phone: "+1-555-0035",
      },
      {
        name: "William Nelson",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Jessica Taylor",
        phone: "+1-555-0036",
      },

      // L5 - Junior Engineers (Reports to Matthew Davis - Senior)
      {
        name: "Mia Carter",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Matthew Davis",
        phone: "+1-555-0037",
      },
      {
        name: "Alexander Mitchell",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Matthew Davis",
        phone: "+1-555-0038",
      },

      // L5 - Junior Engineers (Reports to Ashley Martinez - Senior)
      {
        name: "Charlotte Perez",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Ashley Martinez",
        phone: "+1-555-0039",
      },
      {
        name: "Daniel Roberts",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Ashley Martinez",
        phone: "+1-555-0040",
      },

      // L5 - Junior Engineers (Reports to Andrew Johnson - Senior)
      {
        name: "Ava Turner",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Andrew Johnson",
        phone: "+1-555-0041",
      },
      {
        name: "Jacob Phillips",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "Software Engineer",
        managerName: "Andrew Johnson",
        phone: "+1-555-0042",
      },

      // L5 - Junior DevOps (Reports to Amanda Clark - Senior DevOps)
      {
        name: "Emma Campbell",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "DevOps Engineer",
        managerName: "Amanda Clark",
        phone: "+1-555-0043",
      },
      {
        name: "Michael Parker",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "DevOps Engineer",
        managerName: "Amanda Clark",
        phone: "+1-555-0044",
      },

      // L5 - Junior DevOps (Reports to Brandon Lewis - Senior DevOps)
      {
        name: "Abigail Evans",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "DevOps Engineer",
        managerName: "Brandon Lewis",
        phone: "+1-555-0045",
      },
      {
        name: "Noah Edwards",
        department: "TECHNOLOGY" as DepartmentEnum,
        designation: "DevOps Engineer",
        managerName: "Brandon Lewis",
        phone: "+1-555-0046",
      },

      // L5 - Junior Business Staff (Reports to Rachel Walker - Senior BA)
      {
        name: "Harper Collins",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Analyst",
        managerName: "Rachel Walker",
        phone: "+1-555-0047",
      },
      {
        name: "Logan Stewart",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Analyst",
        managerName: "Rachel Walker",
        phone: "+1-555-0048",
      },

      // L5 - Junior Business Staff (Reports to Kevin Young - Senior BA)
      {
        name: "Aria Morris",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Analyst",
        managerName: "Kevin Young",
        phone: "+1-555-0049",
      },
      {
        name: "Lucas Rogers",
        department: "BUSINESS" as DepartmentEnum,
        designation: "Business Analyst",
        managerName: "Kevin Young",
        phone: "+1-555-0050",
      },

      // L5 - Junior Finance Staff (Reports to Michelle King - Senior FA)
      {
        name: "Grace Reed",
        department: "FINANCE" as DepartmentEnum,
        designation: "Financial Analyst",
        managerName: "Michelle King",
        phone: "+1-555-0051",
      },
      {
        name: "Mason Cook",
        department: "FINANCE" as DepartmentEnum,
        designation: "Financial Analyst",
        managerName: "Michelle King",
        phone: "+1-555-0052",
      },

      // L5 - Junior Finance Staff (Reports to Ryan Scott - Senior FA)
      {
        name: "Chloe Morgan",
        department: "FINANCE" as DepartmentEnum,
        designation: "Financial Analyst",
        managerName: "Ryan Scott",
        phone: "+1-555-0053",
      },
      {
        name: "Elijah Bell",
        department: "FINANCE" as DepartmentEnum,
        designation: "Financial Analyst",
        managerName: "Ryan Scott",
        phone: "+1-555-0054",
      },
    ];

    const employeeMap: { [name: string]: number } = {};

    // First pass: Create all employees without manager assignments
    for (const empData of employeesData) {
      const designationId = getDesignationId(
        empData.department,
        empData.designation
      );

      const employee = await Employee.create({
        name: empData.name,
        designationId,
        managerId: null, // Will update in second pass
        phone: empData.phone,
        status: "active",
      });

      employeeMap[empData.name] = employee.id;
      console.log(
        `✓ Employee created: ${empData.name} (${empData.designation}) - ID: ${employee.id}`
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

        console.log(`✓ ${empData.name} → reports to → ${empData.managerName}`);
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
    console.log("✓ User: admin@empchartio.com (admin) - No employee link");

    // Create users for employees across all levels
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

      // L2 - Management Level (Technology)
      {
        name: "Ron Blomquist",
        email: "ron.blomquist@empchartio.com",
        role: "L2" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Michael Rubin",
        email: "michael.rubin@empchartio.com",
        role: "L2" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Sarah Connor",
        email: "sarah.connor@empchartio.com",
        role: "L2" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "David Kim",
        email: "david.kim@empchartio.com",
        role: "L2" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },

      // L2 - Management Level (Business)
      {
        name: "Alice Lopez",
        email: "alice.lopez@empchartio.com",
        role: "L2" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Mary Johnson",
        email: "mary.johnson@empchartio.com",
        role: "L2" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Kirk Douglas",
        email: "kirk.douglas@empchartio.com",
        role: "L2" as const,
        department: "BUSINESS" as DepartmentEnum,
      },

      // L2 - Management Level (Finance)
      {
        name: "Erica Reel",
        email: "erica.reel@empchartio.com",
        role: "L2" as const,
        department: "FINANCE" as DepartmentEnum,
      },
      {
        name: "Robert Chen",
        email: "robert.chen@empchartio.com",
        role: "L2" as const,
        department: "FINANCE" as DepartmentEnum,
      },

      // L3 - Lead Level (Technology)
      {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@empchartio.com",
        role: "L3" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "James Wilson",
        email: "james.wilson@empchartio.com",
        role: "L3" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@empchartio.com",
        role: "L3" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Thomas Anderson",
        email: "thomas.anderson@empchartio.com",
        role: "L3" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },

      // L3 - Lead Level (Business & Finance)
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

      // L4 - Senior Level (Technology)
      {
        name: "Christopher Brown",
        email: "christopher.brown@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Jessica Taylor",
        email: "jessica.taylor@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Matthew Davis",
        email: "matthew.davis@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Ashley Martinez",
        email: "ashley.martinez@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Andrew Johnson",
        email: "andrew.johnson@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Sophia White",
        email: "sophia.white@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Joshua Harris",
        email: "joshua.harris@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Amanda Clark",
        email: "amanda.clark@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Brandon Lewis",
        email: "brandon.lewis@empchartio.com",
        role: "L4" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },

      // L4 - Senior Level (Business & Finance)
      {
        name: "Rachel Walker",
        email: "rachel.walker@empchartio.com",
        role: "L4" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Kevin Young",
        email: "kevin.young@empchartio.com",
        role: "L4" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Michelle King",
        email: "michelle.king@empchartio.com",
        role: "L4" as const,
        department: "FINANCE" as DepartmentEnum,
      },
      {
        name: "Ryan Scott",
        email: "ryan.scott@empchartio.com",
        role: "L4" as const,
        department: "FINANCE" as DepartmentEnum,
      },

      // L5 - Junior Level (Technology - Software Engineers)
      {
        name: "Olivia Green",
        email: "olivia.green@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Ethan Adams",
        email: "ethan.adams@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Isabella Baker",
        email: "isabella.baker@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "William Nelson",
        email: "william.nelson@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Mia Carter",
        email: "mia.carter@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Alexander Mitchell",
        email: "alexander.mitchell@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Charlotte Perez",
        email: "charlotte.perez@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Daniel Roberts",
        email: "daniel.roberts@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Ava Turner",
        email: "ava.turner@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Jacob Phillips",
        email: "jacob.phillips@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },

      // L5 - Junior Level (Technology - DevOps Engineers)
      {
        name: "Emma Campbell",
        email: "emma.campbell@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Michael Parker",
        email: "michael.parker@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Abigail Evans",
        email: "abigail.evans@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },
      {
        name: "Noah Edwards",
        email: "noah.edwards@empchartio.com",
        role: "L5" as const,
        department: "TECHNOLOGY" as DepartmentEnum,
      },

      // L5 - Junior Level (Business Analysts)
      {
        name: "Harper Collins",
        email: "harper.collins@empchartio.com",
        role: "L5" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Logan Stewart",
        email: "logan.stewart@empchartio.com",
        role: "L5" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Aria Morris",
        email: "aria.morris@empchartio.com",
        role: "L5" as const,
        department: "BUSINESS" as DepartmentEnum,
      },
      {
        name: "Lucas Rogers",
        email: "lucas.rogers@empchartio.com",
        role: "L5" as const,
        department: "BUSINESS" as DepartmentEnum,
      },

      // L5 - Junior Level (Financial Analysts)
      {
        name: "Grace Reed",
        email: "grace.reed@empchartio.com",
        role: "L5" as const,
        department: "FINANCE" as DepartmentEnum,
      },
      {
        name: "Mason Cook",
        email: "mason.cook@empchartio.com",
        role: "L5" as const,
        department: "FINANCE" as DepartmentEnum,
      },
      {
        name: "Chloe Morgan",
        email: "chloe.morgan@empchartio.com",
        role: "L5" as const,
        department: "FINANCE" as DepartmentEnum,
      },
      {
        name: "Elijah Bell",
        email: "elijah.bell@empchartio.com",
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
        `✓ User: ${userData.email} (${userData.role}) → Employee: ${userData.name} (ID: ${employeeId})`
      );
    }

    // ========== Summary ==========
    console.log("\n========================================");
    console.log("✓ Database seeded successfully!");
    console.log("========================================");
    console.log("Summary:");
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Designations: ${designationCount}`);
    console.log(`- Employees: ${employeesData.length}`);
    console.log(`- Users: ${userEmployeeMapping.length + 1} (including admin)`);
    console.log("- Common Password: EmpChartIO@123");
    console.log("========================================");
    console.log("\nKey Features:");
    console.log("✓ Normalized schema (3NF)");
    console.log("✓ Departments & Designations as reference tables");
    console.log("✓ No redundant data (level derived from designation)");
    console.log("✓ Users linked to Employees via FK");
    console.log("✓ Proper referential integrity enforced");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
