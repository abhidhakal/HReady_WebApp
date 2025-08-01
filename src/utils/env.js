// Environment detection for Vite
const isTest = import.meta.env.MODE === 'test';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '';
}
