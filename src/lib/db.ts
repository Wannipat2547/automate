import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? mysql.createPool(databaseUrl)
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'finance',
      waitForConnections: true,
      connectionLimit: 10,
    });

export default pool;
