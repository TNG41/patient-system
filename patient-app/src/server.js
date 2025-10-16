const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");

dotenv.config();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.use("/auth", authRoutes);
app.use("/patients", patientRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Patient API running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

import cors from "cors";

app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend.onrender.com"],
  credentials: true,
}));
