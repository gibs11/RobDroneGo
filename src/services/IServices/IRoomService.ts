import { Result } from '../../core/logic/Result';
import IRoomDTO from '../../dto/IRoomDTO';
import IRoomOutDTO from '../../dto/out/IRoomOutDTO';

export default interface IRoomService {
  /**
   * Create a new building floor.
   * @param roomDTO
   */
  createRoom(roomDTO: IRoomDTO): Promise<Result<IRoomOutDTO>>;

  /**
   * Lists all rooms.
   */
  listRooms(): Promise<IRoomOutDTO[]>;

  /**
   * Lists all rooms by floor.
   */
  listRoomsByFloor(floorId: string): Promise<Result<IRoomOutDTO[]>>;
}
