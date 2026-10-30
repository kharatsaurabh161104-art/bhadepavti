const db = require('../server/db');

// Helper: Parse request body
function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    let body = '';
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

module.exports = async (req, res) => {
  // CORS Preflight
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

  try {
    // 1. Database Stats
    if (pathname.endsWith('/api/db/stats') && req.method === 'GET') {
      const stats = db.getStats();
      return sendJson(res, 200, { success: true, stats });
    }

    // 2. Export Backup
    if (pathname.endsWith('/api/db/export') && req.method === 'GET') {
      const backup = db.exportBackup();
      const dateStr = new Date().toISOString().slice(0, 10);
      return sendJson(res, 200, backup, {
        'Content-Disposition': `attachment; filename="bhadepavti_backup_${dateStr}.json"`
      });
    }

    // 3. Import Backup
    if (pathname.endsWith('/api/db/import') && req.method === 'POST') {
      const body = await parseBody(req);
      const result = db.importBackup(body);
      return sendJson(res, 200, { success: true, ...result });
    }

    // 4. Auth: Login
    if (pathname.endsWith('/api/auth/login') && req.method === 'POST') {
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

    // 5. Auth: Register
    if (pathname.endsWith('/api/auth/register') && req.method === 'POST') {
      const body = await parseBody(req);
      try {
        const newUser = db.createUser(body);
        return sendJson(res, 201, { success: true, user: newUser });
      } catch (err) {
        return sendJson(res, 400, { success: false, message: err.message });
      }
    }

    // 6. Affidavits: List all
    if (pathname.endsWith('/api/affidavits') && req.method === 'GET') {
      const q = parsedUrl.searchParams.get('q') || '';
      const from = parsedUrl.searchParams.get('from') || '';
      const to = parsedUrl.searchParams.get('to') || '';
      const records = db.getAllAffidavits({ q, from, to });
      return sendJson(res, 200, { success: true, count: records.length, records });
    }

    // 7. Affidavits: Create or Upsert
    if (pathname.endsWith('/api/affidavits') && req.method === 'POST') {
      const body = await parseBody(req);
      const saved = db.saveAffidavit(body);
      return sendJson(res, 201, { success: true, record: saved });
    }

    // 8. Affidavits: Single ID routes
    const affMatch = pathname.match(/\/api\/affidavits\/([^/]+)$/);
    if (affMatch) {
      const id = decodeURIComponent(affMatch[1]);

      if (req.method === 'GET') {
        const rec = db.getAffidavitById(id);
        if (!rec) {
          return sendJson(res, 404, { success: false, message: 'भाडे करारनामा सापडला नाही' });
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

    return sendJson(res, 404, { success: false, message: 'API Route Not Found: ' + pathname });
  } catch (err) {
    console.error('[Vercel API Error]', err);
    return sendJson(res, 500, { success: false, message: 'Server Internal Error: ' + err.message });
  }
};
