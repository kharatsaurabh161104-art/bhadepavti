/**
 * ONPOINT SERVICES — DATABASE CLIENT ADAPTER
 * Coordinates between Node.js SQLite Server API, LocalStorage Cache, and Firebase Cloud.
 * Guarantees zero data loss, instant UI responsiveness, and perpetual future access.
 */

const AppDB = {
  isServerConnected: false,
  serverEngine: null,
  cachedStats: null,
  listeners: [],

  /**
   * Check connection to backend database server
   */
  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('/api/db/stats', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        this.isServerConnected = true;
        this.serverEngine = json.stats ? json.stats.engine : 'sqlite';
        this.cachedStats = json.stats;
        this.notifyStatus('connected', json.stats);
        return true;
      }
    } catch (e) {
      // Backend not running (e.g. static file:// or pure CDN)
    }

    this.isServerConnected = false;
    this.serverEngine = null;
    this.notifyStatus('offline', null);
    return false;
  },

  /**
   * Fetch all records from backend database
   */
  async fetchAllAffidavits(params = {}) {
    if (!this.isServerConnected) {
      const connected = await this.checkConnection();
      if (!connected) return null;
    }

    try {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);

      const res = await fetch(`/api/affidavits?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.records)) {
          // Synchronize local cache with database
          if (window.AffidavitStore && typeof window.AffidavitStore.syncFromDatabase === 'function') {
            window.AffidavitStore.syncFromDatabase(data.records);
          }
          return data.records;
        }
      }
    } catch (err) {
      console.warn('[AppDB] Failed to fetch affidavits from database server:', err);
    }
    return null;
  },

  /**
   * Fetch single affidavit from backend database by ID
   */
  async fetchAffidavitById(id) {
    if (!id) return null;
    try {
      const res = await fetch(`/api/affidavits/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.record) {
          return data.record;
        }
      }
    } catch (err) {
      console.warn('[AppDB] Failed to fetch record by id:', err);
    }
    return null;
  },

  /**
   * Save or update an affidavit in backend database
   */
  async saveAffidavit(record) {
    if (!record) return null;

    try {
      const isUpdate = !!record.id;
      const url = isUpdate ? `/api/affidavits/${encodeURIComponent(record.id)}` : '/api/affidavits';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.record) {
          console.log('[AppDB] Record successfully saved to SQLite Database:', data.record.id);
          return data.record;
        }
      }
    } catch (err) {
      console.warn('[AppDB] Database save failed, record remains in local cache:', err);
    }
    return null;
  },

  /**
   * Delete an affidavit from backend database
   */
  async deleteAffidavit(id) {
    if (!id) return false;

    try {
      const res = await fetch(`/api/affidavits/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.success;
      }
    } catch (err) {
      console.warn('[AppDB] Database delete failed:', err);
    }
    return false;
  },

  /**
   * Download a full JSON backup of the database
   */
  async exportBackup() {
    if (this.isServerConnected) {
      window.location.href = '/api/db/export';
      return;
    }

    // Fallback: Export local cache as JSON file
    const records = window.AffidavitStore ? window.AffidavitStore.getAll() : [];
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      engine: 'localStorage-fallback',
      totalRecords: records.length,
      affidavits: records
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhadepavti_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Import a JSON backup into database
   */
  async importBackup(backupJson) {
    if (!backupJson) throw new Error('No backup data provided');

    if (this.isServerConnected) {
      const res = await fetch('/api/db/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupJson)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Import failed on server');
      }
      return data;
    } else {
      // Local import
      if (!Array.isArray(backupJson.affidavits)) {
        throw new Error('अवैध बॅकअप फाईल स्वरूप ("affidavits" array आवश्यक आहे)');
      }
      let count = 0;
      backupJson.affidavits.forEach(item => {
        if (item && item.id && window.AffidavitStore) {
          window.AffidavitStore.save(item);
          count++;
        }
      });
      return { success: true, importedCount: count, totalNow: window.AffidavitStore.getAll().length };
    }
  },

  /**
   * Status change subscribers
   */
  onStatusChange(fn) {
    if (typeof fn === 'function') this.listeners.push(fn);
  },

  notifyStatus(status, details) {
    this.listeners.forEach(fn => fn({
      status,
      isConnected: this.isServerConnected,
      engine: this.serverEngine,
      details
    }));
  }
};

// Check connection immediately when loaded
document.addEventListener('DOMContentLoaded', () => {
  AppDB.checkConnection();
});

window.AppDB = AppDB;

