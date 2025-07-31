// Environment detection
const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

export function getApiBaseUrl() {
  return isTest ? process.env.VITE_API_BASE_URL : import.meta.env.VITE_API_BASE_URL || '';
}
