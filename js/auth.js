/**
 * ONPOINT SERVICES — AUTH MODULE
 * Simple client-side auth for demo purposes.
 * Production notes: requires server-side session management, bcrypt hashing, and HTTP-only cookies.
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
   * Attempt login
   */
  login(username, password) {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, message: 'कृपया युझरनेम आणि पासवर्ड टाका (Please enter username and password)' };
    }

    if (trimmedUser === AUTH_CONFIG.VALID_USER && trimmedPass === AUTH_CONFIG.VALID_PASS) {
      const sessionData = {
        username: trimmedUser,
        name: 'Onpoint Services Admin',
        role: 'Administrator',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
      return { success: true };
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
      return !!(parsed && parsed.username === AUTH_CONFIG.VALID_USER);
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
