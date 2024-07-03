import { Result } from '../core/logic/Result';
import IPathDTO from '../dto/IPathDTO';

export default interface IPathGateway {
  /**
   * Gets the path between two rooms.
   * @returns The response object.
   * @param originFlorId
   * @param originCell
   * @param destinationFloorId
   * @param destinationCell
   */
  getLowestCostPath(
    originFlorId: string,
    originCell: string,
    destinationFloorId: string,
    destinationCell: string,
  ): Promise<Result<IPathDTO>>;
}
