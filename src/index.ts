// src/index.ts

/**
 * @file This is the main entry point for the newgrounds-api package.
 * It exports the core Newgrounds class and all relevant interfaces and types
 * for interacting with the Newgrounds API.
 */

// Export the main Newgrounds API class from its dedicated file.
// This allows users to import it like: import { Newgrounds } from 'newgrounds-api';
export { Newgrounds } from './classes/Newgrounds';
export { Audio } from './classes/Audio';
export { Playlist } from './classes/Playlist';

// Export core interfaces directly related to the API's functionality.
export * from './interfaces/search';
export * from './interfaces/audioDetails';
export * from './interfaces/playlistDetails';
export * from './types/search';