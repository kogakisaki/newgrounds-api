import { PlaylistDetails } from "../interfaces/playlistDetails.js";
import { Newgrounds } from "./Newgrounds.js";

/**
 * Represents a Newgrounds playlist.
 */
export class Playlist {
  readonly ng: Newgrounds;
  data: PlaylistDetails;
  constructor(ng: Newgrounds, data: PlaylistDetails) {
    this.ng = ng;
    this.data = data;
  }
}