const TOKEN_KEY = 'necklogic_admin_token';
const USER_KEY = 'necklogic_admin_user';

export const sessionStorageService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  },
  getUserRaw(): string | null {
    return localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  },
  save(token: string, userJson: string, persist: boolean) {
    const target = persist ? localStorage : sessionStorage;
    const other = persist ? sessionStorage : localStorage;
    target.setItem(TOKEN_KEY, token);
    target.setItem(USER_KEY, userJson);
    other.removeItem(TOKEN_KEY);
    other.removeItem(USER_KEY);
  },
  updateUser(userJson: string) {
    const target = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    target.setItem(USER_KEY, userJson);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};