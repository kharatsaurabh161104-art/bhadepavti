const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./server/db');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Helper: Parse request body (JSON)
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    // Max 20MB limit (to handle photos easily)
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Helper: Send JSON response
function sendJson(res, statusCode, data, headers = {}) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    ...headers
  });
  res.end(json);
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURI(parsedUrl.pathname);

  // ==========================================
  // API ROUTES
  // ==========================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Database Stats
      if (pathname === '/api/db/stats' && req.method === 'GET') {
        const stats = db.getStats();
        return sendJson(res, 200, { success: true, stats });
      }

      // 2. Export Database Backup
      if (pathname === '/api/db/export' && req.method === 'GET') {
        const backup = db.exportBackup();
        const dateStr = new Date().toISOString().slice(0, 10);
        return sendJson(res, 200, backup, {
          'Content-Disposition': `attachment; filename="bhadepavti_backup_${dateStr}.json"`
        });
      }

      // 3. Import Database Backup
      if (pathname === '/api/db/import' && req.method === 'POST') {
        const body = await parseBody(req);
        const result = db.importBackup(body);
        return sendJson(res, 200, { success: true, ...result });
      }

      // 4. Auth: Login
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseBody(req);
        const user = db.verifyLogin(body.username, body.password);
        if (!user) {
          return sendJson(res, 401, {
            success: false,
            message: 'अवैध युझरनेम किंवा पासवर्ड! (Invalid username or password)'
          });
        }
        return sendJson(res, 200, {
          success: true,
          message: 'लॉगिन यशस्वी!',
          user
        });
      }

      // 5. Auth: Register / Add User
      if (pathname === '/api/auth/register' && req.method === 'POST') {
        const body = await parseBody(req);
        try {
          const newUser = db.createUser(body);
          return sendJson(res, 201, { success: true, user: newUser });
        } catch (err) {
          return sendJson(res, 400, { success: false, message: err.message });
        }
      }

      // 6. Affidavits: List all
      if (pathname === '/api/affidavits' && req.method === 'GET') {
        const q = parsedUrl.searchParams.get('q') || '';
        const from = parsedUrl.searchParams.get('from') || '';
        const to = parsedUrl.searchParams.get('to') || '';
        const records = db.getAllAffidavits({ q, from, to });
        return sendJson(res, 200, { success: true, count: records.length, records });
      }

      // 7. Affidavits: Create or Upsert
      if (pathname === '/api/affidavits' && req.method === 'POST') {
        const body = await parseBody(req);
        const saved = db.saveAffidavit(body);
        return sendJson(res, 201, { success: true, record: saved });
      }

      // 8. Affidavits: Specific ID operations (GET, PUT, DELETE)
      const affMatch = pathname.match(/^\/api\/affidavits\/([^/]+)$/);
      if (affMatch) {
        const id = decodeURIComponent(affMatch[1]);

        if (req.method === 'GET') {
          const rec = db.getAffidavitById(id);
          if (!rec) {
            return sendJson(res, 404, { success: false, message: 'भाडे करारनामा सापडला नाही (Not Found)' });
          }
          return sendJson(res, 200, { success: true, record: rec });
        }

        if (req.method === 'PUT') {
          const body = await parseBody(req);
          body.id = id;
          const updated = db.saveAffidavit(body);
          return sendJson(res, 200, { success: true, record: updated });
        }

        if (req.method === 'DELETE') {
          const deleted = db.deleteAffidavit(id);
          return sendJson(res, 200, { success: deleted, message: deleted ? 'हटवले गेले' : 'सापडले नाही' });
        }
      }

      return sendJson(res, 404, { success: false, message: 'API Route Not Found' });
    } catch (err) {
      console.error('[API Error]', err);
      return sendJson(res, 500, { success: false, message: 'Server Internal Error: ' + err.message });
    }
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(ROOT_DIR, reqPath);

  // Clean URLs support (e.g. /dashboard -> /dashboard.html)
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="mr">
        <head><title>४०४ — पान सापडले नाही</title><meta charset="utf-8"></head>
        <body style="font-family:sans-serif;text-align:center;padding:50px;">
          <h2>४०४ — पृष्ठ सापडले नाही (404 Page Not Found)</h2>
          <p><a href="/">मुख्य पृष्ठावर जा (Go to Home)</a></p>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n============================================================`);
  console.log(`✓ Onpoint Services भाडे पावती प्रणाली चालू झाली!`);
  console.log(`✓ Database Engine: ${db.engine.toUpperCase()}`);
  console.log(`✓ Server URL: http://localhost:${PORT}`);
  console.log(`✓ Login Credentials: @Onpoint_Services / Onpoint@123`);
  console.log(`============================================================\n`);
});

module.exports = server;

