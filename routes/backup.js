const express = require('express');
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');
const router = express.Router();

router.get('/list', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) return res.json([]);

    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        size: fs.statSync(path.join(backupDir, f)).size,
        date: fs.statSync(path.join(backupDir, f)).mtime
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, '..', 'backups', filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.download(filePath);
});

router.post('/manual', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
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
    const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup-')).map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() })).sort((a, b) => b.time - a.time);
    files.slice(5).forEach(f => { fs.unlinkSync(path.join(backupDir, f.name)); });

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
        const ftpList = await client.list();
        const ftpFiles = ftpList.filter(f => f.name.startsWith('backup-') && f.name.endsWith('.json')).sort((a, b) => b.name.localeCompare(a.name));
        if (ftpFiles.length > 5) {
          for (const f of ftpFiles.slice(5)) { await client.remove(f.name); }
        }
        client.close();
      } catch (ftpErr) {
        console.error('Manual FTP backup failed:', ftpErr.message);
      }
    }

    res.json({ success: true, filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
