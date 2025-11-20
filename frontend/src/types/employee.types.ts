// Base employee interface (from GET /api/employees)
export interface Employee {
  id: number;
  name: string;
  designationId: number;
  managerId: number | null;
  phone?: string;
  hireDate?: string;
  profileImage?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
  // Populated relations
  designation?: {
    id: number;
    title: string;
    level: string;
    department: {
      id: number;
      code: string;
      name: string;
    };
  };
  manager?: {
    id: number;
    name: string;
  };
}

export interface OrgChartNode {
  id: number;
  name: string;
  title: string;
  level: string;
  department: string;
  departmentName: string;
  phone?: string;
  profileImage?: string;
  status: "active" | "inactive";
  managerId: number | null;
  managerName?: string;
  directReportCount: number;
  children: OrgChartNode[];
}

export interface UpdateEmployeeManager {
  managerId: number | null;
}

export interface EmployeePath {
  id: number;
  name: string;
  designation: string;
  level: string;
  department: string;
  departmentName: string;
  profileImage?: string;
}
