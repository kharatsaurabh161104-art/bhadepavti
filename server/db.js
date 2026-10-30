const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// In serverless environments (e.g. Vercel, Netlify, AWS Lambda), root filesystem is read-only
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const DATA_DIR = isServerless 
  ? path.join(os.tmpdir(), 'bhadepavti-data')
  : path.resolve(__dirname, '..', 'data');

const SQLITE_FILE = path.join(DATA_DIR, 'bhadepavti.db');
const JSON_FILE = path.join(DATA_DIR, 'bhadepavti.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helpers using built-in crypto
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  // If stored in plain text (e.g. from legacy or direct edit), allow direct match
  if (!stored.includes(':')) {
    return stored === password;
  }
  const [salt, hash] = stored.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Default initial records to seed
const DEFAULT_DEMO_RECORDS = [
  {
    id: 'AFF-DEMO001',
    createdAt: '2026-10-25T10:30:00.000Z',
    tenantName: 'सौरभ अजिनाथ खरात',
    tenantAge: '२१',
    tenantFatherName: 'अजिनाथ खरात',
    tenantOccupation: 'विद्यार्थी / शिक्षण',
    tenantAadhaar: '७८९० १२३४ ५६७८',
    tenantAddress: 'मु. पो. चकोरे, ता. परांडा, जि. धाराशिव',
    tenantCollege: 'झील कॉलेज ऑफ इंजिनिअरिंग ॲण्ड रिसर्च, नऱ्हे, पुणे',
    tenantCourse: 'बी.टेक (रोबोटिक्स ॲण्ड ऑटोमेशन)',
    ownerName: 'सोमनाथ बबनराव सावंत',
    ownerAge: '४८',
    ownerOccupation: 'व्यवसाय',
    ownerAddress: 'फ्लॅट नं. ४०२, समर्थ रेसिडेन्सी, नऱ्हे, पुणे - ४११०४१',
    ownerMobile: '९८२२३३४४५५',
    academicYear: '२०२६-२०२७',
    propertyAddress: 'फ्लॅट नं. ४०२, समर्थ रेसिडेन्सी, नऱ्हे',
    propertyCity: 'पुणे',
    surveyNo: '४५/२',
    roomNo: '४०२',
    propertyArea: '५५० चौ. फूट',
    propertyConstruction: 'आर.सी.सी. बांधकाम',
    monthlyRent: '३५००',
    rentInWords: 'तीन हजार पाचशे',
    rentPaymentDay: '१०',
    rentStartDate: '2026-07-01',
    rentEndDate: '2027-05-31',
    rentDurationMonths: '११',
    agreementDate: '2026-07-01',
    executionPlace: 'पुणे',
    applicantPhoto: '',
    includeSwadhar: true
  },
  {
    id: 'AFF-DEMO002',
    createdAt: '2026-10-27T14:15:00.000Z',
    tenantName: 'तन्मय संजू पाटोळे',
    tenantAge: '१८',
    tenantFatherName: 'संजू सखाराम पाटोळे',
    tenantOccupation: 'विद्यार्थी',
    tenantAadhaar: '२१०० ४०३२ ००६६',
    tenantAddress: 'खोपोली, ता. खालापूर, जि. रायगड',
    tenantCollege: 'झील कॉलेज ऑफ इंजिनिअरिंग, नऱ्हे, पुणे',
    tenantCourse: 'बी.टेक (प्रथम वर्ष)',
    ownerName: 'रमेश पांडुरंग शिंदे',
    ownerAge: '५२',
    ownerOccupation: 'नोकरी',
    ownerAddress: 'घर नं. १२, शिवतीर्थ कॉलनी, कात्रज, पुणे - ४११०४६',
    ownerMobile: '९४०३८०६५१०',
    academicYear: '२०२६-२०२७',
    propertyAddress: 'खोली नं. २, शिवतीर्थ कॉलनी, कात्रज',
    propertyCity: 'पुणे',
    surveyNo: '३२/१',
    roomNo: '२',
    propertyArea: '२०० चौ. फूट',
    propertyConstruction: 'पक्के बांधकाम',
    monthlyRent: '३०००',
    rentInWords: 'तीन हजार',
    rentPaymentDay: '०५',
    rentStartDate: '2026-08-01',
    rentEndDate: '2027-06-30',
    rentDurationMonths: '११',
    agreementDate: '2026-08-01',
    executionPlace: 'पुणे',
    applicantPhoto: '',
    includeSwadhar: false
  }
];

class DatabaseManager {
  constructor() {
    this.engine = null; // 'sqlite' or 'json'
    this.sqliteDb = null;
    this.jsonData = null;
    this.init();
  }

  init() {
    try {
      const { DatabaseSync } = require('node:sqlite');
      this.sqliteDb = new DatabaseSync(SQLITE_FILE);
      this.engine = 'sqlite';
      this.initSqliteSchema();
      console.log(`[Database] SQLite Database active at ${SQLITE_FILE}`);
    } catch (err) {
      console.warn('[Database] SQLite unavailable, falling back to JSON file storage:', err.message);
      this.engine = 'json';
      this.initJsonStorage();
    }
    this.seedDefaults();
  }

  // ==========================================
  // SQLITE IMPLEMENTATION
  // ==========================================
  initSqliteSchema() {
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        role TEXT,
        created_at TEXT,
        last_login TEXT
      );

      CREATE TABLE IF NOT EXISTS affidavits (
        id TEXT PRIMARY KEY,
        tenant_name TEXT,
        owner_name TEXT,
        agreement_date TEXT,
        monthly_rent TEXT,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        created_by TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_aff_tenant ON affidavits(tenant_name);
      CREATE INDEX IF NOT EXISTS idx_aff_owner ON affidavits(owner_name);
      CREATE INDEX IF NOT EXISTS idx_aff_date ON affidavits(agreement_date);
      CREATE INDEX IF NOT EXISTS idx_aff_created ON affidavits(created_at);
    `);
  }

  // ==========================================
  // JSON FALLBACK IMPLEMENTATION
  // ==========================================
  initJsonStorage() {
    if (fs.existsSync(JSON_FILE)) {
      try {
        const raw = fs.readFileSync(JSON_FILE, 'utf8');
        this.jsonData = JSON.parse(raw);
      } catch (e) {
        console.error('[Database] Failed to read json db, creating new:', e);
        this.jsonData = { users: [], affidavits: [] };
      }
    } else {
      this.jsonData = { users: [], affidavits: [] };
      this.saveJsonFile();
    }
  }

  saveJsonFile() {
    try {
      const tempFile = JSON_FILE + '.tmp';
      fs.writeFileSync(tempFile, JSON.stringify(this.jsonData, null, 2), 'utf8');
      fs.renameSync(tempFile, JSON_FILE);
    } catch (err) {
      console.error('[Database] Failed to write json db:', err);
    }
  }

  // ==========================================
  // SEED DEFAULTS
  // ==========================================
  seedDefaults() {
    const adminUser = {
      id: 'USR-ADMIN-01',
      username: '@Onpoint_Services',
      password: hashPassword('Onpoint@123'),
      full_name: 'Onpoint Services Admin',
      role: 'Administrator',
      created_at: '2026-01-01T00:00:00.000Z',
      last_login: null
    };

    if (this.engine === 'sqlite') {
      const existingUser = this.sqliteDb.prepare('SELECT id FROM users WHERE username = ?').get(adminUser.username);
      if (!existingUser) {
        const stmt = this.sqliteDb.prepare(`
          INSERT INTO users (id, username, password, full_name, role, created_at, last_login)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(adminUser.id, adminUser.username, adminUser.password, adminUser.full_name, adminUser.role, adminUser.created_at, null);
        console.log('[Database] Seeded default admin user @Onpoint_Services');
      }

      const count = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM affidavits').get();
      if (count && count.count === 0) {
        DEFAULT_DEMO_RECORDS.forEach(rec => {
          this.saveAffidavit(rec, 'system');
        });
        console.log('[Database] Seeded default demo affidavits');
      }
    } else {
      const userExists = this.jsonData.users.find(u => u.username === adminUser.username);
      if (!userExists) {
        this.jsonData.users.push(adminUser);
      }
      if (this.jsonData.affidavits.length === 0) {
        this.jsonData.affidavits = [...DEFAULT_DEMO_RECORDS];
      }
      this.saveJsonFile();
    }
  }

  // ==========================================
  // AUTH / USER METHODS
  // ==========================================
  verifyLogin(username, password) {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();
    if (!trimmedUser || !trimmedPass) return null;

    let user = null;
    if (this.engine === 'sqlite') {
      const row = this.sqliteDb.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(trimmedUser);
      if (row) {
        user = {
          id: row.id,
          username: row.username,
          password: row.password,
          fullName: row.full_name,
          role: row.role,
          createdAt: row.created_at,
          lastLogin: row.last_login
        };
      }
    } else {
      const found = this.jsonData.users.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
      if (found) user = { ...found };
    }

    if (!user) return null;

    const isValid = verifyPassword(trimmedPass, user.password);
    if (!isValid) return null;

    // Update last login
    const now = new Date().toISOString();
    if (this.engine === 'sqlite') {
      this.sqliteDb.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);
    } else {
      user.last_login = now;
      this.saveJsonFile();
    }

    // Return safe user object (no password)
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.full_name || 'Admin',
      role: user.role || 'Administrator',
      lastLogin: now
    };
  }

  getUser(username) {
    if (this.engine === 'sqlite') {
      const row = this.sqliteDb.prepare('SELECT id, username, full_name, role, created_at, last_login FROM users WHERE LOWER(username) = LOWER(?)').get(username);
      if (!row) return null;
      return {
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        role: row.role,
        createdAt: row.created_at,
        lastLogin: row.last_login
      };
    } else {
      const found = this.jsonData.users.find(u => u.username.toLowerCase() === (username || '').toLowerCase());
      if (!found) return null;
      const { password, ...safe } = found;
      return safe;
    }
  }

  createUser({ username, password, fullName, role = 'User' }) {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();
    if (!trimmedUser || !trimmedPass) throw new Error('Username and password are required');

    const existing = this.getUser(trimmedUser);
    if (existing) throw new Error('User already exists');

    const id = 'USR-' + Date.now().toString(36).toUpperCase();
    const now = new Date().toISOString();
    const hashedPassword = hashPassword(trimmedPass);

    if (this.engine === 'sqlite') {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO users (id, username, password, full_name, role, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, trimmedUser, hashedPassword, fullName || trimmedUser, role, now, null);
    } else {
      this.jsonData.users.push({
        id,
        username: trimmedUser,
        password: hashedPassword,
        full_name: fullName || trimmedUser,
        role,
        created_at: now,
        last_login: null
      });
      this.saveJsonFile();
    }

    return { id, username: trimmedUser, fullName: fullName || trimmedUser, role, createdAt: now };
  }

  listUsers() {
    if (this.engine === 'sqlite') {
      const rows = this.sqliteDb.prepare('SELECT id, username, full_name, role, created_at, last_login FROM users ORDER BY created_at ASC').all();
      return rows.map(r => ({
        id: r.id,
        username: r.username,
        fullName: r.full_name,
        role: r.role,
        createdAt: r.created_at,
        lastLogin: r.last_login
      }));
    } else {
      return this.jsonData.users.map(({ password, ...rest }) => rest);
    }
  }

  // ==========================================
  // AFFIDAVIT CRUD METHODS
  // ==========================================
  getAllAffidavits({ q = '', from = '', to = '' } = {}) {
    let records = [];

    if (this.engine === 'sqlite') {
      const rows = this.sqliteDb.prepare('SELECT data FROM affidavits ORDER BY created_at DESC').all();
      records = rows.map(r => {
        try {
          return JSON.parse(r.data);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    } else {
      records = [...this.jsonData.affidavits];
      records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    // Apply filtering if provided
    const query = q.trim().toLowerCase();
    return records.filter(item => {
      const tName = (item.tenantName || '').toLowerCase();
      const oName = (item.ownerName || '').toLowerCase();
      const matchText = !query || tName.includes(query) || oName.includes(query);

      const recDate = item.agreementDate || (item.createdAt ? item.createdAt.slice(0, 10) : '');
      let matchDate = true;
      if (from && recDate && recDate < from) matchDate = false;
      if (to && recDate && recDate > to) matchDate = false;

      return matchText && matchDate;
    });
  }

  getAffidavitById(id) {
    if (!id) return null;

    if (this.engine === 'sqlite') {
      const row = this.sqliteDb.prepare('SELECT data FROM affidavits WHERE id = ?').get(id);
      if (!row) return null;
      try {
        return JSON.parse(row.data);
      } catch (e) {
        return null;
      }
    } else {
      return this.jsonData.affidavits.find(r => r.id === id) || null;
    }
  }

  saveAffidavit(recordData, createdBy = 'user') {
    if (!recordData) throw new Error('Record data is required');

    const now = new Date().toISOString();
    const id = recordData.id || ('AFF-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase());
    
    // Prepare full document record
    const record = {
      ...recordData,
      id,
      createdAt: recordData.createdAt || now,
      updatedAt: now,
      createdBy: recordData.createdBy || createdBy
    };

    const tenantName = (record.tenantName || '').trim();
    const ownerName = (record.ownerName || '').trim();
    const agreementDate = record.agreementDate || (record.createdAt ? record.createdAt.slice(0, 10) : '');
    const monthlyRent = (record.monthlyRent || '').toString();
    const dataJson = JSON.stringify(record);

    if (this.engine === 'sqlite') {
      const exists = this.sqliteDb.prepare('SELECT id FROM affidavits WHERE id = ?').get(id);
      if (exists) {
        const stmt = this.sqliteDb.prepare(`
          UPDATE affidavits 
          SET tenant_name = ?, owner_name = ?, agreement_date = ?, monthly_rent = ?, data = ?, updated_at = ?
          WHERE id = ?
        `);
        stmt.run(tenantName, ownerName, agreementDate, monthlyRent, dataJson, now, id);
      } else {
        const stmt = this.sqliteDb.prepare(`
          INSERT INTO affidavits (id, tenant_name, owner_name, agreement_date, monthly_rent, data, created_at, updated_at, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, tenantName, ownerName, agreementDate, monthlyRent, dataJson, record.createdAt, now, record.createdBy);
      }
    } else {
      const index = this.jsonData.affidavits.findIndex(r => r.id === id);
      if (index !== -1) {
        this.jsonData.affidavits[index] = record;
      } else {
        this.jsonData.affidavits.unshift(record);
      }
      this.saveJsonFile();
    }

    return record;
  }

  deleteAffidavit(id) {
    if (!id) return false;

    if (this.engine === 'sqlite') {
      const info = this.sqliteDb.prepare('DELETE FROM affidavits WHERE id = ?').run(id);
      return info.changes > 0;
    } else {
      const initial = this.jsonData.affidavits.length;
      this.jsonData.affidavits = this.jsonData.affidavits.filter(r => r.id !== id);
      this.saveJsonFile();
      return this.jsonData.affidavits.length < initial;
    }
  }

  // ==========================================
  // STATS & BACKUP/RESTORE
  // ==========================================
  getStats() {
    let totalAffidavits = 0;
    let totalUsers = 0;
    let monthAffidavits = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const all = this.getAllAffidavits();
    totalAffidavits = all.length;
    monthAffidavits = all.filter(r => {
      const d = new Date(r.createdAt || r.agreementDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;

    totalUsers = this.listUsers().length;

    let sizeBytes = 0;
    const targetFile = this.engine === 'sqlite' ? SQLITE_FILE : JSON_FILE;
    if (fs.existsSync(targetFile)) {
      sizeBytes = fs.statSync(targetFile).size;
    }

    return {
      engine: this.engine,
      engineLabel: this.engine === 'sqlite' ? 'SQLite Enterprise Engine (Built-in)' : 'JSON File Database',
      dbFile: path.basename(targetFile),
      dbPath: targetFile,
      sizeBytes,
      totalAffidavits,
      monthAffidavits,
      totalUsers,
      status: 'active',
      nodeVersion: process.version
    };
  }

  exportBackup() {
    const affidavits = this.getAllAffidavits();
    const users = this.listUsers();
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      engine: this.engine,
      totalRecords: affidavits.length,
      users,
      affidavits
    };
  }

  importBackup(backupData) {
    if (!backupData || !Array.isArray(backupData.affidavits)) {
      throw new Error('Invalid backup data format. "affidavits" array expected.');
    }

    let importedCount = 0;
    backupData.affidavits.forEach(rec => {
      if (rec && rec.id) {
        this.saveAffidavit(rec, rec.createdBy || 'import');
        importedCount++;
      }
    });

    return {
      success: true,
      importedCount,
      totalNow: this.getAllAffidavits().length
    };
  }
}

// Export singleton instance
const dbInstance = new DatabaseManager();
module.exports = dbInstance;

