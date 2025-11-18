import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

async function createDatabase() {
  const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres", // Connect to default postgres database
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL server");

    const dbName = process.env.DB_NAME || "empchartio_db";

    // Check if database exists
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (results.length === 0) {
      // Create database
      await sequelize.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created successfully`);
    } else {
      console.log(`✓ Database '${dbName}' already exists`);
    }

    await sequelize.close();
  } catch (error) {
    console.error("Error creating database:", error);
    process.exit(1);
  }
}

createDatabase();
