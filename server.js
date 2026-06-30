require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs');
const { pool, testConnection } = require('./db');
const { authenticate } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', authenticate, require('./routes/products'));
app.use('/api/sales', authenticate, require('./routes/sales'));
app.use('/api/purchases', authenticate, require('./routes/purchases'));
app.use('/api/expenses', authenticate, require('./routes/expenses'));
app.use('/api/analytics', authenticate, require('./routes/analytics'));
app.use('/api/users', authenticate, require('./routes/users'));
app.use('/api/customers', authenticate, require('./routes/customers'));
app.use('/api/settings', authenticate, require('./routes/settings'));
app.use('/api/backup', authenticate, require('./routes/backup'));
app.use('/api/dashboard', authenticate, require('./routes/dashboard'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'grocery-shop-management', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auto-backup every 2 hours (keep last 5)
async function autoBackup() {
  try {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    const tables = ['products', 'sales', 'sale_items', 'expenses', 'users', 'settings'];
    const backup = {};
    const connection = await pool.getConnection();

    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SELECT * FROM ${table}`);
        backup[table] = rows;
      } catch (err) {
        backup[table] = [];
      }
    }

    connection.release();

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    // Keep only last 5 backups
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-'))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    files.slice(5).forEach(f => {
      fs.unlinkSync(path.join(backupDir, f.name));
    });

    console.log(`💾 Auto backup saved: ${filename}`);

    // FTP backup if enabled
    const [ftpSettings] = await pool.query("SELECT s_key, s_value FROM settings WHERE s_key LIKE 'ftp_%' OR s_key = 'backup_enabled'");
    const settings = {};
    ftpSettings.forEach(s => settings[s.s_key] = s.s_value);

    if (settings.ftp_enabled === 'true' && settings.ftp_host && settings.ftp_user) {
      try {
        const ftp = require('basic-ftp');
        const client = new ftp.Client();
        await client.access({
          host: settings.ftp_host,
          user: settings.ftp_user,
          password: settings.ftp_pass,
          port: parseInt(settings.ftp_port || 21),
          secure: false
        });

        await client.ensureDir(settings.ftp_path || '/backups');
        await client.uploadFrom(filepath, filename);

        // Keep only last 5 on FTP
        const ftpList = await client.list();
        const ftpFiles = ftpList
          .filter(f => f.name.startsWith('backup-') && f.name.endsWith('.json'))
          .sort((a, b) => b.name.localeCompare(a.name));

        if (ftpFiles.length > 5) {
          for (const f of ftpFiles.slice(5)) {
            await client.remove(f.name);
          }
        }

        client.close();
        console.log(`📤 FTP backup uploaded: ${filename}`);
      } catch (ftpErr) {
        console.error('FTP backup failed:', ftpErr.message);
      }
    }
  } catch (err) {
    console.error('Auto backup failed:', err.message);
  }
}

// Schedule backup every 2 hours
cron.schedule('0 */2 * * *', autoBackup);

// Start server
async function startServer() {
  try {
    // Test MySQL connection
    const connected = await testConnection();
    if (!connected) {
      console.error('⚠️  Could not connect to MySQL. Retrying in 5 seconds...');
      setTimeout(startServer, 5000);
      return;
    }

    // Ensure tables exist
    try {
      const connection = await pool.getConnection();
      
      await connection.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(100), role ENUM('cashier','manager','admin','master_admin') DEFAULT 'cashier', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await connection.query(`CREATE TABLE IF NOT EXISTS settings (s_key VARCHAR(100) PRIMARY KEY, s_value TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);

      // Seed default users
      const bcrypt = require('bcryptjs');
      
      const [existingMaster] = await connection.query("SELECT * FROM users WHERE username = 'master'");
      if (existingMaster.length === 0) {
        const hashedMasterPassword = await bcrypt.hash('master123', 10);
        await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['master', hashedMasterPassword, 'Master Admin', 'master_admin']);
        console.log('✅ Default master admin created: master / master123');
      }

      const [existingAdmin] = await connection.query("SELECT * FROM users WHERE username = 'admin'");
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['admin', hashedPassword, 'Admin User', 'admin']);
        console.log('✅ Default admin created: admin / admin123');
      }

      // Seed default settings
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
        ['theme_primary', '#1a5276'],
        ['theme_secondary', '#2e86c1'],
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

      connection.release();
      console.log('✅ Database tables verified');
    } catch (initErr) {
      console.error('⚠️ DB init error:', initErr.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🛒 Grocery Shop Management System running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      autoBackup();
    });
  } catch (err) {
    console.error('❌ Server start failed:', err.message);
    process.exit(1);
  }
}

startServer();
