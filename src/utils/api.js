// Utilities for connecting the React frontend to the Flask backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function getAuthToken() {
  return localStorage.getItem('token');
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach auth header if available
  const auth = getAuthHeaders();
  if (auth.Authorization) headers.Authorization = auth.Authorization;

  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const err = new Error(body?.message || 'Error en la petición');
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export async function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name, email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function isAuthenticated() {
  // Quick client-side check: token exists and not expired (optional: verify with server)
  const token = getAuthToken();
  if (!token) return false;

  // Optional: do a lightweight check of token expiry (decode payload)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (exp && Date.now() / 1000 > exp) {
      // token expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  } catch (e) {
    // If token can't be decoded, consider it invalid
    return false;
  }

  return true;
}

export default {
  API_URL,
  getAuthHeaders,
  apiFetch,
  login,
  register,
  isAuthenticated,
};
