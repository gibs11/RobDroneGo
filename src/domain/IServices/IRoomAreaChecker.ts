import { Floor } from '../floor/floor';
import { Result } from '../../core/logic/Result';

export default interface IRoomAreaChecker {
  /**
   * Finds rooms, elevators and passages in a given area
   *
   * @param initialX - Initial X position of the area
   * @param initialY - Initial Y position of the area
   * @param finalX - Final X position of the area
   * @param finalY - Final Y position of the area
   * @param doorX - X position of the door
   * @param doorY - Y position of the door
   * @param doorOrientation - Orientation of the door
   * @param floor - Floor where the area is located
   * @returns boolean - True if the area is available, false otherwise
   */
  checkIfAreaIsAvailableForRoom(
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
