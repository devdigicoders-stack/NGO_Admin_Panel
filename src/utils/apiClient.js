// Use relative /api in dev (Vite proxy → localhost:5002), full URL in production build
const API_BASE = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE;


export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message?.includes('Unauthorized') || data.message?.includes('Session token')) {
        console.log('❌ Token invalid/expired - redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        return { success: false, message: 'Session expired. Please login again.' };
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: err.message || 'Network error' };
  }
};
