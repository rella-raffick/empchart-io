import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Support both Supabase and local Docker PostgreSQL
// Priority: SUPABASE_DB_URL > DATABASE_URL (for local Docker)
const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Database connection string is required. Set either SUPABASE_DB_URL or DATABASE_URL in .env file');
}

// Determine if we're using Supabase (SSL required) or local PostgreSQL
const isSupabase = !!process.env.SUPABASE_DB_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: isSupabase ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
