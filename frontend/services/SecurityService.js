class SecurityService {
  constructor() {
    this.tokenKey = 'sselfie_auth_token';
    this.refreshTokenKey = 'sselfie_refresh_token';
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
  }

  // Token Management
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
    this.startTokenRefreshTimer();
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setRefreshToken(token) {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.stopTokenRefreshTimer();
  }

  // Session Management
  startSession() {
    this.resetSessionTimer();
    document.addEventListener('mousemove', this.resetSessionTimer);
    document.addEventListener('keypress', this.resetSessionTimer);
  }

  resetSessionTimer = () => {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    this.sessionTimer = setTimeout(this.handleSessionTimeout, this.sessionTimeout);
  }

  handleSessionTimeout = () => {
    this.clearTokens();
    window.location.href = '/login?session=expired';
  }

  stopSession() {
    document.removeEventListener('mousemove', this.resetSessionTimer);
    document.removeEventListener('keypress', this.resetSessionTimer);
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
  }

  // Token Refresh Logic
  startTokenRefreshTimer() {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const timeUntilRefresh = expiryTime - Date.now() - this.refreshThreshold;

      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(this.refreshToken, timeUntilRefresh);
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }

  stopTokenRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (!refreshToken) {
        this.handleSessionTimeout();
        return;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token, newRefreshToken } = await response.json();
      this.setToken(token);
      this.setRefreshToken(newRefreshToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.handleSessionTimeout();
    }
  }
}

export const securityService = new SecurityService();