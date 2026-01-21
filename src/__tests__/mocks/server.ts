/**
 * MSW Server Setup for Integration Tests
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the server with default handlers
export const server = setupServer(...handlers);

// Re-export handlers for individual test customization
export { handlers, errorHandlers } from './handlers';
