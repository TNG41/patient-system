const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// Get patients
router.get("/", requireAuth(["doctor", "admin"]), async (req, res) => {
  try {
    const showAll = req.query.all === "true";

    let query, params;
    if (req.user.role === "admin" || showAll) {
      query = `
        SELECT p.*, u.first_name AS doctor_first, u.last_name AS doctor_last
        FROM patients p
        LEFT JOIN users u ON p.created_by = u.id
        ORDER BY p.id DESC
      `;
      params = [];
    } else {
      query = `
        SELECT p.*, u.first_name AS doctor_first, u.last_name AS doctor_last
        FROM patients p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.created_by = $1
        ORDER BY p.id DESC
      `;
      params = [req.user.id];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});




// Add patient
router.post("/", requireAuth(["doctor", "admin"]), async (req, res) => {
  const { first_name, last_name, dob, gender, national_id } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO patients (first_name, last_name, dob, gender, national_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [first_name, last_name, dob, gender, national_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add patient" });
  }
});

// Update patient
router.put("/:id", requireAuth(["doctor", "admin"]), async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name } = req.body;

  try {
    const result = await db.query(
      "UPDATE patients SET first_name=$1, last_name=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
      [first_name, last_name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// Delete patient
router.delete("/:id", requireAuth(["doctor", "admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM patients WHERE id=$1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});



module.exports = router;
