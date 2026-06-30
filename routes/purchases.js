const express = require('express');
const { pool } = require('../db');
const { authorizeAdmin } = require('../auth');
const router = express.Router();

// Create purchases table if not exists
async function ensurePurchasesTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_date DATE,
        supplier_name VARCHAR(150),
        supplier_contact VARCHAR(15),
        total_items INT DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_id INT,
        product_id INT,
        quantity INT,
        unit_cost DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    
    connection.release();
  } catch (err) {
    console.error('Error ensuring purchases table:', err.message);
  }
}

ensurePurchasesTable();

// Get all purchases
router.get('/', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let query = 'SELECT * FROM purchases';
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE purchase_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY purchase_date DESC';
    const [purchases] = await pool.query(query, params);
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get purchase details with items
router.get('/:id', async (req, res) => {
  try {
    const [purchase] = await pool.query('SELECT * FROM purchases WHERE id = ?', [req.params.id]);
    if (purchase.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    const [items] = await pool.query(`
      SELECT pi.*, p.name, p.sku, p.unit 
      FROM purchase_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.purchase_id = ?
    `, [req.params.id]);
    
    res.json({ ...purchase[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create purchase
router.post('/', authorizeAdmin, async (req, res) => {
  try {
    const { supplier_name, supplier_contact, items, total_amount, payment_status, notes } = req.body;
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert purchase
      const [result] = await connection.query(
        'INSERT INTO purchases (purchase_date, supplier_name, supplier_contact, total_items, total_amount, payment_status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [new Date().toISOString().split('T')[0], supplier_name, supplier_contact, items.length, total_amount, payment_status, notes, userId]
      );
      
      const purchaseId = result.insertId;
      
      // Insert purchase items and update product quantities
      for (const item of items) {
        await connection.query(
          'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total_cost) VALUES (?, ?, ?, ?, ?)',
          [purchaseId, item.product_id, item.quantity, item.unit_cost, item.total_cost]
        );
        
        // Update product quantity
        await connection.query(
          'UPDATE products SET quantity = quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      await connection.commit();
      res.json({ success: true, id: purchaseId });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update purchase
router.put('/:id', authorizeAdmin, async (req, res) => {
  try {
    const { supplier_name, supplier_contact, payment_status, notes } = req.body;
    
    await pool.query(
      'UPDATE purchases SET supplier_name=?, supplier_contact=?, payment_status=?, notes=? WHERE id=?',
      [supplier_name, supplier_contact, payment_status, notes, req.params.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete purchase
router.delete('/:id', authorizeAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get purchase items to reverse stock
      const [items] = await connection.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [req.params.id]);
      
      for (const item of items) {
        await connection.query(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      // Delete purchase
      await connection.query('DELETE FROM purchases WHERE id = ?', [req.params.id]);
      
      await connection.commit();
      res.json({ success: true });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
