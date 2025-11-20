import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const supabaseDbUrl = process.env.SUPABASE_DB_URL;

if (!supabaseDbUrl) {
  throw new Error('SUPABASE_DB_URL environment variable is required. Get it from Supabase Dashboard > Project Settings > Database > Connection String');
}

const sequelize = new Sequelize(supabaseDbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
