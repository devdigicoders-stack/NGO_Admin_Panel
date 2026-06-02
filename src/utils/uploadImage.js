const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Upload image to backend (local storage).
 * @param {File} file
 * @param {'team'|'programs'|'profiles'|'testimonials'|'news'|'general'} category
 * @returns {Promise<{ url: string, fullUrl?: string }>}
 */
export async function uploadImage(file, category = 'general') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Upload failed');
  }
  return json.data;
}

/**
 * Upload admin profile avatar and update session.
 * @param {File} file
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/auth/avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Avatar upload failed');
  }
  return json.data;
}
