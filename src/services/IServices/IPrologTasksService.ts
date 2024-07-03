import { Result } from '../../core/logic/Result';
import IPrologTasksDTO from '../../dto/IPrologTasksDTO';

export default interface IPrologTasksService {
  /**
   * This method obtains the approved tasks, associated to a certain Robisep.
   * @param robisepId The Robisep id.
   * @returns A promise with the result of the operation.
   */
  obtainApprovedTasks(robisepId: string): Promise<Result<IPrologTasksDTO>>;
}
