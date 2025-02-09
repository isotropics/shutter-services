require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,
  API_KEY: process.env.API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASS: process.env.DB_PASS,
  DB_PORT: process.env.DB_PORT,
};

if (!env.API_KEY || !env.JWT_SECRET) {
  console.error("❌ Missing required environment variables! Check .env file.");
  process.exit(1);
}

module.exports = env;
