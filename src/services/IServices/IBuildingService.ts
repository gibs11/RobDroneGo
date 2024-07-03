import { Result } from '../../core/logic/Result';
import IBuildingDTO from '../../dto/IBuildingDTO';

export default interface IBuildingService {
  /**
   * Creates a new building.
   * @param buildingDTO the buildingDTO to create a new building
   */
  createBuilding(buildingDTO: IBuildingDTO): Promise<Result<IBuildingDTO>>;

  /**
   * Lists all buildings.
   */
  listBuildings(): Promise<IBuildingDTO[]>;

  /**
   * Edits a building.
   * @param id the building id to edit
   * @param buildingDTO contains the building data to edit
   */
  editBuilding(id: string, buildingDTO: IBuildingDTO): Promise<Result<IBuildingDTO>>;

  /**
   * Verifies if a building exists with the given buildingCode.
   * @param buildingId the buildingCode to check if it exists
   */
  verifyBuildingExists(buildingId: string): Promise<Result<boolean>>;

  /**
   * Finds all buildings with the given min and max floors.
   * @param minFloors
   * @param maxFloors
   */
  listBuildingsWithMinAndMaxFloors(minFloors: number, maxFloors: number): Promise<IBuildingDTO[]>;
}
