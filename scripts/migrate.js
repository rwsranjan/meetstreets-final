const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
  });
}

async function run() {
  console.log(`Connecting to MySQL at ${process.env.DB_HOST} with user ${process.env.DB_USER}...`);
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Essential for running multiple queries from a file
  });

  try {
    const schemaPath = path.resolve(process.cwd(), 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('Executing schema.sql...');
    await connection.query(sql);
    
    console.log('✅ Database initialization successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await connection.end();
  }
}

run();
