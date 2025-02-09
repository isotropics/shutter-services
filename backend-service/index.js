require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const cors = require("cors");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure required environment variables are set
if (!API_KEY || !JWT_SECRET) {
  console.error("❌ Missing required environment variables! Check .env file.");
  process.exit(1);
}

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Middleware
app.use(cors());
app.use(helmet()); // Security middleware
app.use(express.json());

// 🚀 Initialize Database Tables
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

// 🔐 API Key Authentication Middleware
const apiKeyAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Invalid or missing API Key" });
  }

  const token = authHeader.split(" ")[1];
  if (token !== API_KEY) {
    return res.status(403).json({ error: "Invalid API Key" });
  }

  next();
};

// 🔑 JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// 👤 User Registration
app.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
        [username, email, hashedPassword]
      );
      res.status(201).json({ message: "User registered successfully!", user: result.rows[0] });
    } catch (error) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "Email is already in use." });
      }
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }
);

// 🔑 User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// 📊 Get All MEV Logs (API Key Required)
app.get("/logs", apiKeyAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM mev_logs ORDER BY date DESC, time DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// 📝 Create a New MEV Log (API Key Required)
app.post(
  "/logs",
  apiKeyAuth,
  [
    body("date").notEmpty().withMessage("Date is required."),
    body("time").notEmpty().withMessage("Time is required."),
    body("trans_id").notEmpty().withMessage("Transaction ID is required."),
    body("mev_type").notEmpty().withMessage("MEV type is required."),
    body("trade_amnt").isNumeric().withMessage("Trade amount must be a number."),
    body("swap_amnt").isNumeric().withMessage("Swap amount must be a number."),
    body("profit").isNumeric().withMessage("Profit must be a number."),
    body("loss").optional().isNumeric().withMessage("Loss must be a number."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { date, time, trans_id, mev_type, trade_amnt, swap_amnt, profit, loss = 0 } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO mev_logs (date, time, trans_id, mev_type, trade_amnt, swap_amnt, profit, loss) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [date, time, trans_id, mev_type, trade_amnt, swap_amnt, profit, loss]
      );

      res.status(201).json({ message: "MEV log added successfully", log: result.rows[0] });
    } catch (error) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "Transaction ID must be unique." });
      }
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }
);

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
