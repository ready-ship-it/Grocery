const express = require('express');
const { pool } = require('../db');
const { authorizeAdmin } = require('../auth');
const router = express.Router();

// Get all settings
router.get('/', authorizeAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT s_key, s_value FROM settings');
    const settings = {};
    rows.forEach(row => settings[row.s_key] = row.s_value);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update setting
router.put('/', authorizeAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    await pool.query('INSERT INTO settings (s_key, s_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE s_value = ?', [key, value, value]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
