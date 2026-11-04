/**
 * ONPOINT SERVICES — MONGODB API CLIENT
 * All persistent data is stored in MongoDB through the Express API.
 */

const ApiDB = {
  TOKEN_KEY: 'onpoint_api_token',
  BASE_URL: '',

  getToken() {
    try {
      return localStorage.getItem(this.TOKEN_KEY) || '';
    } catch (_err) {
      return '';
    }
  },

  setToken(token) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (_err) {
      // ignore storage errors
    }
  },

  clearToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (_err) {
      // ignore storage errors
    }
  },

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${this.BASE_URL}${path}`, {
      ...options,
      headers,
    });

    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_err) {
        data = null;
      }
    }

    if (response.status === 401 && path !== '/api/auth/login') {
      this.clearToken();
      localStorage.removeItem('onpoint_services_session');
      if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
      }
    }

    if (!response.ok || (data && data.success === false)) {
      throw new Error((data && data.message) || `Request failed (${response.status})`);
    }

    return data;
  },

  async login(username, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data && data.token) this.setToken(data.token);
    return data;
  },

  logout() {
    this.clearToken();
  },

  async fetchAll(params = {}) {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const data = await this.request(`/api/affidavits${suffix}`);
    return data && Array.isArray(data.records) ? data.records : [];
  },

  async getById(id) {
    const data = await this.request(`/api/affidavits/${encodeURIComponent(id)}`);
    return data ? data.record : null;
  },

  async save(record) {
    const data = await this.request('/api/affidavits', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    return data ? data.record : null;
  },

  async remove(id) {
    const data = await this.request(`/api/affidavits/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return !!(data && data.success);
  },

  async stats() {
    const data = await this.request('/api/db/stats');
    return data ? data.stats : null;
  },

  async exportBackup() {
    const token = this.getToken();
    const response = await fetch(`${this.BASE_URL}/api/db/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error('बॅकअप डाऊनलोड अयशस्वी (Backup download failed)');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhadepavti_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importBackup(json) {
    const data = await this.request('/api/db/import', {
      method: 'POST',
      body: JSON.stringify(json),
    });
    return data;
  },
};

window.ApiDB = ApiDB;
