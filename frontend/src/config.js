const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_URL = rawApiUrl.replace(/\/+$/, '');

console.log('--- API DEBUG ---');
console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL);
console.log('Resolved API_URL:', API_URL);
console.log('-----------------');
