require('dotenv').config();
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

const defaultProducts = [
  // Vegetables
  { name: 'Fresh Tomatoes', sku: 'TOMATO-001', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Onions', sku: 'ONION-001', category: 'Vegetables', cost_price: 25, selling_price: 40, unit: 'kg' },
  { name: 'Potatoes', sku: 'POTATO-001', category: 'Vegetables', cost_price: 15, selling_price: 30, unit: 'kg' },
  { name: 'Carrots', sku: 'CARROT-001', category: 'Vegetables', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Cabbage', sku: 'CABBAGE-001', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Cauliflower', sku: 'CAULI-001', category: 'Vegetables', cost_price: 35, selling_price: 60, unit: 'piece' },
  { name: 'Cucumber', sku: 'CUCUMBER-001', category: 'Vegetables', cost_price: 15, selling_price: 25, unit: 'piece' },
  { name: 'Green Chillies', sku: 'GCHILLI-001', category: 'Vegetables', cost_price: 50, selling_price: 80, unit: '250g' },
  { name: 'Ginger', sku: 'GINGER-001', category: 'Vegetables', cost_price: 60, selling_price: 100, unit: '250g' },
  { name: 'Garlic', sku: 'GARLIC-001', category: 'Vegetables', cost_price: 40, selling_price: 70, unit: '250g' },
  // Dairy & Bakery
  { name: 'Amul Milk (1L)', sku: 'MILK-AMUL', category: 'Dairy', cost_price: 40, selling_price: 65, unit: 'piece' },
  { name: 'Paneer (200g)', sku: 'PANEER-001', category: 'Dairy', cost_price: 90, selling_price: 140, unit: 'piece' },
  { name: 'Butter (100g)', sku: 'BUTTER-001', category: 'Dairy', cost_price: 50, selling_price: 80, unit: 'piece' },
  { name: 'Curd (500g)', sku: 'CURD-001', category: 'Dairy', cost_price: 25, selling_price: 40, unit: 'piece' },
  { name: 'Cheese Slices (200g)', sku: 'CHEESE-001', category: 'Dairy', cost_price: 100, selling_price: 150, unit: 'piece' },
  { name: 'Eggs (6 pack)', sku: 'EGGS-006', category: 'Dairy', cost_price: 35, selling_price: 55, unit: 'pack' },
  { name: 'White Bread (400g)', sku: 'BREAD-WH', category: 'Bakery', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Brown Bread (400g)', sku: 'BREAD-BR', category: 'Bakery', cost_price: 35, selling_price: 55, unit: 'piece' },
  { name: 'Biscuits Parle-G (200g)', sku: 'BISCUIT-PG', category: 'Bakery', cost_price: 20, selling_price: 35, unit: 'piece' },
  { name: 'Marie Gold (200g)', sku: 'BISCUIT-MG', category: 'Bakery', cost_price: 25, selling_price: 40, unit: 'piece' },
  // Staples - Grains & Pulses
  { name: 'Ashirvaad Atta (5kg)', sku: 'ATTA-ASH', category: 'Grains', cost_price: 200, selling_price: 320, unit: 'piece' },
  { name: 'Basmati Rice (5kg)', sku: 'RICE-BAS', category: 'Grains', cost_price: 350, selling_price: 550, unit: 'piece' },
  { name: 'Sona Masuri Rice (5kg)', sku: 'RICE-SOMA', category: 'Grains', cost_price: 250, selling_price: 400, unit: 'piece' },
  { name: 'Toor Dal (1kg)', sku: 'DAL-TOOR', category: 'Grains', cost_price: 80, selling_price: 130, unit: 'piece' },
  { name: 'Moong Dal (1kg)', sku: 'DAL-MOONG', category: 'Grains', cost_price: 70, selling_price: 120, unit: 'piece' },
  { name: 'Masoor Dal (1kg)', sku: 'DAL-MASOOR', category: 'Grains', cost_price: 60, selling_price: 100, unit: 'piece' },
  { name: 'Chana Dal (1kg)', sku: 'DAL-CHANA', category: 'Grains', cost_price: 75, selling_price: 125, unit: 'piece' },
  { name: 'Sugar (1kg)', sku: 'SUGAR-001', category: 'Grains', cost_price: 40, selling_price: 65, unit: 'piece' },
  { name: 'Salt Tata (1kg)', sku: 'SALT-TATA', category: 'Condiments', cost_price: 15, selling_price: 25, unit: 'piece' },
  { name: 'Besan (500g)', sku: 'BESAN-001', category: 'Grains', cost_price: 35, selling_price: 60, unit: 'piece' },
  // Oils & Ghee
  { name: 'Sunflower Oil (1L)', sku: 'OIL-SUNF', category: 'Oils', cost_price: 120, selling_price: 180, unit: 'piece' },
  { name: 'Mustard Oil (1L)', sku: 'OIL-MUST', category: 'Oils', cost_price: 130, selling_price: 200, unit: 'piece' },
  { name: 'Groundnut Oil (1L)', sku: 'OIL-GNUT', category: 'Oils', cost_price: 140, selling_price: 210, unit: 'piece' },
  { name: 'Olive Oil (1L)', sku: 'OIL-OLIVE', category: 'Oils', cost_price: 300, selling_price: 450, unit: 'piece' },
  { name: 'Desi Ghee (500ml)', sku: 'GHEE-001', category: 'Oils', cost_price: 200, selling_price: 300, unit: 'piece' },
  // Snacks & Branded Foods
  { name: 'Maggi Noodles (4 pack)', sku: 'MAGGI-4', category: 'Snacks', cost_price: 40, selling_price: 65, unit: 'pack' },
  { name: 'Haldiram Bhujia (200g)', sku: 'HALDIRAM-BH', category: 'Snacks', cost_price: 50, selling_price: 80, unit: 'piece' },
  { name: 'Lays Chips (45g)', sku: 'LAYS-45', category: 'Snacks', cost_price: 15, selling_price: 25, unit: 'piece' },
  { name: 'Corn Flakes (400g)', sku: 'CORNFLAKES', category: 'Snacks', cost_price: 80, selling_price: 130, unit: 'piece' },
  { name: 'Kissan Ketchup (500g)', sku: 'KETCHUP-KIS', category: 'Condiments', cost_price: 50, selling_price: 80, unit: 'piece' },
  { name: 'Kissan Jam (500g)', sku: 'JAM-KISS', category: 'Condiments', cost_price: 60, selling_price: 95, unit: 'piece' },
  { name: 'Tata Tea (250g)', sku: 'TEA-TATA', category: 'Beverages', cost_price: 80, selling_price: 130, unit: 'piece' },
  { name: 'Nescafe Coffee (50g)', sku: 'COFFEE-NES', category: 'Beverages', cost_price: 60, selling_price: 100, unit: 'piece' },
  // Fruits
  { name: 'Apples (1kg)', sku: 'APPLE-001', category: 'Fruits', cost_price: 80, selling_price: 120, unit: 'kg' },
  { name: 'Bananas (1kg)', sku: 'BANANA-001', category: 'Fruits', cost_price: 40, selling_price: 60, unit: 'kg' },
  { name: 'Oranges (1kg)', sku: 'ORANGE-001', category: 'Fruits', cost_price: 60, selling_price: 90, unit: 'kg' },
  { name: 'Grapes (1kg)', sku: 'GRAPES-001', category: 'Fruits', cost_price: 100, selling_price: 150, unit: 'kg' },
  { name: 'Pomegranate (1kg)', sku: 'POMEGRAN-001', category: 'Fruits', cost_price: 120, selling_price: 180, unit: 'kg' },
  { name: 'Papaya (1 piece)', sku: 'PAPAYA-001', category: 'Fruits', cost_price: 30, selling_price: 50, unit: 'piece' },
  // Meat & Fish
  { name: 'Chicken (1kg)', sku: 'CHICKEN-001', category: 'Meat', cost_price: 200, selling_price: 300, unit: 'kg' },
  { name: 'Fish (1kg)', sku: 'FISH-001', category: 'Meat', cost_price: 250, selling_price: 380, unit: 'kg' },
  { name: 'Mutton (1kg)', sku: 'MUTTON-001', category: 'Meat', cost_price: 350, selling_price: 500, unit: 'kg' },
  // Cleaning & Household
  { name: 'Vim Dishwash Liquid (500ml)', sku: 'VIM-500', category: 'Cleaning', cost_price: 35, selling_price: 60, unit: 'piece' },
  { name: 'Surf Excel Detergent (1kg)', sku: 'SURF-1KG', category: 'Cleaning', cost_price: 90, selling_price: 150, unit: 'piece' },
  { name: 'Harpic Toilet Cleaner (500ml)', sku: 'HARPIC-500', category: 'Cleaning', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Lizol Floor Cleaner (500ml)', sku: 'LIZOL-500', category: 'Cleaning', cost_price: 35, selling_price: 60, unit: 'piece' },
  { name: 'Dettol Soap (100g)', sku: 'DETTOL-SOAP', category: 'Cleaning', cost_price: 20, selling_price: 35, unit: 'piece' },
  { name: 'Colgate Toothpaste (150g)', sku: 'COLGATE-150', category: 'Cleaning', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Dettol Handwash (250ml)', sku: 'DETTOL-HW', category: 'Cleaning', cost_price: 35, selling_price: 60, unit: 'piece' },
  // Beverages
  { name: 'Coca Cola (600ml)', sku: 'COKE-600', category: 'Beverages', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Pepsi (600ml)', sku: 'PEPSI-600', category: 'Beverages', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Mineral Water (1L)', sku: 'WATER-1L', category: 'Beverages', cost_price: 10, selling_price: 20, unit: 'piece' },
  { name: 'Real Juice (1L)', sku: 'REAL-1L', category: 'Beverages', cost_price: 60, selling_price: 100, unit: 'piece' }
];

const defaultCustomers = [
  { name: 'Rajesh Kumar', mobile: '9876543210', email: 'rajesh@email.com', address: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { name: 'Priya Singh', mobile: '9876543211', email: 'priya@email.com', address: '456 Park Avenue', city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { name: 'Amit Patel', mobile: '9876543212', email: 'amit@email.com', address: '789 Market Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { name: 'Neha Gupta', mobile: '9876543213', email: 'neha@email.com', address: '321 Garden Lane', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { name: 'Vikram Sharma', mobile: '9876543214', email: 'vikram@email.com', address: '654 River Road', city: 'Hyderabad', state: 'Telangana', pincode: '500001' }
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

    // Customers table
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

    // Seed customers
    console.log('🔄 Seeding customers...');
    for (const customer of defaultCustomers) {
      try {
        await connection.query(
          'INSERT INTO customers (name, mobile, email, address, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [customer.name, customer.mobile, customer.email, customer.address, customer.city, customer.state, customer.pincode]
        );
      } catch (err) {
        // Customer already exists
      }
    }
    console.log(`✅ ${defaultCustomers.length} customers seeded`);

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
