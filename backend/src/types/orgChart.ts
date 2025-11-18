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

export interface EmployeePath {
  id: number;
  name: string;
  designation: string;
  level: string;
  department: string;
}
