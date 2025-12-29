/**
 * Centralized error handling for API errors
 * Uses the new APIError class from errors.ts
 */

import { handleAPIError, isNetworkError, getErrorMessage, APIError } from './errors';
import { Alert } from 'react-native';

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  redirectToLogin?: boolean;
  onError?: (error: APIError) => void;
}

/**
 * Handle API errors with user-friendly messages and actions
 * This is a wrapper around handleAPIError from errors.ts that adds UI feedback
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): APIError {
  const apiError = handleAPIError(error);
  const {
    showAlert = true,
    redirectToLogin = true,
    onError,
  } = options;

  // Call custom error handler if provided
  if (onError) {
    onError(apiError);
    return apiError;
  }

  // Handle specific error codes
  switch (apiError.status) {
    case 401:
      if (redirectToLogin) {
        // Navigate to login screen
        // You'll need to implement navigation based on your setup
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to login
                // RootNavigation.navigate('Login');
              },
            },
          ]
        );
      }
      break;

    case 403:
      if (showAlert) {
        Alert.alert('Access Denied', 'You do not have permission to perform this action.');
      }
      break;

    case 404:
      if (showAlert) {
        Alert.alert('Not Found', apiError.message || 'The requested resource was not found.');
      }
      break;

    case 500:
    case 502:
    case 503:
      if (showAlert) {
        Alert.alert(
          'Server Error',
          'Something went wrong on our end. Please try again later.',
          [
            {
              text: 'Retry',
              onPress: () => {
                // Retry logic can be handled by caller
              },
            },
            { text: 'OK' },
          ]
        );
      }
      break;

    default:
      if (showAlert) {
        Alert.alert('Error', apiError.message || 'An unexpected error occurred.');
      }
  }

  return apiError;
}

// Re-export utilities from errors.ts for backward compatibility
export { isNetworkError, getErrorMessage } from './errors';

