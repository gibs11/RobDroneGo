import { Result } from '../core/logic/Result';
import ITaskSequenceDTO from '../dto/out/ITaskSequenceDTO';

export default interface ITaskGateway {
  /**
   * Retrieves the task sequence for a given robisep id.
   * @returns The response object.
   * @param robisepId - The ID of the robisep.
   * @param algorithm - The algorithm to use.
   */
  getTaskSequeceByRobisepId(robisepId: string, algorithm: string): Promise<Result<ITaskSequenceDTO>>;
}
