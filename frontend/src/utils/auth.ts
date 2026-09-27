export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}

export function getUserRole(): string {
  const storedRole = localStorage.getItem('user_role');
  if (storedRole) return storedRole;
  const token = getToken();
  if (!token) return '';
  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = window.atob(base64);
    const obj = JSON.parse(decoded);
    return obj.role || '';
  } catch {
    return '';
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user_role');
}
