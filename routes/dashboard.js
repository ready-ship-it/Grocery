const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [[totalProducts]] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [[lowStock]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock_level');
    const [[totalSales]] = await pool.query("SELECT COUNT(*) as count FROM sales WHERE DATE(sale_date) = ?", [today]);
    const [[todayRevenue]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE DATE(sale_date) = ?', [today]);
    const [[totalRevenue]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM sales');
    const [[totalExpenses]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE DATE(expense_date) = ?', [today]);

    res.json({
      totalProducts: totalProducts.count,
      lowStock: lowStock.count,
      todaySales: totalSales.count,
      todayRevenue: todayRevenue.total,
      totalRevenue: totalRevenue.total,
      todayExpenses: totalExpenses.total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent-sales', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, u.name as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.cashier_id = u.id
      ORDER BY s.id DESC LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
