const pool = require("../config/db");
const MevLog = require("../models/MevLog");

exports.getLogs = async (req, res) => {
  try {
    const result = await MevLog.getAllLogs(pool);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const result = await MevLog.createLog(pool, req.body);
    res.status(201).json({ message: "MEV log added successfully", log: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
