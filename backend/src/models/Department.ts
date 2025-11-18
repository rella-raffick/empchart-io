import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { Department as DepartmentEnum } from "../types/enums";

interface DepartmentAttributes {
  id: number;
  code: DepartmentEnum;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DepartmentCreationAttributes
  extends Optional<DepartmentAttributes, "id" | "createdAt" | "updatedAt"> {}

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  declare id: number;
  declare code: DepartmentEnum;
  declare name: string;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.ENUM("EXECUTIVE", "TECHNOLOGY", "FINANCE", "BUSINESS"),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "departments",
    underscored: true,
    timestamps: true,
  }
);

export default Department;
