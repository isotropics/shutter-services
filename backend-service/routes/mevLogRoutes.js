const express = require("express");
const { getLogs, createLog } = require("../controllers/mevLogController");
const { apiKeyAuth } = require("../middlewares/auth");

const router = express.Router();
router.get("/logs", apiKeyAuth, getLogs);
router.post("/logs", apiKeyAuth, createLog);

module.exports = router;
