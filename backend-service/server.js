const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const mevLogRoutes = require("./routes/mevLogRoutes");

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/", authRoutes);
app.use("/", mevLogRoutes);

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
