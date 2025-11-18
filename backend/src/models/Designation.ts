import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { EmployeeLevel } from "../types/enums";
import Department from "./Department";

interface DesignationAttributes {
  id: number;
  title: string;
  departmentId: number;
  level: EmployeeLevel;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DesignationCreationAttributes
  extends Optional<DesignationAttributes, "id" | "createdAt" | "updatedAt"> {}

class Designation
  extends Model<DesignationAttributes, DesignationCreationAttributes>
  implements DesignationAttributes
{
  declare id: number;
  declare title: string;
  declare departmentId: number;
  declare level: EmployeeLevel;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations
  declare department?: Department;
}

Designation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "department_id",
      references: {
        model: "departments",
        key: "id",
      },
    },
    level: {
      type: DataTypes.ENUM("L1", "L2", "L3", "L4", "L5"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "designations",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["title", "department_id"],
      },
    ],
  }
);

export default Designation;
