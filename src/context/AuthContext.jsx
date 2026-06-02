import React, { createContext, useState, useEffect, useContext } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE;
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getToken = () => localStorage.getItem('admin_token');
const saveToken = (t) => localStorage.setItem('admin_token', t);
const clearToken = () => localStorage.removeItem('admin_token');

const authHeaders = () => {
  const t = getToken();
  return t ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type': 'application/json' };
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async (retries = 3) => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: authHeaders(),
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.success) setAdmin(data.data);
      else { clearToken(); setAdmin(null); }
      setLoading(false);
    } catch (err) {
      if (retries > 1) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchProfile(retries - 1);
      }
      console.error('Error fetching profile:', err);
      setAdmin(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        if (data.data?.token) saveToken(data.data.token);
        setAdmin(data.data);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearToken();
      setAdmin(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) { setAdmin(data.data); return { success: true }; }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Update failed.' };
    }
  };

  const updatePrefs = async (prefs) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/prefs`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ prefs }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) { setAdmin(data.data); return { success: true }; }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Update failed.' };
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const { uploadAvatar: uploadAvatarFile } = await import('../utils/uploadImage');
      const data = await uploadAvatarFile(file);
      setAdmin(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message || 'Avatar upload failed.' };
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, updateProfile, updatePrefs, uploadAvatar, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
