require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { connectDB, disconnectDB } = require('./server/db');
const { seedAdmin } = require('./server/seed');
const authRoutes = require('./server/routes/auth');
const affidavitRoutes = require('./server/routes/affidavits');
const dbRoutes = require('./server/routes/db');

const app = express();
const ROOT_DIR = __dirname;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/affidavits', affidavitRoutes);
app.use('/api/db', dbRoutes);

app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
app.use('/js', express.static(path.join(ROOT_DIR, 'js')));
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));

const PAGES = {
  '/': 'index.html',
  '/index': 'index.html',
  '/index.html': 'index.html',
  '/dashboard': 'dashboard.html',
  '/dashboard.html': 'dashboard.html',
  '/create-affidavit': 'create-affidavit.html',
  '/create-affidavit.html': 'create-affidavit.html',
};

app.get(Object.keys(PAGES), (req, res) => {
  res.sendFile(path.join(ROOT_DIR, PAGES[req.path]));
});

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error('[API Error]', err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large. Images are not accepted or stored.',
    });
  }

  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({
      success: false,
      message: first ? first.message : 'Validation failed',
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate record id or username' });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

async function start() {
  await connectDB();
  await seedAdmin();

  const PORT = Number(process.env.PORT) || 3000;
  return app.listen(PORT, () => {
    console.log(`[Server] Onpoint Services running at http://localhost:${PORT}`);
    console.log(`[Server] MongoDB database: ${mongoose.connection.name}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[Startup Error]', err.message);
    process.exit(1);
  });
}

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { app, start };
