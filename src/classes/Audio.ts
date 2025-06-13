import { Newgrounds } from "./Newgrounds";
import { AudioDetails } from "../interfaces/audioDetails";

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