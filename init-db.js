require('dotenv').config();
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

const defaultProducts = [
  { name: 'Fresh Tomatoes', sku: 'TOMATO-001', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Onions', sku: 'ONION-001', category: 'Vegetables', cost_price: 25, selling_price: 40, unit: 'kg' },
  { name: 'Potatoes', sku: 'POTATO-001', category: 'Vegetables', cost_price: 15, selling_price: 30, unit: 'kg' },
  { name: 'Carrots', sku: 'CARROT-001', category: 'Vegetables', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Cabbage', sku: 'CABBAGE-001', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Milk (1L)', sku: 'MILK-001', category: 'Dairy', cost_price: 40, selling_price: 65, unit: 'piece' },
  { name: 'Yogurt (500g)', sku: 'YOGURT-001', category: 'Dairy', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Cheese (200g)', sku: 'CHEESE-001', category: 'Dairy', cost_price: 100, selling_price: 150, unit: 'piece' },
  { name: 'Bread (1kg)', sku: 'BREAD-001', category: 'Bakery', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Biscuits (200g)', sku: 'BISCUIT-001', category: 'Bakery', cost_price: 25, selling_price: 40, unit: 'piece' },
  { name: 'Rice (1kg)', sku: 'RICE-001', category: 'Grains', cost_price: 50, selling_price: 80, unit: 'kg' },
  { name: 'Wheat Flour (1kg)', sku: 'FLOUR-001', category: 'Grains', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Sugar (1kg)', sku: 'SUGAR-001', category: 'Grains', cost_price: 40, selling_price: 65, unit: 'kg' },
  { name: 'Salt (1kg)', sku: 'SALT-001', category: 'Condiments', cost_price: 15, selling_price: 25, unit: 'kg' },
  { name: 'Oil (1L)', sku: 'OIL-001', category: 'Oils', cost_price: 120, selling_price: 180, unit: 'piece' },
  { name: 'Apples (1kg)', sku: 'APPLE-001', category: 'Fruits', cost_price: 80, selling_price: 120, unit: 'kg' },
  { name: 'Bananas (1kg)', sku: 'BANANA-001', category: 'Fruits', cost_price: 40, selling_price: 60, unit: 'kg' },
  { name: 'Oranges (1kg)', sku: 'ORANGE-001', category: 'Fruits', cost_price: 60, selling_price: 90, unit: 'kg' },
  { name: 'Chicken (1kg)', sku: 'CHICKEN-001', category: 'Meat', cost_price: 200, selling_price: 300, unit: 'kg' },
  { name: 'Fish (1kg)', sku: 'FISH-001', category: 'Meat', cost_price: 250, selling_price: 380, unit: 'kg' }
];

async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log('🔄 Creating tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role ENUM('cashier','manager','admin','master_admin') DEFAULT 'cashier',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
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

    // Sales table
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

    // Sale items table
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

    // Expenses table
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

    // Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        s_key VARCHAR(100) PRIMARY KEY,
        s_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created');

    // Seed users
    console.log('🔄 Seeding users...');
    const [existingMaster] = await connection.query("SELECT * FROM users WHERE username = 'master'");
    if (existingMaster.length === 0) {
      const hashedMasterPassword = await bcrypt.hash('master123', 10);
      await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['master', hashedMasterPassword, 'Master Admin', 'master_admin']);
      console.log('✅ Master admin created: master / master123');
    }

    const [existingAdmin] = await connection.query("SELECT * FROM users WHERE username = 'admin'");
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['admin', hashedPassword, 'Admin User', 'admin']);
      console.log('✅ Admin created: admin / admin123');
    }

    const [existingCashier] = await connection.query("SELECT * FROM users WHERE username = 'cashier'");
    if (existingCashier.length === 0) {
      const hashedPassword = await bcrypt.hash('cashier123', 10);
      await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['cashier', hashedPassword, 'Cashier User', 'cashier']);
      console.log('✅ Cashier created: cashier / cashier123');
    }

    // Seed products
    console.log('🔄 Seeding products...');
    for (const product of defaultProducts) {
      try {
        await connection.query(
          'INSERT INTO products (name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [product.name, product.sku, product.category, 50, product.unit, product.cost_price, product.selling_price, 10, 100]
        );
      } catch (err) {
        // Product already exists
      }
    }
    console.log(`✅ ${defaultProducts.length} products seeded`);

    // Seed settings
    console.log('🔄 Seeding settings...');
    const defaultSettings = [
      ['shop_name', 'Fresh Grocery Store'],
      ['shop_address', '123, Market Street'],
      ['shop_city', 'Mumbai'],
      ['shop_state', 'Maharashtra'],
      ['shop_pincode', '400001'],
      ['shop_phone', '+91 22 1234 5678'],
      ['shop_email', 'info@freshgrocery.in'],
      ['shop_gstin', '27AABCU9603R1ZX'],
      ['currency', 'Rs'],
      ['theme_primary', '#2d5016'],
      ['theme_secondary', '#4a7c2c'],
      ['theme_accent', '#e74c3c'],
      ['theme_success', '#27ae60'],
      ['theme_warning', '#f39c12'],
      ['backup_enabled', 'true'],
      ['backup_interval', '2'],
      ['ftp_enabled', 'false'],
      ['ftp_host', ''],
      ['ftp_user', ''],
      ['ftp_pass', ''],
      ['ftp_path', '/backups'],
      ['ftp_port', '21']
    ];
    for (const [key, value] of defaultSettings) {
      await connection.query("INSERT IGNORE INTO settings (s_key, s_value) VALUES (?, ?)", [key, value]);
    }
    console.log('✅ Settings seeded');

    connection.release();
    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Login Credentials:');
    console.log('   Master Admin: master / master123');
    console.log('   Admin: admin / admin123');
    console.log('   Cashier: cashier / cashier123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

initDatabase();
