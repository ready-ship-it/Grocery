const express = require('express');
const { pool } = require('../db');
const { authorizeAdmin } = require('../auth');
const router = express.Router();

// Create products table if not exists
async function ensureProductsTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL UNIQUE,
        sku VARCHAR(50) UNIQUE,
        category VARCHAR(100),
        quantity INT DEFAULT 0,
        unit VARCHAR(50),
        cost_price DECIMAL(10,2) DEFAULT 0,
        selling_price DECIMAL(10,2) DEFAULT 0,
        min_stock_level INT DEFAULT 10,
        max_stock_level INT DEFAULT 100,
        supplier VARCHAR(100),
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    connection.release();
  } catch (err) {
    console.error('Error ensuring products table:', err.message);
  }
}

ensureProductsTable();

// Get all products
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let query = 'SELECT * FROM products';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY name ASC';
    const [products] = await pool.query(query, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product
router.post('/', authorizeAdmin, async (req, res) => {
  try {
    const { name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level, supplier, expiry_date } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO products (name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level, supplier, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level, supplier, expiry_date]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', authorizeAdmin, async (req, res) => {
  try {
    const { name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level, supplier, expiry_date } = req.body;
    
    await pool.query(
      'UPDATE products SET name=?, sku=?, category=?, quantity=?, unit=?, cost_price=?, selling_price=?, min_stock_level=?, max_stock_level=?, supplier=?, expiry_date=? WHERE id=?',
      [name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level, supplier, expiry_date, req.params.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', authorizeAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Low stock products
router.get('/alerts/low-stock', authorizeAdmin, async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE quantity <= min_stock_level ORDER BY quantity ASC');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
