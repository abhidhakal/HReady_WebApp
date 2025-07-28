import { useState, useEffect, useCallback } from 'react';
import api from '/src/api/api.js';

/**
 * useApi - generic API data fetching hook
 * @param {Object} options
 *   url: string (required)
 *   method: string (default 'get')
 *   body: object (for POST/PUT)
 *   params: object (for query params)
 *   auto: boolean (auto-fetch on mount, default true)
 *   headers: object (optional headers)
 */
export function useApi({ url, method = 'get', body = null, params = null, auto = true, headers = {} }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (override = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.request({
        url: override.url || url,
        method: override.method || method,
        data: override.body || body,
        params: override.params || params,
        headers: { ...headers, ...override.headers },
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, method, body, params, headers]);

  useEffect(() => {
    if (auto) fetchData();
  }, [fetchData, auto]);

  return { data, loading, error, refetch: fetchData };
} 