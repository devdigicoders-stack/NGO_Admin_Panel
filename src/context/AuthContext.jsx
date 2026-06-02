import React, { createContext, useState, useEffect, useContext } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE;
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getToken = () => localStorage.getItem('admin_token');
const saveToken = (t) => {
  localStorage.setItem('admin_token', t);
  console.log('✓ Token saved to localStorage:', t?.substring(0, 20) + '...');
};
const clearToken = () => {
  localStorage.removeItem('admin_token');
  console.log('✓ Token cleared from localStorage');
};

const authHeaders = () => {
  const t = getToken();
  if (t) {
    console.log('📤 Sending Bearer token:', t.substring(0, 20) + '...');
  }
  return t ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type': 'application/json' };
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async (retries = 3) => {
    const token = getToken();
    console.log(`📥 fetchProfile (retry: ${4 - retries}/3) - Token exists:`, !!token);
    
    if (!token) {
      console.log('⚠️  No token found, skipping profile fetch');
      setLoading(false);
      return;
    }
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        console.log('⏱️  Profile fetch timeout (15s)');
      }, 15000);
      
      console.log(`🔄 Fetching profile from ${API_BASE_URL}/auth/profile`);
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: authHeaders(),
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      console.log('📡 Profile response status:', res.status, res.statusText);
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ Profile fetched successfully');
        setAdmin(data.data);
      } else {
        console.error('❌ Profile fetch failed:', data.message);
        clearToken();
        setAdmin(null);
      }
      setLoading(false);
    } catch (err) {
      console.error('⚠️  Profile fetch error:', err.message);
      if (retries > 1) {
        console.log(`🔄 Retrying... (${4 - retries}/3)`);
        await new Promise(r => setTimeout(r, 2000));
        return fetchProfile(retries - 1);
      }
      console.error('❌ Profile fetch failed after all retries');
      setAdmin(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ Login successful');
        if (data.data?.token) {
          console.log('💾 Token received in response');
          saveToken(data.data.token);
        } else {
          console.warn('⚠️  No token in login response');
        }
        setAdmin(data.data);
        return { success: true };
      }
      console.error('❌ Login failed:', data.message);
      return { success: false, message: data.message };
    } catch (err) {
      console.error('❌ Login error:', err);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out...');
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
