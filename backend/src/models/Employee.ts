import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import Designation from "./Designation";

export interface EmployeeAttributes {
  id: number;
  name: string;
  designationId: number;
  managerId: number | null;
  phone?: string;
  hireDate?: Date;
  profileImage?: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeCreationAttributes
  extends Optional<
    EmployeeAttributes,
    | "id"
    | "managerId"
    | "phone"
    | "hireDate"
    | "profileImage"
    | "status"
    | "createdAt"
    | "updatedAt"
  > {}

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  declare id: number;
  declare name: string;
  declare designationId: number;
  declare managerId: number | null;
  declare phone?: string;
  declare hireDate?: Date;
  declare profileImage?: string;
  declare status: "active" | "inactive";

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations
  declare designation?: Designation;
  declare manager?: Employee;
  declare directReports?: Employee[];
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    designationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "designation_id",
      references: {
        model: "designations",
        key: "id",
      },
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "manager_id",
      references: {
        model: "employees",
        key: "id",
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "hire_date",
      defaultValue: DataTypes.NOW,
    },
    profileImage: {
      type: DataTypes.TEXT, // Changed from STRING(255) to TEXT for base64 images
      allowNull: true,
      field: "profile_image",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    sequelize,
    tableName: "employees",
    underscored: true,
    timestamps: true,
  }
);

export default Employee;
