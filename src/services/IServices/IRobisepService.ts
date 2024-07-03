import IRobisepDTO from '../../dto/IRobisepDTO';
import IRobisepOutDTO from '../../dto/out/IRobisepOutDTO';
import { Result } from '../../core/logic/Result';

export default interface IRobisepService {
  /**
   * Creates a new robisepType.
   * @param robisepDTO - The DTO containing the data to be used to create the robisepType.
   * @returns The response object, with 201 status code if successful.
   **/
  createRobisep(robisepDTO: IRobisepDTO): Promise<Result<IRobisepOutDTO>>;

  /**
   * Lists all robisepTypes.
   * @returns The response object, with 200 status code if successful.
   */
  listRobiseps(): Promise<IRobisepOutDTO[]>;

  /**
   * Disables a robisepType.
   * @param id - The id of the robisepType to disable.
   * @param robisepDTO - The DTO containing the data to be used to disable the robisepType.
   * @returns The response object
   */
  disableRobisep(id: string, robisepDTO: IRobisepDTO): Promise<Result<IRobisepOutDTO>>;

  /**
   * Lists all robisepTypes by designation or taskType.
   * @param designation - The designation of the robisepType to search for.
   * @param taskType - The taskType of the robisepType to search for.
   * @returns The response object, with 200 status code if successful.
   */
  listRobisepsByNicknameOrTaskType(
    designation: string | null,
    taskType: string[] | null,
  ): Promise<Result<IRobisepOutDTO[]>>;
}
