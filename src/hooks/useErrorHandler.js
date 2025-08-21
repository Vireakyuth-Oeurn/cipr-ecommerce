import { useState, useCallback } from 'react';
import { showToast } from '../components/ui/simple-toast';

/**
 * Custom hook for centralized error handling
 * Provides consistent error management across components
 */
export function useErrorHandler() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, options = {}) => {
    console.error('Error:', error);
    
    const { 
      fallbackMessage = 'An unexpected error occurred',
      showToast: shouldShowToast = true
    } = options;
    
    let userMessage = fallbackMessage;
    
    // Handle string errors
    if (typeof error === 'string') {
      userMessage = error;
    }
    // Network errors
    else if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))) {
      userMessage = 'Network connection failed. Please check your internet connection.';
    }
    // CORS errors
    else if (error.message?.includes('CORS') || error.message?.includes('blocked')) {
      userMessage = 'API connection blocked. Running in offline mode.';
    }
    // 401 Unauthorized
    else if (error.response?.status === 401) {
      userMessage = 'Session expired. Please log in again.';
    }
    // 403 Forbidden
    else if (error.response?.status === 403) {
      userMessage = 'Access denied. You don\'t have permission for this action.';
    }
    // 404 Not Found
    else if (error.response?.status === 404) {
      userMessage = 'Requested resource not found.';
    }
    // 422 Validation Error
    else if (error.response?.status === 422) {
      userMessage = error.response.data?.message || error.response.data?.error || 'Validation failed. Please check your input.';
    }
    // 500 Server Error
    else if (error.response?.status >= 500) {
      userMessage = 'Server error. Please try again later.';
    }
    // API error with message
    else if (error.response?.data?.message) {
      userMessage = error.response.data.message;
    }
    // API error with error field
    else if (error.response?.data?.error) {
      userMessage = error.response.data.error;
    }
    // Generic error with message
    else if (error.message) {
      userMessage = error.message;
    }

    setError({
      message: userMessage,
      originalError: error,
      timestamp: new Date().toISOString(),
      canRetry: error.response?.status >= 500 || !error.response
    });

    // Show toast notification if requested
    if (shouldShowToast) {
      showToast(userMessage, 'error');
    }

    return userMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(async (asyncFunction, context = 'operation') => {
    try {
      setIsLoading(true);
      clearError();
      const result = await asyncFunction();
      return result;
    } catch (error) {
      handleError(error, { fallbackMessage: `Failed to ${context}` });
      throw error; // Re-throw for component-specific handling
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const retry = useCallback(async (asyncFunction, context = 'retry operation') => {
    return withErrorHandling(asyncFunction, context);
  }, [withErrorHandling]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling,
    retry,
    showToast // Export showToast for convenience
  };
}
