import IFloorMapOutDTO from '../../dto/out/IFloorMapOutDTO';
import { Floor } from '../../domain/floor/floor';

export default interface IFloorMapGenerator {
  /**
   * Calculates the map of a certain floor.
   * @param floor the floor that the map belongs to.
   */
  calculateFloorMap(floor: Floor): Promise<IFloorMapOutDTO>;
}
