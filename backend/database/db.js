const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,

  // SUPABASE NEEDS SSL
  ssl: {
    rejectUnauthorized: false
  },

  // Prevent too many idle connections
  max: 5,
  idleTimeoutMillis: 10000,     // close idle clients quickly (Supabase likes this)
  connectionTimeoutMillis: 5000
});

// Handle errors without crashing
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

module.exports = pool;
