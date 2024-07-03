import { Passage } from '../../domain/passage/passage';
import { Floor } from '../../domain/floor/floor';

export default interface IPassageBuilder {
  /**
   * Builds a passage.
   */
  build(): Promise<Passage>;
  withStartPointFloor(floor: Floor): IPassageBuilder;
  withEndPointFloor(floor: Floor): IPassageBuilder;
  withPassageDTO(raw: any): IPassageBuilder;
}
