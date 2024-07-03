import { Repo } from '../../core/infra/Repo';
import { Room } from '../../domain/room/Room';
import { RoomID } from '../../domain/room/RoomID';
import { Floor } from '../../domain/floor/floor';

export default interface IRoomRepo extends Repo<Room> {
  /**
   * Saves a room
   *
   * @param room - Room to save
   * @returns Room - Saved room
   */
  save(room: Room): Promise<Room>;

  /**
   * Checks if a room exists
   *
   * @param roomId - Room ID
   * @returns boolean - True if the room exists, false otherwise
   */
  findByDomainId(roomId: RoomID | string): Promise<Room>;

  /**
   * Finds a room by its name
   *
   * @param name - Name of the room
   * @returns Room | null - Room if found, null otherwise
   */
  findByName(name: string): Promise<Room>;

  /**
   * Checks if a cell is available
   *
   * @param xPosition - X position of the cell
   * @param yPosition - Y position of the cell
   * @param floor - Floor where the cell is located
   * @returns boolean - True if the cell is available, false otherwise
   */
  checkCellAvailability(xPosition: number, yPosition: number, floor: Floor): Promise<boolean>;

  /**
   * Finds rooms by area
   *
   * @param initialX - Initial X position of the area
   * @param initialY - Initial Y position of the area
   * @param finalX - Final X position of the area
   * @param finalY - Final Y position of the area
   * @param floor - Floor where the area is located
   * @returns boolean - True if the area is available, false otherwise
   */
  checkIfRoomExistInArea(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    floor: Floor,
  ): Promise<boolean>;

  /**
   * Lists all rooms
   */
  findAll(): Promise<Room[]>;

  /**
   * Finds rooms by floor
   *
   * @param floorId - ID of the floor
   * @returns Room[] - List of rooms
   */
  findByFloorId(floorId: string): Promise<Room[]>;
}
