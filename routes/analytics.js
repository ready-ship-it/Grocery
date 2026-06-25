const express = require('express');
const { pool } = require('../db');
const { authorizeAdmin } = require('../auth');
const router = express.Router();

// Revenue analytics by date range
router.get('/revenue', authorizeAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT
        DATE(s.sale_date) as date,
        COUNT(s.id) as total_sales,
        SUM(s.total_amount) as total_revenue,
        COUNT(DISTINCT s.cashier_id) as cashiers
      FROM sales s
    `;
    const params = [];

    if (startDate && endDate) {
      query += ` WHERE s.sale_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    query += ` GROUP BY DATE(s.sale_date) ORDER BY date DESC`;

    const [data] = await pool.query(query, params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top selling products
router.get('/top-products', authorizeAdmin, async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const [products] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.category,
        p.selling_price,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Category sales
router.get('/category-sales', authorizeAdmin, async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT
        p.category,
        COUNT(DISTINCT si.sale_id) as sales_count,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      WHERE p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly trend
router.get('/monthly-trend', authorizeAdmin, async (req, res) => {
  try {
    const [trend] = await pool.query(`
      SELECT
        DATE_FORMAT(s.sale_date, '%Y-%m') as month,
        COUNT(s.id) as total_sales,
        SUM(s.total_amount) as total_revenue,
        COUNT(DISTINCT s.cashier_id) as unique_cashiers
      FROM sales s
      GROUP BY DATE_FORMAT(s.sale_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json(trend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
