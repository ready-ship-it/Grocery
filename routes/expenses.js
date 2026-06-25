const express = require('express');
const { pool } = require('../db');
const { authorizeAdmin } = require('../auth');
const router = express.Router();

// Create expenses table if not exists
async function ensureExpensesTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100),
        description TEXT,
        amount DECIMAL(10,2),
        expense_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    connection.release();
  } catch (err) {
    console.error('Error ensuring expenses table:', err.message);
  }
}

ensureExpensesTable();

// Get expenses
router.get('/', authorizeAdmin, async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let query = 'SELECT e.*, u.name as created_by_name FROM expenses e LEFT JOIN users u ON e.created_by = u.id';
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE e.expense_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY e.expense_date DESC';
    const [expenses] = await pool.query(query, params);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add expense
router.post('/', authorizeAdmin, async (req, res) => {
  try {
    const { category, amount, expense_date, description, created_by } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO expenses (category, description, amount, expense_date, created_by) VALUES (?, ?, ?, ?, ?)',
      [category, description, amount, expense_date, created_by]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expense summary
router.get('/summary/all', authorizeAdmin, async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let query = 'SELECT SUM(amount) as total_expenses, COUNT(*) as total_entries, AVG(amount) as average_expense, MAX(amount) as max_expense FROM expenses';
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE expense_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const [[summary]] = await pool.query(query, params);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
