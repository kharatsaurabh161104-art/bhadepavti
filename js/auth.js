/**
 * ONPOINT SERVICES — AUTH MODULE
 * Connected to SQLite Database with offline fallback and session management.
 */

const AUTH_CONFIG = {
  VALID_USER: '@Onpoint_Services',
  VALID_PASS: 'Onpoint@123',
  STORAGE_KEY: 'onpoint_services_session',
  REDIRECT_LOGIN: 'index.html',
  REDIRECT_DASHBOARD: 'dashboard.html'
};

const Auth = {
  /**
   * Attempt login against SQLite Database API (with offline fallback)
   */
  async login(username, password) {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, message: 'कृपया युझरनेम आणि पासवर्ड टाका (Please enter username and password)' };
    }

    // 1. Try Server Database Login
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const sessionData = {
          id: data.user.id,
          username: data.user.username,
          name: data.user.fullName || data.user.name || 'Admin',
          role: data.user.role || 'Administrator',
          loginTime: new Date().toISOString(),
          isDatabaseAuth: true
        };
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
        return { success: true, user: sessionData };
      } else {
        return {
          success: false,
          message: data.message || 'अवैध युझरनेम किंवा पासवर्ड! (Invalid username or password)'
        };
      }
    } catch (err) {
      console.warn('[Auth] Server API login not reachable, attempting offline fallback:', err.message);
    }

    // 2. Offline Fallback for default credentials or static preview
    if (trimmedUser === AUTH_CONFIG.VALID_USER && trimmedPass === AUTH_CONFIG.VALID_PASS) {
      const sessionData = {
        username: trimmedUser,
        name: 'Onpoint Services Admin',
        role: 'Administrator',
        loginTime: new Date().toISOString(),
        isDatabaseAuth: false,
        offlineMode: true
      };
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }

    return { 
      success: false, 
      message: 'अवैध युझरनेम किंवा पासवर्ड! (Invalid username or password)' 
    };
  },

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
    window.location.href = AUTH_CONFIG.REDIRECT_LOGIN;
  },

  /**
   * Check if current session exists
   */
  isAuthenticated() {
    try {
      const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return !!(parsed && parsed.username);
    } catch (e) {
      return false;
    }
  },

  /**
   * Get current session user data
   */
  getUser() {
    try {
      const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Guard for protected pages (dashboard.html, create-affidavit.html)
   */
  protectRoute() {
    if (!this.isAuthenticated()) {
      window.location.href = AUTH_CONFIG.REDIRECT_LOGIN;
    }
  },

  /**
   * Guard for login page (redirects to dashboard if already logged in)
   */
  redirectIfLoggedIn() {
    if (this.isAuthenticated()) {
      window.location.href = AUTH_CONFIG.REDIRECT_DASHBOARD;
    }
  }
};

window.Auth = Auth;
