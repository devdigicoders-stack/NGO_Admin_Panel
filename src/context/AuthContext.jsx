import React, { createContext, useState, useEffect, useContext } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        credentials: 'include' // to send/receive cookies
      });
      const data = await res.json();
      if (data.success) {
        setAdmin(data.data);
      } else {
        setAdmin(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
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
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setAdmin(data.data);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, message: 'Update failed.' };
    }
  };

  const updatePrefs = async (prefs) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/prefs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefs }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setAdmin(data.data);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Update prefs error:', err);
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
      console.error('Avatar upload error:', err);
      return { success: false, message: err.message || 'Avatar upload failed.' };
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, updateProfile, updatePrefs, uploadAvatar, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
