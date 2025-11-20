import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { UserRole, Department } from "../types/enums";
import Employee from "./Employee";

export interface UserAttributes {
  id: number;
  employeeId: number | null;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: Department;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "employeeId" | "isActive" | "lastLogin" | "createdAt" | "updatedAt"
  > {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare employeeId: number | null;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare department: Department;
  declare isActive: boolean;
  declare lastLogin?: Date;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations
  declare employee?: Employee;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "employee_id",
      references: {
        model: "employees",
        key: "id",
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM("admin", "ceo", "L1", "L2", "L3", "L4", "L5"),
      allowNull: false,
    },
    department: {
      type: DataTypes.ENUM("EXECUTIVE", "TECHNOLOGY", "FINANCE", "BUSINESS"),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login",
    },
  },
  {
    sequelize,
    tableName: "users",
    underscored: true,
    timestamps: true,
  }
);

export default User;
export { UserRole } from "../types/enums";
