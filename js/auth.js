/**
 * ONPOINT SERVICES — AUTH MODULE
 * Authentication is verified by the Express API against the MongoDB users collection.
 */

const AUTH_CONFIG = {
  STORAGE_KEY: 'onpoint_services_session',
  REDIRECT_LOGIN: 'index.html',
  REDIRECT_DASHBOARD: 'dashboard.html',
};

const Auth = {
  async login(username, password) {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedUser || !trimmedPass) {
      return {
        success: false,
        message: 'कृपया युझरनेम आणि पासवर्ड टाका (Please enter username and password)',
      };
    }

    if (!window.ApiDB) {
      return { success: false, message: 'API client not loaded. Please refresh the page.' };
    }

    try {
      const data = await window.ApiDB.login(trimmedUser, trimmedPass);
      const user = data.user || {};

      const sessionData = {
        id: user.id || null,
        username: user.username || trimmedUser,
        name: user.name || user.username || trimmedUser,
        role: user.role || 'Administrator',
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'लॉगिन त्रुटी (Login failed)',
      };
    }
  },

  logout() {
    if (window.ApiDB) window.ApiDB.logout();
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
    window.location.href = AUTH_CONFIG.REDIRECT_LOGIN;
  },

  isAuthenticated() {
    try {
      const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      if (!parsed || !parsed.username) return false;
      return !!(window.ApiDB && window.ApiDB.getToken());
    } catch (_err) {
      return false;
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (_err) {
      return null;
    }
  },

  protectRoute() {
    if (!this.isAuthenticated()) {
      window.location.href = AUTH_CONFIG.REDIRECT_LOGIN;
    }
  },

  redirectIfLoggedIn() {
    if (this.isAuthenticated()) {
      window.location.href = AUTH_CONFIG.REDIRECT_DASHBOARD;
    }
  },
};

window.Auth = Auth;
