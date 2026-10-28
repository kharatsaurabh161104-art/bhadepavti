/**
 * ONPOINT SERVICES — FIREBASE FIRESTORE CLOUD DATABASE ADAPTER
 * Seamless dual-sync between Google Firebase Firestore and Browser LocalStorage.
 * Operates Local-First: instant UI responsiveness with asynchronous cloud sync.
 */

const CloudDB = {
  CONFIG_STORAGE_KEY: 'onpoint_firebase_config_v1',
  COLLECTION_NAME: 'affidavits',
  app: null,
  db: null,
  isInitialized: false,
  isOnline: navigator.onLine,
  listeners: [],

  /**
   * Get currently saved Firebase configuration
   */
  getConfig() {
    try {
      const raw = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse Firebase config:', e);
    }
    return null;
  },

  /**
   * Save Firebase configuration
   */
  saveConfig(configObj) {
    if (!configObj || typeof configObj !== 'object') {
      localStorage.removeItem(this.CONFIG_STORAGE_KEY);
      this.isInitialized = false;
      this.db = null;
      return false;
    }
    localStorage.setItem(this.CONFIG_STORAGE_KEY, JSON.stringify(configObj));
    return this.init();
  },

  /**
   * Remove config (disconnect)
   */
  disconnect() {
    localStorage.removeItem(this.CONFIG_STORAGE_KEY);
    this.isInitialized = false;
    this.db = null;
    this.notifyStatusChange('disconnected');
  },

  /**
   * Check if Firebase credentials are saved
   */
  isConfigured() {
    const config = this.getConfig();
    return !!(config && config.projectId && (config.apiKey || config.authDomain));
  },

  /**
   * Initialize Firebase SDK
   */
  init() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded on this page.');
      this.isInitialized = false;
      return false;
    }

    const config = this.getConfig();
    if (!config || !config.projectId) {
      this.isInitialized = false;
      return false;
    }

    try {
      // Check if app already initialized
      if (!firebase.apps.length) {
        this.app = firebase.initializeApp(config);
      } else {
        this.app = firebase.app();
      }

      this.db = firebase.firestore();
      this.isInitialized = true;
      console.log('Firebase Firestore initialized successfully for project:', config.projectId);
      this.notifyStatusChange('connected');
      return true;
    } catch (err) {
      console.error('Firebase initialization error:', err);
      this.isInitialized = false;
      this.notifyStatusChange('error', err.message);
      return false;
    }
  },

  /**
   * Save or update a record in Firestore
   */
  async saveRecord(record) {
    if (!this.isInitialized && !this.init()) {
      return false;
    }
    try {
      const docRef = this.db.collection(this.COLLECTION_NAME).doc(record.id);
      await docRef.set({
        ...record,
        syncedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Record synced to Cloud Firestore:', record.id);
      return true;
    } catch (err) {
      console.error('Error saving record to Firestore:', err);
      return false;
    }
  },

  /**
   * Delete a record from Firestore
   */
  async deleteRecord(id) {
    if (!this.isInitialized && !this.init()) {
      return false;
    }
    try {
      await this.db.collection(this.COLLECTION_NAME).doc(id).delete();
      console.log('Record deleted from Cloud Firestore:', id);
      return true;
    } catch (err) {
      console.error('Error deleting record from Firestore:', err);
      return false;
    }
  },

  /**
   * Fetch all records from Firestore and update localStorage
   */
  async fetchAll() {
    if (!this.isInitialized && !this.init()) {
      return null;
    }
    try {
      const snapshot = await this.db.collection(this.COLLECTION_NAME).get();
      const records = [];
      snapshot.forEach(doc => {
        records.push(doc.data());
      });
      // Sort descending by createdAt
      records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return records;
    } catch (err) {
      console.error('Error fetching records from Firestore:', err);
      return null;
    }
  },

  /**
   * Upload all local records to Firestore
   */
  async syncLocalToCloud() {
    if (!this.isInitialized && !this.init()) {
      throw new Error('Firebase नॉट कनेक्टेड आहे. कृपया आधी कॉन्फिग सेव्ह करा.');
    }

    const localRecords = window.AffidavitStore ? window.AffidavitStore.getAll() : [];
    if (!localRecords.length) {
      return { total: 0, synced: 0 };
    }

    const batch = this.db.batch();
    let count = 0;

    localRecords.forEach(rec => {
      if (rec && rec.id) {
        const ref = this.db.collection(this.COLLECTION_NAME).doc(rec.id);
        batch.set(ref, {
          ...rec,
          syncedAt: new Date().toISOString()
        }, { merge: true });
        count++;
      }
    });

    await batch.commit();
    return { total: localRecords.length, synced: count };
  },

  /**
   * Subscribe to real-time changes
   */
  subscribe(onUpdate) {
    if (!this.isInitialized && !this.init()) {
      return null;
    }
    try {
      return this.db.collection(this.COLLECTION_NAME).onSnapshot(snapshot => {
        const cloudRecords = [];
        snapshot.forEach(doc => {
          cloudRecords.push(doc.data());
        });
        cloudRecords.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        if (typeof onUpdate === 'function') {
          onUpdate(cloudRecords);
        }
      }, err => {
        console.warn('Firestore snapshot error:', err);
      });
    } catch (e) {
      console.warn('Failed to subscribe to Firestore:', e);
      return null;
    }
  },

  /**
   * Status change notifications
   */
  onStatusChange(fn) {
    if (typeof fn === 'function') {
      this.listeners.push(fn);
    }
  },

  notifyStatusChange(status, message = '') {
    this.listeners.forEach(fn => fn({ status, message, isConfigured: this.isConfigured() }));
  }
};

// Auto-initialize on load if config exists
document.addEventListener('DOMContentLoaded', () => {
  if (CloudDB.isConfigured()) {
    CloudDB.init();
  }
});

window.CloudDB = CloudDB;
