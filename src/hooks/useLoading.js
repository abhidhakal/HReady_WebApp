import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 * Provides better UX patterns for loading states
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [loadingStates, setLoadingStates] = useState({});

  // Set loading state
  const setLoadingState = useCallback((state) => {
    setLoading(state);
  }, []);

  // Set specific loading state (for multiple operations)
  const setSpecificLoading = useCallback((key, state) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: state
    }));
  }, []);

  // Check if specific operation is loading
  const isSpecificLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  // Execute async function with loading state
  const withLoading = useCallback(async (asyncFn, loadingKey = null) => {
    try {
      if (loadingKey) {
        setSpecificLoading(loadingKey, true);
      } else {
        setLoadingState(true);
      }
      
      const result = await asyncFn();
      
      return result;
    } finally {
      if (loadingKey) {
        setSpecificLoading(loadingKey, false);
      } else {
        setLoadingState(false);
      }
    }
  }, [setLoadingState, setSpecificLoading]);

  // Execute async function with loading state and error handling
  const withLoadingAndError = useCallback(async (asyncFn, onError = null, loadingKey = null) => {
    try {
      if (loadingKey) {
        setSpecificLoading(loadingKey, true);
      } else {
        setLoadingState(true);
      }
      
      const result = await asyncFn();
      return { success: true, data: result };
    } catch (error) {
      if (onError) {
        onError(error);
      }
      return { success: false, error };
    } finally {
      if (loadingKey) {
        setSpecificLoading(loadingKey, false);
      } else {
        setLoadingState(false);
      }
    }
  }, [setLoadingState, setSpecificLoading]);

  // Reset all loading states
  const resetLoading = useCallback(() => {
    setLoading(false);
    setLoadingStates({});
  }, []);

  return {
    loading,
    loadingStates,
    setLoading: setLoadingState,
    setSpecificLoading,
    isSpecificLoading,
    withLoading,
    withLoadingAndError,
    resetLoading
  };
};

export default useLoading; 