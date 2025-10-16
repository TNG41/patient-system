const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");

dotenv.config();

// 🛡 Security Middlewares
app.use(helmet());

// ✅ Correct CORS placement — allow only your frontend
app.use(cors({
  origin: ["https://patient-system-1.onrender.com"],
  credentials: true
}));

app.use(express.json());

// ⚙️ Rate limiting (200 requests per minute)
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// 🧩 Routes
app.use("/auth", authRoutes);
app.use("/patients", patientRoutes);

// 🩺 Root route for testing
app.get("/", (req, res) => {
  res.json({ message: "Patient API running" });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
