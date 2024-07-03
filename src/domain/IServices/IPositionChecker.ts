import { Floor } from '../floor/floor';

export default interface IPositionChecker {
  /**
   * Check if the position is available in the floor
   *
   * @param coordinateX - The X coordinate
   * @param coordinateY - The Y coordinate
   * @param floor - The floor
   * @param id - The id of the entity
   * @returns A promise that resolves to true if the position is available, false otherwise
   */
  isPositionAvailable(coordinateX: number, coordinateY: number, floor: Floor, id: string): Promise<boolean>;
}
