const jwt = require("jsonwebtoken");
const db = require("../db");

const requireAuth = (roles = []) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.query("SELECT id, username, role FROM users WHERE id=$1", [payload.sub]);
    if (!user.rows[0]) return res.status(401).json({ error: "Invalid user" });

    req.user = user.rows[0];
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};

module.exports = { requireAuth };
