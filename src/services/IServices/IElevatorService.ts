import { Result } from '../../core/logic/Result';
import IElevatorDTO from '../../dto/IElevatorDTO';
import IElevatorOutDTO from '../../dto/out/IElevatorOutDTO';

export default interface IRoleService {
  /**
   * Creates a new elevator.
   *
   * @param elevatorDTO The raw data to create the elevator.
   */
  createElevator(elevatorDTO: IElevatorDTO): Promise<Result<IElevatorOutDTO>>;

  /**
   * Updates an elevator.
   *
   * @param elevatorId The elevator id.
   * @param elevatorDTO The raw data to update the elevator.
   */
  updateElevator(elevatorId: string, elevatorDTO: IElevatorDTO): Promise<Result<IElevatorOutDTO>>;

  /**
   * Lists all elevators from a building.
   *
   * @param buildingId The building id.
   */
  listElevatorsFromBuilding(buildingId: string): Promise<Result<IElevatorOutDTO[]>>;

  /**
   * Lists all elevators.
   */
  listAllElevators(): Promise<Result<IElevatorOutDTO[]>>;
}
