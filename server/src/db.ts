// server/src/db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL no definido en .env');
}

export const pool = mysql.createPool({
  uri: url,
  waitForConnections: true,
  connectionLimit: 10
});
