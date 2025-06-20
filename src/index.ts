// src/index.ts

/**
 * @file This is the main entry point for the newgrounds-api package.
 * It exports the core Newgrounds class and all relevant interfaces and types
 * for interacting with the Newgrounds API.
 */

// Export the main Newgrounds API class from its dedicated file.
// This allows users to import it like: import { Newgrounds } from 'newgrounds-api';
export { Newgrounds } from './classes/Newgrounds'; // <--- Correct way: EXPORT from its file

// Export core interfaces directly related to the API's functionality.
export type { SearchOptions, AudioSearchResult } from './interfaces/search';
export type { AudioDetails } from './interfaces/audioDetails';

// Re-export all other general types and interfaces defined in the 'types' directory's index file.
export type { SearchSort } from './types/search';