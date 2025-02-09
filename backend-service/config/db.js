const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASS,
  port: env.DB_PORT,
});

const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS mev_logs (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      time TIME NOT NULL,
      trans_id TEXT UNIQUE NOT NULL,
      mev_type TEXT NOT NULL,
      trade_amnt DECIMAL(10,2) NOT NULL,
      swap_amnt DECIMAL(10,2) NOT NULL,
      profit DECIMAL(10,6) NOT NULL,
      loss DECIMAL(10,6) DEFAULT 0.000000
    );`,
  ];

  try {
    for (let query of queries) await pool.query(query);
    console.log("✅ Database tables initialized.");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};

createTables();

module.exports = pool;
