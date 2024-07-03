import { Floor } from '../floor/floor';
import { Result } from '../../core/logic/Result';

export default interface IDoorPositionChecker {
  /**
   * Check if the chosen position is valid to place a door
   * To be valid, a door can't be placed facing the outside of the building and can't be placed facing another room
   *
   * @param initialX - room's initial x coordinate
   * @param initialY - room's initial y coordinate
   * @param finalX - room's final x coordinate
   * @param finalY - room's final y coordinate
   * @param doorX - door's x coordinate
   * @param doorY - door's y coordinate
   * @param doorOrientation - door's orientation
   * @param floor - floor that the room is in
   *
   */
  isPositionValid(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    doorX: number,
    doorY: number,
    doorOrientation: string,
    floor: Floor,
  ): Promise<Result<boolean>>;
}
