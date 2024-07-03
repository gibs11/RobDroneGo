import { Repo } from '../../core/infra/Repo';
import { Elevator } from '../../domain/elevator/elevator';
import { Floor } from '../../domain/floor/floor';

export default interface IElevatorRepo extends Repo<Elevator> {
  /**
   *  Saves an elevator
   *
   * @param elevator the elevator to be saved
   */
  save(elevator: Elevator): Promise<Elevator>;

  /**
   *
   * This method finds all elevators
   *
   */
  findAll(): Promise<Elevator[]>;

  /**
   *
   * This method finds an elevator by its domainId
   *
   * @param elevatorId  the domainId of the elevator to be found
   */
  findByDomainId(elevatorId: string): Promise<Elevator>;

  /**
   *
   * This method finds an elevator by its buildingCode
   *
   * @param buildingId the buildingId of the building to be found
   */
  findByBuildingId(buildingId: string): Promise<Elevator[]>;

  /**
   *
   * This method finds an elevator by its floorCode
   *
   * @param floorCode  the floorCode of the floor to be found
   */
  findAllByFloorID(floorCode: string): Promise<Elevator[]>;

  /**
   *
   * This method finds an elevator by its uniqueNumber
   *
   * @param uniqueNumber  the uniqueNumber of the elevator to be found
   * @param buildingId  the buildingCode of the building to be found
   */
  findByUniqueNumberInBuilding(uniqueNumber: number, buildingId: string): Promise<Elevator>;

  /**
   * Finds rooms by area
   *
   * @param initialX - Initial X position of the area
   * @param initialY - Initial Y position of the area
   * @param finalX - Final X position of the area
   * @param finalY - Final Y position of the area
   * @param floor - Floor where the area is located
   * @returns boolean - True if the area is available, false otherwise
   */
  checkIfElevatorExistInArea(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    floor: Floor,
  ): Promise<boolean>;
}
