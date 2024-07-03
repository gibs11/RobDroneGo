import IPathOutDTO from '../../dto/out/IPathOutDTO';
import { Result } from '../../core/logic/Result';

export default interface IPathService {
  /**
   * Gets the path between two rooms.
   * @returns The path between two rooms.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 503 - Database error.
   * @param originFloorId
   * @param originRoomId
   * @param destinationFloorId
   * @param destinationRoomId
   */
  getLowestCostPath(
    originFloorId: string,
    originRoomId: string,
    destinationFloorId: string,
    destinationRoomId: string,
  ): Promise<Result<IPathOutDTO[]>>;
}
