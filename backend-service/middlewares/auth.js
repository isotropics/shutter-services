const env = require("../config/env");
const jwt = require("jsonwebtoken");

const apiKeyAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Invalid or missing API Key" });
  }

  const token = authHeader.split(" ")[1];
  if (token !== env.API_KEY) {
    return res.status(403).json({ error: "Invalid API Key" });
  }

  next();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

module.exports = { apiKeyAuth, authenticateToken };
