import { Newgrounds } from "./Newgrounds.js";
import { AudioDetails } from "../interfaces/audioDetails.js";

/**
 * Represents an audio object
 * @class Audio
 */
export class Audio {
  readonly ng: Newgrounds;
  data: AudioDetails;
  constructor(
    ng: Newgrounds,
    data: AudioDetails
  ) {
    this.ng = ng;
    this.data = data;
  }

  async get_reviews() {}
}