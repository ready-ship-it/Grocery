const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('../auth');
const router = express.Router();

// Create customers table if not exists
async function ensureCustomersTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        mobile VARCHAR(15) NOT NULL UNIQUE,
        email VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        total_purchases DECIMAL(12,2) DEFAULT 0,
        loyalty_points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    connection.release();
  } catch (err) {
    console.error('Error ensuring customers table:', err.message);
  }
}

ensureCustomersTable();

// Get all customers
router.get('/', authenticate, async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM customers ORDER BY name ASC');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [customer] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (customer.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add customer
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, mobile, email, address, city, state, pincode } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO customers (name, mobile, email, address, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, mobile, email || null, address || null, city || null, state || null, pincode || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Mobile number already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update customer
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, mobile, email, address, city, state, pincode } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile are required' });
    }
    
    await pool.query(
      'UPDATE customers SET name=?, mobile=?, email=?, address=?, city=?, state=?, pincode=? WHERE id=?',
      [name, mobile, email || null, address || null, city || null, state || null, pincode || null, req.params.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Mobile number already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete customer
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search customers by name or mobile
router.get('/search/query', authenticate, async (req, res) => {
  try {
    const query = req.query.q || '';
    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE name LIKE ? OR mobile LIKE ? ORDER BY name ASC',
      [`%${query}%`, `%${query}%`]
    );
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
