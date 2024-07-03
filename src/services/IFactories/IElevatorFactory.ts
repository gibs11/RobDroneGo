import { Elevator } from '../../domain/elevator/elevator';

/**
 * Interface for the Elevator Factory.
 */
export default interface IElevatorFactory {
  /**
   * Creates a new elevator.
   *
   * @param raw The raw data to create the elevator.
   */
  createElevator(raw: any): Promise<Elevator>;
}
