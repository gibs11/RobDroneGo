import { Result } from '../../core/logic/Result';
import IPassageDTO from '../../dto/IPassageDTO';
import IPassageOutDTO from '../../dto/out/IPassageOutDTO';

export default interface IPassageService {
  /**
   * Creates a new passage.
   *
   * @param passageDTO - The passage data transfer object.
   * @returns The result of the operation.
   */
  createPassage(passageDTO: IPassageDTO): Promise<Result<IPassageOutDTO>>;
  /**
   * Lists all passages between two buildings.
   * @param firstBuildingId
   * @param lastBuildingId
   * @returns The result of the operation.
   */
  listPassagesBetweenBuildings(firstBuildingId: string, lastBuildingId: string): Promise<Result<IPassageOutDTO[]>>;

  /**
   * Lists all passages.
   * @returns The result of the operation.
   */
  listPassages(): Promise<Result<IPassageOutDTO[]>>;

  /**
   * Edits a passage.
   * @param passageId - The passage id to edit.
   * @param passageDTO - The passage data transfer object.
   * @returns The result of the operation.
   */
  editPassage(passageId: string, passageDTO: IPassageDTO): Promise<Result<IPassageOutDTO>>;
}
