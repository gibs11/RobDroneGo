import { Room } from '../../domain/room/Room';

export default interface IRoomFactory {
  /**
   * Creates a new floor.
   * @param raw
   */
  createRoom(raw: any): Promise<Room>;
}
