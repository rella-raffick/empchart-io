import sequelize from "../config/database";
import dotenv from "dotenv";

dotenv.config();

async function createDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Supabase PostgreSQL database");

    await sequelize.sync({ force: true });
    console.log("All tables dropped and recreated with updated schema");
    console.log("Database is ready");

    await sequelize.close();
  } catch (error) {
    console.error("Error connecting to database:", error);
    console.error("\nPlease check:");
    console.error("1. SUPABASE_DB_URL is set correctly in .env");
    console.error("2. Your database password is correct");
    console.error("3. Your Supabase project is active");
    process.exit(1);
  }
}

createDatabase();
