require('dotenv').config();
const mysql = require('mysql2/promise');

// Railway injects env vars directly - no .env file needed
// Railway MySQL variables: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
// Standard variables: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

const host = process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost';
const user = process.env.MYSQLUSER || process.env.MYSQL_USER || 'root';
const password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '';
const database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'grocery_shop';
const port = parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306');

console.log('🔧 MySQL Config:');
console.log('   Host:', host);
console.log('   User:', user);
console.log('   Database:', database);
console.log('   Port:', port);
console.log('   Password exists:', password ? 'Yes' : 'No');

const pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
  port: port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Host used:', host);
    console.error('   Port used:', port);
    return false;
  }
}

module.exports = { pool, testConnection };
