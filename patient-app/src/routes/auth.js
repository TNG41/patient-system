const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  const hashed = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS));
  try {
    const result = await db.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3) RETURNING id, username, role",
      [username, hashed, role || "doctor"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "Username already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await db.query("SELECT * FROM users WHERE username=$1", [username]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
});

module.exports = router;
