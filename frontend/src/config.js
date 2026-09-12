const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Safely strip any trailing slashes to prevent double slashes (.app//posts)
export const API_URL = rawApiUrl.replace(/\/+$/, '');
