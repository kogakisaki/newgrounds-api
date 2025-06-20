import { SearchSort } from "../types/search.js";

/**
 * @interface SearchOptions
 * @description Search options
 */
export interface SearchOptions {
  page?: number;
  sort_by?: SearchSort;
}

/**
 * @interface AudioSearchResult
 * @description Describes the data structure of an audio search result from Newgrounds.
 */
export interface AudioSearchResult {
  /**
   * @property {string} title - The title of the audio track.
   */
  title: string;

  /**
   * @property {string} link - The full URL to the audio track's page on Newgrounds.
   */
  link: string;

  /**
   * @property {string} id - The unique ID of the audio track (often extracted from the link).
   */
  id: string;

  /**
   * @property {string} thumbnail - The URL of the thumbnail image for the audio track.
   */
  thumbnail: string;

  /**
   * @property {string} artist - The name of the artist or author of the audio track.
   */
  artist: string;

  /**
   * @property {string} short_description - A brief description or snippet of the audio track.
   */
  short_description: string;

  /**
   * @property {string} [type] - The type of the audio track (e.g., "Song", "Loop", "Soundtrack"). Optional.
   */
  type?: string;

  /**
   * @property {string} [genre] - The musical genre of the audio track (e.g., "Electronic", "Rock"). Optional.
   */
  genre?: string;

  /**
   * @property {number | null} views - The number of views the audio track has.
   * Can be `null` if it cannot be extracted or converted to a number.
   */
  views: number | null; // Changed: Added `| null`

  /**
   * @property {number | null} score - The rating score of the audio track.
   * Can be `null` if it cannot be extracted or converted to a number.
   */
  score: number | null; // Changed: Added `| null` and removed `?` as `| null` already implies optionality for a numeric value.
}
