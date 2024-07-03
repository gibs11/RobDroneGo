import { Result } from '../../core/logic/Result';
import IFloorDTO from '../../dto/IFloorDTO';
import IFloorOutDTO from '../../dto/out/IFloorOutDTO';
import IFloorMapOutDTO from '../../dto/out/IFloorMapOutDTO';

export default interface IFloorService {
  /**
   * Create a new building floor.
   * @param floorDTO the floor data.
   */
  createBuildingFloor(floorDTO: IFloorDTO): Promise<Result<IFloorOutDTO>>;

  /**
   * List all floors for a certain building.
   * @param buildingId the building that the floors belong to.
   */
  listBuildingFloors(buildingId: string): Promise<Result<IFloorOutDTO[]>>;

  /**
   * Update a certain floor.
   * Either the floor number and/or the floor description can be updated.
   * @param floorId the floor to be updated.
   * @param floorDTO the floor new data - floor number and/or floor description and/or floor plan.
   */
  updateBuildingFloor(floorId: string, floorDTO: IFloorDTO): Promise<Result<IFloorOutDTO>>;

  /**
   * List all floors served by an elevator in a certain building.
   * @param buildingId the building that the floors belong to.
   */
  listFloorsWithElevatorByBuildingId(buildingId: string): Promise<Result<IFloorOutDTO[]>>;

  /**
   * List all floors served by at least a passage in a certain building.
   * @param buildingId the building that the floors belong to.
   */
  listFloorsWithPassageByBuildingId(buildingId: string): Promise<Result<IFloorOutDTO[]>>;

  /**
   * List all floors (no parameters needed).
   */
  listFloors(): Promise<IFloorOutDTO[]>;

  /**
   * Retrieves the map of a certain floor.
   * @param buildingCode the building that the floor belongs to.
   * @param floorNumber the floor that the map belongs to.
   */
  getFloorMap(buildingCode: string, floorNumber: number): Promise<Result<IFloorMapOutDTO>>;
}
