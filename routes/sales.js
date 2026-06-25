const express = require('express');
const { pool } = require('../db');
const { authorizeAdmin } = require('../auth');
const router = express.Router();

// Create sales table if not exists
async function ensureSalesTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_date DATE,
        cashier_id INT,
        total_items INT DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cashier_id) REFERENCES users(id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT,
        product_id INT,
        quantity INT,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    
    connection.release();
  } catch (err) {
    console.error('Error ensuring sales table:', err.message);
  }
}

ensureSalesTable();

// Get all sales
router.get('/', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let query = 'SELECT s.*, u.name as cashier_name FROM sales s LEFT JOIN users u ON s.cashier_id = u.id';
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE s.sale_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY s.id DESC';
    const [sales] = await pool.query(query, params);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sale details
router.get('/:id', async (req, res) => {
  try {
    const [items] = await pool.query('SELECT si.*, p.name FROM sale_items si LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?', [req.params.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  try {
    const { sale_date, cashier_id, items, payment_method } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.total_price;
    }
    
    const [saleResult] = await connection.query(
      'INSERT INTO sales (sale_date, cashier_id, total_items, total_amount, payment_method) VALUES (?, ?, ?, ?, ?)',
      [sale_date, cashier_id, items.length, totalAmount, payment_method]
    );
    
    const saleId = saleResult.insertId;
    
    for (const item of items) {
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, item.unit_price, item.total_price]
      );
      
      await connection.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    await connection.commit();
    connection.release();
    
    res.json({ success: true, saleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
