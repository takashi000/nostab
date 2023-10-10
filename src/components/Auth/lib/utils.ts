export const storage = {
  getToken: () => JSON.parse(window.sessionStorage.getItem('token') || 'null'),
  setToken: (token: string) =>
    window.sessionStorage.setItem('token', JSON.stringify(token)),
  clearToken: () => window.sessionStorage.removeItem('token'),
};
