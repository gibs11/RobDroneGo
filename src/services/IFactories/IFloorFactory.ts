import { Floor } from '../../domain/floor/floor';

export default interface IFloorFactory {
  /**
   * Creates a new floor.
   * @param raw
   * @returns {Promise<Floor>}
   * @throws {TypeError}
   */
  createFloor(raw: any): Promise<Floor>;
}
