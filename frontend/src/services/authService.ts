import api from '../services/api';

interface LoginPayload {
  username: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<string> {
  const response = await api.post('/api/auth/login', payload);
  const token = response.data.access_token;
  try {
    const payloadPart = token.split('.')[1];
    if (payloadPart) {
      const decoded = JSON.parse(window.atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
      if (decoded.role) localStorage.setItem('user_role', decoded.role);
    }
  } catch {}
  return token;
}

export async function signup(payload: { username: string; password: string; role: string }): Promise<void> {
  await api.post('/api/auth/signup', payload);
}

export async function switchRole(role: 'Analyst' | 'Manager' | 'Admin'): Promise<string> {
  const accounts: Record<string, string> = {
    Analyst: 'analyst_user',
    Manager: 'manager_user',
    Admin: 'admin_user',
  };
  const username = accounts[role] || 'analyst_user';
  const token = await login({ username, password: 'password123' });
  localStorage.setItem('token', token);
  localStorage.setItem('user_role', role);
  return token;
}
