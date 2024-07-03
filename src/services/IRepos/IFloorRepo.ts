import { Repo } from '../../core/infra/Repo';
import { Floor } from '../../domain/floor/floor';

export default interface IFloorRepo extends Repo<Floor> {
  /**
   * Saves a floor.
   * @param floor
   */
  save(floor: Floor): Promise<Floor>;

  /**
   * Finds a floor by its id.
   * @param floorId
   */
  findByDomainId(floorId: string): Promise<Floor>;

  /**
   * Finds all floors.
   */
  findAll(): Promise<Floor[]>;

  /**
   * Finds a floor by its floor number and building code.
   * @param floorNumber
   * @param buildingId
   */
  findByFloorNumberAndBuildingId(floorNumber: number, buildingId: string): Promise<Floor>;

  /**
   * Finds all floors for a certain building.
   * @param buildingId the building to find the floors for
   */
  findByBuildingId(buildingId: string): Promise<Floor[]>;

  /**
   * Finds all floors served by an elevator in a certain building.
   * @param buildingId the building to find the floors for
   */
  findFloorsWithElevatorByBuildingId(buildingId: string): Promise<Floor[]>;

  /**
   * Finds all floors served by at least a passage in a certain building.
   * @param buildingId the building to find the floors for
   */
  findFloorsWithPassageByBuildingId(buildingId: string): Promise<Floor[]>;

  /**
   * Finds a floor by its building code and floor number.
   * @param buildingCode the building code
   * @param floorNumber the floor number
   */
  findByBuildingCodeAndFloorNumber(buildingCode: string, floorNumber: number): Promise<Floor>;
}
